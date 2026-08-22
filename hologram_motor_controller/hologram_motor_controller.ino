/*
 * =====================================================
 *   HOLOGRAM MOTOR CONTROLLER — ESP32 Firmware
 *   Fusion5 Project
 * =====================================================
 *  Hardware:
 *    - ESP32 Dev Board
 *    - 2x A2212 Brushless Motor + ESC
 *      Fan 1 ESC → GPIO 18
 *      Fan 2 ESC → GPIO 19
 *    - 3x HC-SR04 Ultrasonic Sensors
 *      Sensor 1: TRIG→25, ECHO→26
 *      Sensor 2: TRIG→27, ECHO→14
 *      Sensor 3: TRIG→32, ECHO→33
 *
 *  Libraries required (install via Arduino Library Manager):
 *    - ESPAsyncWebServer  (by me-no-dev)
 *    - AsyncTCP           (by me-no-dev)
 *    - ArduinoJson        (by Benoit Blanchon, v6.x)
 * =====================================================
 */

#include <ArduinoJson.h>
#include <AsyncTCP.h>
#include <ESP32Servo.h>
#include <ESPAsyncWebServer.h>
#include <WiFi.h>

// ─── WiFi AP Credentials ──────────────────────────────
const char *AP_SSID = "HOLOGRAM MOTOR CONTROLLER";
const char *AP_PASSWORD = "12345678";

// ─── ESC / Motor Pins ─────────────────────────────────
#define ESC1_PIN 18
#define ESC2_PIN 19

// ─── Ultrasonic Sensor Pins ───────────────────────────
#define TRIG1 25
#define ECHO1 26
#define TRIG2 27
#define ECHO2 14
#define TRIG3 32
#define ECHO3 33

// ─── ESC PWM Parameters (A2212 / Standard ESC) ────────
#define ESC_MIN_US 1000 // 1000 µs = 0% throttle (arm position)
#define ESC_MAX_US 2000 // 2000 µs = 100% throttle
#define ESC_FREQ 50     // 50 Hz standard RC signal

// ─── Safety Defaults ──────────────────────────────────
#define DEFAULT_SAFETY_DIST_CM 100  // 1 metre default detection range
#define SENSOR_READ_INTERVAL_MS 100 // sensor polling rate

// ─── Server & WebSocket ───────────────────────────────
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// ─── Motor State ──────────────────────────────────────
struct MotorState {
  bool running = false;
  int throttle = 0; // 0–100 %
};

MotorState motor[2]; // motor[0] = Fan1, motor[1] = Fan2

Servo esc[2];

// ─── Sensor State ─────────────────────────────────────
struct SensorState {
  bool enabled = true;
  float distanceCm = 999.0f;
  float thresholdCm = DEFAULT_SAFETY_DIST_CM;
};

SensorState sensor[3];

// ─── Safety State ─────────────────────────────────────
bool safetyOverride = false; // if true, ignore sensor warnings
bool allSensorsOff = false;  // master sensor disable

// ─── Timing ───────────────────────────────────────────
unsigned long lastSensorRead = 0;
unsigned long lastBroadcast = 0;
#define BROADCAST_INTERVAL_MS 200

// ════════════════════════════════════════════════════════
//  ULTRASONIC HELPERS
// ════════════════════════════════════════════════════════
float readUltrasonic(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 30000); // 30 ms timeout
  if (duration == 0)
    return 999.0f; // out of range
  return (duration * 0.034f) / 2.0f;
}

bool isSafeToStart() {
  if (safetyOverride || allSensorsOff)
    return true;
  for (int i = 0; i < 3; i++) {
    if (sensor[i].enabled && sensor[i].distanceCm < sensor[i].thresholdCm) {
      return false;
    }
  }
  return true;
}

// ════════════════════════════════════════════════════════
//  ESC / MOTOR HELPERS
// ════════════════════════════════════════════════════════
int throttleToMicros(int pct) {
  // pct 0–100 maps to ESC_MIN–ESC_MAX µs
  return ESC_MIN_US + (int)((float)pct / 100.0f * (ESC_MAX_US - ESC_MIN_US));
}

void applyMotorState(int idx) {
  if (!motor[idx].running) {
    esc[idx].writeMicroseconds(ESC_MIN_US);
  } else {
    esc[idx].writeMicroseconds(throttleToMicros(motor[idx].throttle));
  }
}

void stopAllMotors() {
  for (int i = 0; i < 2; i++) {
    motor[i].running = false;
    applyMotorState(i);
  }
}

// ════════════════════════════════════════════════════════
//  ESC ARMING SEQUENCE
//  Required by most ESCs at power-on:
//  Send max signal → then min signal to arm
// ════════════════════════════════════════════════════════
void armESCs() {
  Serial.println("[ESC] Arming sequence start…");
  esc[0].writeMicroseconds(ESC_MAX_US);
  esc[1].writeMicroseconds(ESC_MAX_US);
  delay(2000);
  esc[0].writeMicroseconds(ESC_MIN_US);
  esc[1].writeMicroseconds(ESC_MIN_US);
  delay(2000);
  Serial.println("[ESC] Armed and ready.");
}

// ════════════════════════════════════════════════════════
//  JSON BROADCAST
// ════════════════════════════════════════════════════════
void broadcastState() {
  StaticJsonDocument<512> doc;

  // Motors
  JsonArray motors = doc.createNestedArray("motors");
  for (int i = 0; i < 2; i++) {
    JsonObject m = motors.createNestedObject();
    m["running"] = motor[i].running;
    m["throttle"] = motor[i].throttle;
  }

  // Sensors
  JsonArray sensors = doc.createNestedArray("sensors");
  for (int i = 0; i < 3; i++) {
    JsonObject s = sensors.createNestedObject();
    s["enabled"] = sensor[i].enabled;
    s["distanceCm"] = sensor[i].distanceCm;
    s["thresholdCm"] = sensor[i].thresholdCm;
  }

  // Safety
  doc["safetyOverride"] = safetyOverride;
  doc["allSensorsOff"] = allSensorsOff;
  doc["safeToStart"] = isSafeToStart();

  // Triggering sensor index (-1 = none)
  int trigSensor = -1;
  if (!safetyOverride && !allSensorsOff) {
    for (int i = 0; i < 3; i++) {
      if (sensor[i].enabled && sensor[i].distanceCm < sensor[i].thresholdCm) {
        trigSensor = i;
        break;
      }
    }
  }
  doc["triggeringSensor"] = trigSensor;

  String json;
  serializeJson(doc, json);
  ws.textAll(json);
}

// ════════════════════════════════════════════════════════
//  WEBSOCKET MESSAGE HANDLER
// ════════════════════════════════════════════════════════
void handleWsMessage(void *arg, uint8_t *data, size_t len) {
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, data, len);
  if (err) {
    Serial.print("[WS] JSON parse error: ");
    Serial.println(err.c_str());
    return;
  }

  const char *cmd = doc["cmd"];
  if (!cmd)
    return;

  // ── Both fans ON / OFF ────────────────────────────
  if (strcmp(cmd, "bothOn") == 0) {
    if (!isSafeToStart())
      return;
    for (int i = 0; i < 2; i++) {
      motor[i].running = true;
      applyMotorState(i);
    }
  } else if (strcmp(cmd, "bothOff") == 0) {
    stopAllMotors();
  }

  // ── Individual fan ON / OFF ───────────────────────
  else if (strcmp(cmd, "fanOn") == 0) {
    if (!isSafeToStart())
      return;
    int idx = doc["fan"];
    if (idx < 0 || idx > 1)
      return;
    motor[idx].running = true;
    applyMotorState(idx);
  } else if (strcmp(cmd, "fanOff") == 0) {
    int idx = doc["fan"];
    if (idx < 0 || idx > 1)
      return;
    motor[idx].running = false;
    applyMotorState(idx);
  }

  // ── Throttle ──────────────────────────────────────
  else if (strcmp(cmd, "setThrottle") == 0) {
    int idx = doc["fan"];
    int pct = doc["throttle"];
    if (idx < 0 || idx > 1 || pct < 0 || pct > 100)
      return;
    motor[idx].throttle = pct;
    if (motor[idx].running)
      applyMotorState(idx);
  }

  // ── Safety Override ───────────────────────────────
  else if (strcmp(cmd, "setOverride") == 0) {
    safetyOverride = (bool)doc["value"];
    // If override turned off and sensor unsafe → stop motors
    if (!safetyOverride && !isSafeToStart()) {
      stopAllMotors();
    }
  }

  // ── All Sensors On/Off ────────────────────────────
  else if (strcmp(cmd, "setAllSensors") == 0) {
    allSensorsOff = !(bool)doc["value"]; // value true = sensors active
    if (!isSafeToStart())
      stopAllMotors();
  }

  // ── Individual Sensor Enable/Disable ─────────────
  else if (strcmp(cmd, "setSensor") == 0) {
    int idx = doc["sensor"];
    bool en = doc["enabled"];
    if (idx < 0 || idx > 2)
      return;
    sensor[idx].enabled = en;
    if (!isSafeToStart())
      stopAllMotors();
  }

  // ── Sensor Threshold ─────────────────────────────
  else if (strcmp(cmd, "setThreshold") == 0) {
    int idx = doc["sensor"];
    float thr = doc["threshold"];
    if (idx < 0 || idx > 2 || thr < 5 || thr > 400)
      return;
    sensor[idx].thresholdCm = thr;
    if (!isSafeToStart())
      stopAllMotors();
  }

  broadcastState();
}

// ════════════════════════════════════════════════════════
//  WEBSOCKET EVENT HANDLER
// ════════════════════════════════════════════════════════
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client,
               AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
  case WS_EVT_CONNECT:
    Serial.printf("[WS] Client #%u connected from %s\n", client->id(),
                  client->remoteIP().toString().c_str());
    broadcastState();
    break;
  case WS_EVT_DISCONNECT:
    Serial.printf("[WS] Client #%u disconnected\n", client->id());
    break;
  case WS_EVT_DATA:
    handleWsMessage(arg, data, len);
    break;
  case WS_EVT_ERROR:
    Serial.printf("[WS] Error(%u): %s\n", client->id(), (char *)data);
    break;
  default:
    break;
  }
}

// ════════════════════════════════════════════════════════
//  EMBEDDED WEB UI  (stored in PROGMEM to save RAM)
// ════════════════════════════════════════════════════════
const char INDEX_HTML[] PROGMEM =
    "\n"
    "<!DOCTYPE html>\n"
    "<html lang=\"en\">\n"
    "<head>\n"
    "<meta charset=\"UTF-8\"/>\n"
    "<meta name=\"viewport\" "
    "content=\"width=device-width,initial-scale=1.0\"/>\n"
    "<title>HOLOGRAM MOTOR CONTROLLER</title>\n"
    "<meta name=\"description\" content=\"Fusion5 Hologram Fan Motor "
    "Controller - Real-time ESP32 Web Dashboard\"/>\n"
    "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"/>\n"
    "<link "
    "href=\"https://fonts.googleapis.com/"
    "css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap\" "
    "rel=\"stylesheet\"/>\n"
    "<style>\n"
    "  :root{\n"
    "    --bg:          #080c14;\n"
    "    --glass:       rgba(255,255,255,0.06);\n"
    "    --glass-border:rgba(255,255,255,0.12);\n"
    "    --glass-hover: rgba(255,255,255,0.10);\n"
    "    --accent:      #4f8eff;\n"
    "    --accent2:     #a259ff;\n"
    "    --danger:      #ff4f6a;\n"
    "    --warning:     #ffa940;\n"
    "    --success:     #39d98a;\n"
    "    --text:        #e8eaf0;\n"
    "    --text-muted:  #7a8099;\n"
    "    --radius:      20px;\n"
    "    --radius-sm:   12px;\n"
    "  }\n"
    "  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n"
    "  html{scroll-behavior:smooth}\n"
    "  body{\n"
    "    font-family:'Inter',system-ui,sans-serif;\n"
    "    background:var(--bg);\n"
    "    color:var(--text);\n"
    "    min-height:100vh;\n"
    "    overflow-x:hidden;\n"
    "  }\n"
    "\n"
    "  /* ── Animated background ── */\n"
    "  body::before{\n"
    "    content:'';\n"
    "    position:fixed;inset:0;\n"
    "    background:\n"
    "      radial-gradient(ellipse 80% 60% at 20% 10%, rgba(79,142,255,0.12) "
    "0%,transparent 60%),\n"
    "      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(162,89,255,0.10) "
    "0%,transparent 60%),\n"
    "      radial-gradient(ellipse 50% 40% at 50% 50%, rgba(57,217,138,0.04) "
    "0%,transparent 70%);\n"
    "    pointer-events:none;\n"
    "    z-index:0;\n"
    "    animation:bgPulse 8s ease-in-out infinite alternate;\n"
    "  }\n"
    "  @keyframes bgPulse{\n"
    "    0%{opacity:.7}100%{opacity:1}\n"
    "  }\n"
    "\n"
    "  /* ── Grid / Layout ── */\n"
    "  .wrapper{position:relative;z-index:1;max-width:1280px;margin:0 "
    "auto;padding:24px 20px 60px;}\n"
    "\n"
    "  /* ── Glass Card ── */\n"
    "  .glass{\n"
    "    background:var(--glass);\n"
    "    border:1px solid var(--glass-border);\n"
    "    border-radius:var(--radius);\n"
    "    backdrop-filter:blur(24px) saturate(180%);\n"
    "    -webkit-backdrop-filter:blur(24px) saturate(180%);\n"
    "    box-shadow:\n"
    "      0 8px 32px rgba(0,0,0,0.4),\n"
    "      inset 0 1px 0 rgba(255,255,255,0.10),\n"
    "      inset 0 -1px 0 rgba(255,255,255,0.04);\n"
    "    transition:box-shadow .25s,border-color .25s;\n"
    "  }\n"
    "  .glass:hover{\n"
    "    border-color:rgba(255,255,255,0.18);\n"
    "    box-shadow:0 12px 40px rgba(0,0,0,0.5),inset 0 1px 0 "
    "rgba(255,255,255,0.14);\n"
    "  }\n"
    "\n"
    "  /* ── Header ── */\n"
    "  header{\n"
    "    display:flex;align-items:center;justify-content:space-between;\n"
    "    padding:20px 28px;margin-bottom:24px;\n"
    "  }\n"
    "  .brand{display:flex;align-items:center;gap:14px}\n"
    "  .brand-icon{\n"
    "    width:46px;height:46px;border-radius:14px;\n"
    "    background:linear-gradient(135deg,var(--accent),var(--accent2));\n"
    "    display:flex;align-items:center;justify-content:center;\n"
    "    font-size:22px;\n"
    "    box-shadow:0 4px 16px rgba(79,142,255,0.4);\n"
    "  }\n"
    "  .brand-name{\n"
    "    font-size:18px;font-weight:800;letter-spacing:.5px;\n"
    "    background:linear-gradient(90deg,#fff,var(--accent));\n"
    "    -webkit-background-clip:text;-webkit-text-fill-color:transparent;\n"
    "  }\n"
    "  "
    ".brand-sub{font-size:11px;color:var(--text-muted);letter-spacing:2px;text-"
    "transform:uppercase;margin-top:1px}\n"
    "\n"
    "  /* ── Connection badge ── */\n"
    "  .conn-badge{\n"
    "    display:flex;align-items:center;gap:8px;\n"
    "    padding:8px 16px;border-radius:50px;\n"
    "    font-size:13px;font-weight:600;letter-spacing:.3px;\n"
    "    transition:all .3s;\n"
    "  }\n"
    "  .conn-badge.connected{\n"
    "    background:rgba(57,217,138,0.15);\n"
    "    border:1px solid rgba(57,217,138,0.3);\n"
    "    color:var(--success);\n"
    "  }\n"
    "  .conn-badge.disconnected{\n"
    "    background:rgba(255,79,106,0.15);\n"
    "    border:1px solid rgba(255,79,106,0.3);\n"
    "    color:var(--danger);\n"
    "  }\n"
    "  .conn-dot{\n"
    "    width:8px;height:8px;border-radius:50%;\n"
    "    animation:pulse 1.6s ease-in-out infinite;\n"
    "  }\n"
    "  .connected .conn-dot{background:var(--success);box-shadow:0 0 8px "
    "var(--success)}\n"
    "  .disconnected .conn-dot{background:var(--danger);box-shadow:0 0 8px "
    "var(--danger);animation:none}\n"
    "  @keyframes "
    "pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale("
    ".8)}}\n"
    "\n"
    "  /* ── Safety Banner ── */\n"
    "  .safety-banner{\n"
    "    padding:18px 24px;margin-bottom:20px;\n"
    "    "
    "display:flex;align-items:center;justify-content:space-between;gap:16px;\n"
    "    border-radius:var(--radius);\n"
    "    transition:all .4s;\n"
    "  }\n"
    "  .safety-banner.safe{\n"
    "    background:rgba(57,217,138,0.08);border-color:rgba(57,217,138,0.25);\n"
    "  }\n"
    "  .safety-banner.unsafe{\n"
    "    background:rgba(255,79,106,0.10);border-color:rgba(255,79,106,0.35);\n"
    "    animation:safetyPulse 2s ease-in-out infinite;\n"
    "  }\n"
    "  @keyframes safetyPulse{\n"
    "    0%,100%{box-shadow:0 0 0 0 rgba(255,79,106,0)}\n"
    "    50%{box-shadow:0 0 0 6px rgba(255,79,106,.12)}\n"
    "  }\n"
    "  .safety-left{display:flex;align-items:center;gap:14px}\n"
    "  .safety-icon{font-size:28px}\n"
    "  .safety-title{font-size:15px;font-weight:700}\n"
    "  .safety-sub{font-size:12px;color:var(--text-muted);margin-top:2px}\n"
    "  .override-btn{\n"
    "    padding:9px 20px;border-radius:50px;border:none;cursor:pointer;\n"
    "    font-size:13px;font-weight:600;letter-spacing:.3px;\n"
    "    transition:all .25s;\n"
    "  }\n"
    "  .override-btn.inactive{\n"
    "    background:rgba(255,169,64,0.18);color:var(--warning);\n"
    "    border:1px solid rgba(255,169,64,0.35);\n"
    "  }\n"
    "  .override-btn.active{\n"
    "    background:rgba(255,169,64,0.35);color:#fff;\n"
    "    border:1px solid rgba(255,169,64,0.6);\n"
    "    box-shadow:0 0 16px rgba(255,169,64,0.3);\n"
    "  }\n"
    "  .override-btn:hover{transform:scale(1.04)}\n"
    "\n"
    "  /* ── Section Labels ── */\n"
    "  .section-label{\n"
    "    font-size:11px;font-weight:700;letter-spacing:2.5px;\n"
    "    text-transform:uppercase;color:var(--text-muted);\n"
    "    margin-bottom:12px;padding-left:4px;\n"
    "  }\n"
    "\n"
    "  /* ── Master Control ── */\n"
    "  .master-row{display:flex;gap:12px;margin-bottom:24px}\n"
    "  .master-btn{\n"
    "    "
    "flex:1;padding:16px;border-radius:var(--radius-sm);border:none;cursor:"
    "pointer;\n"
    "    font-size:14px;font-weight:700;letter-spacing:.5px;\n"
    "    display:flex;align-items:center;justify-content:center;gap:10px;\n"
    "    transition:all .25s;\n"
    "  }\n"
    "  .master-btn.on-btn{\n"
    "    background:linear-gradient(135deg,var(--accent),var(--accent2));\n"
    "    color:#fff;box-shadow:0 4px 20px rgba(79,142,255,0.4);\n"
    "  }\n"
    "  .master-btn.off-btn{\n"
    "    background:rgba(255,79,106,0.18);color:var(--danger);\n"
    "    border:1px solid rgba(255,79,106,0.3);\n"
    "  }\n"
    "  .master-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}\n"
    "  .master-btn:active{transform:translateY(0)}\n"
    "\n"
    "  /* ── Fan Cards ── */\n"
    "  .fans-grid{display:grid;grid-template-columns:1fr "
    "1fr;gap:16px;margin-bottom:24px}\n"
    "  @media(max-width:640px){.fans-grid{grid-template-columns:1fr}}\n"
    "\n"
    "  .fan-card{padding:24px}\n"
    "  "
    ".fan-header{display:flex;align-items:center;justify-content:space-between;"
    "margin-bottom:20px}\n"
    "  .fan-title{display:flex;align-items:center;gap:10px}\n"
    "  .fan-icon{font-size:24px;transition:transform .3s}\n"
    "  .fan-icon.spinning{animation:spin 1.2s linear infinite}\n"
    "  @keyframes spin{to{transform:rotate(360deg)}}\n"
    "  .fan-name{font-size:16px;font-weight:700}\n"
    "  .fan-status{font-size:11px;margin-top:2px;font-weight:500}\n"
    "  .fan-status.on{color:var(--success)}\n"
    "  .fan-status.off{color:var(--text-muted)}\n"
    "\n"
    "  /* Toggle switch */\n"
    "  .toggle{position:relative;display:inline-block;width:52px;height:28px}\n"
    "  .toggle input{opacity:0;width:0;height:0}\n"
    "  .slider{\n"
    "    position:absolute;inset:0;border-radius:28px;cursor:pointer;\n"
    "    background:rgba(255,255,255,0.12);border:1px solid "
    "rgba(255,255,255,0.15);\n"
    "    transition:.3s;\n"
    "  }\n"
    "  .slider::before{\n"
    "    content:'';position:absolute;\n"
    "    height:20px;width:20px;left:3px;bottom:3px;\n"
    "    background:#fff;border-radius:50%;\n"
    "    box-shadow:0 2px 6px rgba(0,0,0,0.3);\n"
    "    transition:.3s;\n"
    "  }\n"
    "  input:checked + .slider{\n"
    "    background:linear-gradient(135deg,var(--accent),var(--accent2));\n"
    "    border-color:transparent;\n"
    "    box-shadow:0 0 12px rgba(79,142,255,0.4);\n"
    "  }\n"
    "  input:checked + .slider::before{transform:translateX(24px)}\n"
    "\n"
    "  /* Throttle */\n"
    "  /* ── Shared Throttle Panel ── */\n"
    "  .throttle-panel{padding:28px 32px;margin-bottom:16px}\n"
    "  "
    ".throttle-panel-header{display:flex;align-items:baseline;justify-content:"
    "space-between;margin-bottom:4px}\n"
    "  "
    ".throttle-panel-label{font-size:11px;font-weight:700;letter-spacing:3px;"
    "color:var(--text-muted);text-transform:uppercase}\n"
    "  .throttle-big-val{\n"
    "    font-size:72px;font-weight:900;line-height:1;\n"
    "    font-variant-numeric:tabular-nums;\n"
    "    background:linear-gradient(135deg,var(--accent),var(--accent2));\n"
    "    -webkit-background-clip:text;-webkit-text-fill-color:transparent;\n"
    "    margin:8px 0 18px;\n"
    "  }\n"
    "  .throttle-big-unit{font-size:24px;font-weight:400;opacity:.6}\n"
    "  input[type=range]{\n"
    "    "
    "width:100%;-webkit-appearance:none;height:6px;border-radius:6px;outline:"
    "none;\n"
    "    background:rgba(255,255,255,0.12);cursor:pointer;margin:8px 0;\n"
    "  }\n"
    "  input[type=range]::-webkit-slider-thumb{\n"
    "    -webkit-appearance:none;width:22px;height:22px;border-radius:50%;\n"
    "    background:linear-gradient(135deg,var(--accent),var(--accent2));\n"
    "    box-shadow:0 2px 12px rgba(79,142,255,0.6);cursor:pointer;\n"
    "    transition:transform .15s;\n"
    "  }\n"
    "  input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.25)}\n"
    "  "
    ".throttle-marks{display:flex;justify-content:space-between;font-size:10px;"
    "color:var(--text-muted);padding:0 2px}\n"
    "\n"
    "  /* ── Compact Fan Card (no individual slider) ── */\n"
    "  .fan-card-compact{padding:22px 24px}\n"
    "  .fan-start-btn{\n"
    "    "
    "width:100%;margin-top:16px;padding:12px;border-radius:var(--radius-sm);\n"
    "    border:none;cursor:pointer;font-size:13px;font-weight:700;\n"
    "    letter-spacing:.5px;font-family:inherit;\n"
    "    display:flex;align-items:center;justify-content:center;gap:8px;\n"
    "    transition:all .25s;\n"
    "  }\n"
    "  .fan-start-btn.start{\n"
    "    background:linear-gradient(135deg,var(--accent),var(--accent2));\n"
    "    color:#fff;box-shadow:0 4px 16px rgba(79,142,255,0.35);\n"
    "  }\n"
    "  .fan-start-btn.stop{\n"
    "    background:rgba(255,79,106,0.18);color:var(--danger);\n"
    "    border:1px solid rgba(255,79,106,0.3);\n"
    "  }\n"
    "  "
    ".fan-start-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}\n"
    "  .fan-start-btn:active{transform:translateY(0)}\n"
    "  .fan-throttle-badge{\n"
    "    display:inline-block;padding:3px 10px;border-radius:50px;\n"
    "    font-size:11px;font-weight:700;\n"
    "    background:rgba(79,142,255,0.15);color:var(--accent);\n"
    "    border:1px solid rgba(79,142,255,0.25);\n"
    "  }\n"
    "\n"
    "  /* ── Sensors Grid ── */\n"
    "  "
    ".sensors-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;"
    "margin-bottom:24px}\n"
    "  @media(max-width:768px){.sensors-grid{grid-template-columns:1fr 1fr}}\n"
    "  @media(max-width:480px){.sensors-grid{grid-template-columns:1fr}}\n"
    "\n"
    "  .sensor-card{padding:20px}\n"
    "  "
    ".sensor-header{display:flex;align-items:center;justify-content:space-"
    "between;margin-bottom:16px}\n"
    "  "
    ".sensor-title{font-size:13px;font-weight:700;display:flex;align-items:"
    "center;gap:8px}\n"
    "  .sensor-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}\n"
    "  .sensor-dot.ok{background:var(--success);box-shadow:0 0 8px "
    "var(--success)}\n"
    "  .sensor-dot.warn{background:var(--danger);box-shadow:0 0 8px "
    "var(--danger)}\n"
    "  .sensor-dot.off{background:var(--text-muted)}\n"
    "\n"
    "  .sensor-dist{\n"
    "    font-size:32px;font-weight:900;margin:12px 0 4px;\n"
    "    font-variant-numeric:tabular-nums;\n"
    "    transition:color .3s;\n"
    "  }\n"
    "  .sensor-dist.ok{color:var(--success)}\n"
    "  .sensor-dist.warn{color:var(--danger)}\n"
    "  .sensor-dist.off{color:var(--text-muted)}\n"
    "  "
    ".sensor-unit{font-size:14px;font-weight:400;color:var(--text-muted);"
    "margin-left:2px}\n"
    "\n"
    "  "
    ".sensor-threshold-row{display:flex;align-items:center;gap:8px;margin-top:"
    "14px}\n"
    "  .thr-label{font-size:11px;color:var(--text-muted);white-space:nowrap}\n"
    "  .thr-input{\n"
    "    flex:1;background:rgba(255,255,255,0.07);border:1px solid "
    "rgba(255,255,255,0.14);\n"
    "    border-radius:8px;padding:5px "
    "10px;color:var(--text);font-size:13px;font-weight:600;\n"
    "    "
    "font-family:inherit;outline:none;transition:.2s;width:70px;text-align:"
    "center;\n"
    "  }\n"
    "  "
    ".thr-input:focus{border-color:var(--accent);background:rgba(79,142,255,0."
    "1)}\n"
    "  .thr-unit{font-size:11px;color:var(--text-muted)}\n"
    "  .thr-set-btn{\n"
    "    padding:5px 12px;border-radius:8px;border:none;cursor:pointer;\n"
    "    background:rgba(79,142,255,0.2);color:var(--accent);\n"
    "    font-size:11px;font-weight:600;font-family:inherit;\n"
    "    transition:all .2s;\n"
    "  }\n"
    "  "
    ".thr-set-btn:hover{background:rgba(79,142,255,0.35);transform:scale(1.05)}"
    "\n"
    "\n"
    "  /* ── All Sensors Toggle ── */\n"
    "  .sensor-master-row{\n"
    "    display:flex;align-items:center;justify-content:space-between;\n"
    "    padding:16px 24px;border-radius:var(--radius-sm);margin-bottom:24px;\n"
    "  }\n"
    "  .sensor-master-left{display:flex;align-items:center;gap:12px}\n"
    "  .sensor-master-icon{font-size:22px}\n"
    "  .sensor-master-title{font-size:14px;font-weight:700}\n"
    "  "
    ".sensor-master-sub{font-size:11px;color:var(--text-muted);margin-top:2px}"
    "\n"
    "\n"
    "  /* ── Footer ── */\n"
    "  footer{\n"
    "    text-align:center;padding-top:32px;\n"
    "    font-size:11px;color:var(--text-muted);letter-spacing:1px;\n"
    "  }\n"
    "\n"
    "  /* ── Animations ── */\n"
    "  .fade-in{animation:fadeIn .5s ease both}\n"
    "  @keyframes "
    "fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:"
    "translateY(0)}}\n"
    "  .card-delay-1{animation-delay:.05s}\n"
    "  .card-delay-2{animation-delay:.10s}\n"
    "  .card-delay-3{animation-delay:.15s}\n"
    "\n"
    "  /* ── Glow Divider ── */\n"
    "  .glow-line{\n"
    "    height:1px;\n"
    "    "
    "background:linear-gradient(90deg,transparent,rgba(79,142,255,.4),rgba(162,"
    "89,255,.4),transparent);\n"
    "    margin:24px 0;border:none;\n"
    "  }\n"
    "\n"
    "  /* Tooltip / info chip */\n"
    "  .info-chip{\n"
    "    display:inline-flex;align-items:center;gap:4px;\n"
    "    padding:3px 10px;border-radius:50px;font-size:10px;font-weight:600;\n"
    "    letter-spacing:.5px;text-transform:uppercase;\n"
    "  }\n"
    "  .chip-ok{background:rgba(57,217,138,.15);color:var(--success)}\n"
    "  .chip-warn{background:rgba(255,79,106,.15);color:var(--danger)}\n"
    "  .chip-override{background:rgba(255,169,64,.15);color:var(--warning)}\n"
    "  .chip-off{background:rgba(122,128,153,.15);color:var(--text-muted)}\n"
    "\n"
    "  /* Number input spin hide */\n"
    "  input[type=number]::-webkit-inner-spin-button,\n"
    "  input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}\n"
    "  input[type=number]{-moz-appearance:textfield}\n"
    "</style>\n"
    "</head>\n"
    "<body>\n"
    "<div class=\"wrapper\">\n"
    "\n"
    "  <!-- Header -->\n"
    "  <header class=\"glass fade-in\">\n"
    "    <div class=\"brand\">\n"
    "      <div class=\"brand-icon\">🌀</div>\n"
    "      <div>\n"
    "        <div class=\"brand-name\">HOLOGRAM MOTOR CONTROLLER</div>\n"
    "        <div class=\"brand-sub\">Fusion5 · ESP32 Live Dashboard</div>\n"
    "      </div>\n"
    "    </div>\n"
    "    <div id=\"connBadge\" class=\"conn-badge disconnected\">\n"
    "      <div class=\"conn-dot\"></div>\n"
    "      <span id=\"connText\">Disconnected</span>\n"
    "    </div>\n"
    "  </header>\n"
    "\n"
    "  <!-- Safety Banner -->\n"
    "  <div id=\"safetyBanner\" class=\"glass safety-banner safe fade-in "
    "card-delay-1\">\n"
    "    <div class=\"safety-left\">\n"
    "      <div id=\"safetyIcon\" class=\"safety-icon\">✅</div>\n"
    "      <div>\n"
    "        <div id=\"safetyTitle\" class=\"safety-title\">Safe to "
    "Start</div>\n"
    "        <div id=\"safetySub\" class=\"safety-sub\">All sensors clear — no "
    "objects within detection range</div>\n"
    "      </div>\n"
    "    </div>\n"
    "    <div style=\"display:flex;align-items:center;gap:10px\">\n"
    "      <span id=\"overrideChip\" class=\"info-chip chip-off\">Override "
    "Off</span>\n"
    "      <button id=\"overrideBtn\" class=\"override-btn inactive\" "
    "onclick=\"toggleOverride()\">\n"
    "        ⚡ Override Safety\n"
    "      </button>\n"
    "    </div>\n"
    "  </div>\n"
    "\n"
    "  <!-- Shared Throttle Panel -->\n"
    "  <p class=\"section-label fade-in\">Throttle</p>\n"
    "  <div class=\"glass throttle-panel fade-in card-delay-1\">\n"
    "    <div class=\"throttle-panel-header\">\n"
    "      <span class=\"throttle-panel-label\">⚡ Throttle — Both "
    "Fans</span>\n"
    "      <span class=\"fan-throttle-badge\" id=\"throttleBadge\">0%</span>\n"
    "    </div>\n"
    "    <div class=\"throttle-big-val\" id=\"throttleBigVal\">0<span "
    "class=\"throttle-big-unit\">%</span></div>\n"
    "    <input type=\"range\" id=\"throttleSliderCommon\" min=\"0\" "
    "max=\"100\" value=\"0\"\n"
    "           oninput=\"setThrottleBoth(this.value)\"/>\n"
    "    <div class=\"throttle-marks\">\n"
    "      "
    "<span>0%</span><span>25%</span><span>50%</span><span>75%</"
    "span><span>100%</span>\n"
    "    </div>\n"
    "  </div>\n"
    "\n"
    "  <!-- Master Control -->\n"
    "  <p class=\"section-label fade-in\">Master Fan Control</p>\n"
    "  <div class=\"master-row fade-in card-delay-1\">\n"
    "    <button id=\"bothOnBtn\" class=\"master-btn on-btn\" "
    "onclick=\"bothFansOn()\">\n"
    "      <span style=\"font-size:18px\">🌀</span> START BOTH FANS\n"
    "    </button>\n"
    "    <button class=\"master-btn off-btn\" onclick=\"bothFansOff()\">\n"
    "      <span style=\"font-size:18px\">⛔</span> STOP BOTH FANS\n"
    "    </button>\n"
    "  </div>\n"
    "\n"
    "  <!-- Individual Fan Cards (compact — no per-fan slider) -->\n"
    "  <p class=\"section-label fade-in\">Individual Fan Control</p>\n"
    "  <div class=\"fans-grid\">\n"
    "\n"
    "    <!-- Fan 1 -->\n"
    "    <div class=\"glass fan-card-compact fade-in card-delay-1\" "
    "id=\"fan0card\">\n"
    "      <div class=\"fan-header\">\n"
    "        <div class=\"fan-title\">\n"
    "          <div id=\"fanIcon0\" class=\"fan-icon\">🌀</div>\n"
    "          <div>\n"
    "            <div class=\"fan-name\">Fan 1 — ESC Pin 18</div>\n"
    "            <div id=\"fanStatus0\" class=\"fan-status off\">● "
    "Stopped</div>\n"
    "          </div>\n"
    "        </div>\n"
    "        <label class=\"toggle\">\n"
    "          <input type=\"checkbox\" id=\"fanToggle0\" "
    "onchange=\"fanToggle(0,this.checked)\"/>\n"
    "          <span class=\"slider\"></span>\n"
    "        </label>\n"
    "      </div>\n"
    "      <button id=\"fanBtn0\" class=\"fan-start-btn start\" "
    "onclick=\"fanStartStop(0)\">\n"
    "        ▶ Start Fan 1\n"
    "      </button>\n"
    "    </div>\n"
    "\n"
    "    <!-- Fan 2 -->\n"
    "    <div class=\"glass fan-card-compact fade-in card-delay-2\" "
    "id=\"fan1card\">\n"
    "      <div class=\"fan-header\">\n"
    "        <div class=\"fan-title\">\n"
    "          <div id=\"fanIcon1\" class=\"fan-icon\">🌀</div>\n"
    "          <div>\n"
    "            <div class=\"fan-name\">Fan 2 — ESC Pin 19</div>\n"
    "            <div id=\"fanStatus1\" class=\"fan-status off\">● "
    "Stopped</div>\n"
    "          </div>\n"
    "        </div>\n"
    "        <label class=\"toggle\">\n"
    "          <input type=\"checkbox\" id=\"fanToggle1\" "
    "onchange=\"fanToggle(1,this.checked)\"/>\n"
    "          <span class=\"slider\"></span>\n"
    "        </label>\n"
    "      </div>\n"
    "      <button id=\"fanBtn1\" class=\"fan-start-btn start\" "
    "onclick=\"fanStartStop(1)\">\n"
    "        ▶ Start Fan 2\n"
    "      </button>\n"
    "    </div>\n"
    "  </div>\n"
    "\n"
    "  <hr class=\"glow-line\"/>\n"
    "\n"
    "  <!-- Sensor Master Control -->\n"
    "  <p class=\"section-label fade-in\">Ultrasonic Safety Sensors</p>\n"
    "  <div class=\"glass sensor-master-row fade-in card-delay-1\" "
    "style=\"margin-bottom:14px\">\n"
    "    <div class=\"sensor-master-left\">\n"
    "      <div class=\"sensor-master-icon\">📡</div>\n"
    "      <div>\n"
    "        <div class=\"sensor-master-title\">All Sensors Master "
    "Switch</div>\n"
    "        <div class=\"sensor-master-sub\">Disable all 3 HC-SR04 sensors at "
    "once</div>\n"
    "      </div>\n"
    "    </div>\n"
    "    <label class=\"toggle\">\n"
    "      <input type=\"checkbox\" id=\"allSensorsToggle\" checked "
    "onchange=\"setAllSensors(this.checked)\"/>\n"
    "      <span class=\"slider\"></span>\n"
    "    </label>\n"
    "  </div>\n"
    "\n"
    "  <!-- Sensor Cards -->\n"
    "  <div class=\"sensors-grid\">\n"
    "\n"
    "    <!-- Sensor 0 -->\n"
    "    <div class=\"glass sensor-card fade-in card-delay-1\" "
    "id=\"sensor0card\">\n"
    "      <div class=\"sensor-header\">\n"
    "        <div class=\"sensor-title\">\n"
    "          <div id=\"dot0\" class=\"sensor-dot ok\"></div>\n"
    "          Sensor 1\n"
    "        </div>\n"
    "        <div style=\"display:flex;align-items:center;gap:8px\">\n"
    "          <span id=\"chip0\" class=\"info-chip chip-ok\">OK</span>\n"
    "          <label class=\"toggle\" style=\"transform:scale(.8)\">\n"
    "            <input type=\"checkbox\" id=\"sensorToggle0\" checked "
    "onchange=\"setSensor(0,this.checked)\"/>\n"
    "            <span class=\"slider\"></span>\n"
    "          </label>\n"
    "        </div>\n"
    "      </div>\n"
    "      <div "
    "style=\"font-size:10px;color:var(--text-muted);margin-bottom:8px\">"
    "TRIG→25 · ECHO→26</div>\n"
    "      <div class=\"sensor-dist ok\" id=\"dist0\">— <span "
    "class=\"sensor-unit\">cm</span></div>\n"
    "      <div class=\"sensor-threshold-row\">\n"
    "        <span class=\"thr-label\">Threshold:</span>\n"
    "        <input type=\"number\" class=\"thr-input\" id=\"thr0\" "
    "value=\"100\" min=\"5\" max=\"400\"/>\n"
    "        <span class=\"thr-unit\">cm</span>\n"
    "        <button class=\"thr-set-btn\" "
    "onclick=\"setThreshold(0)\">Set</button>\n"
    "      </div>\n"
    "    </div>\n"
    "\n"
    "    <!-- Sensor 1 -->\n"
    "    <div class=\"glass sensor-card fade-in card-delay-2\" "
    "id=\"sensor1card\">\n"
    "      <div class=\"sensor-header\">\n"
    "        <div class=\"sensor-title\">\n"
    "          <div id=\"dot1\" class=\"sensor-dot ok\"></div>\n"
    "          Sensor 2\n"
    "        </div>\n"
    "        <div style=\"display:flex;align-items:center;gap:8px\">\n"
    "          <span id=\"chip1\" class=\"info-chip chip-ok\">OK</span>\n"
    "          <label class=\"toggle\" style=\"transform:scale(.8)\">\n"
    "            <input type=\"checkbox\" id=\"sensorToggle1\" checked "
    "onchange=\"setSensor(1,this.checked)\"/>\n"
    "            <span class=\"slider\"></span>\n"
    "          </label>\n"
    "        </div>\n"
    "      </div>\n"
    "      <div "
    "style=\"font-size:10px;color:var(--text-muted);margin-bottom:8px\">"
    "TRIG→27 · ECHO→14</div>\n"
    "      <div class=\"sensor-dist ok\" id=\"dist1\">— <span "
    "class=\"sensor-unit\">cm</span></div>\n"
    "      <div class=\"sensor-threshold-row\">\n"
    "        <span class=\"thr-label\">Threshold:</span>\n"
    "        <input type=\"number\" class=\"thr-input\" id=\"thr1\" "
    "value=\"100\" min=\"5\" max=\"400\"/>\n"
    "        <span class=\"thr-unit\">cm</span>\n"
    "        <button class=\"thr-set-btn\" "
    "onclick=\"setThreshold(1)\">Set</button>\n"
    "      </div>\n"
    "    </div>\n"
    "\n"
    "    <!-- Sensor 2 -->\n"
    "    <div class=\"glass sensor-card fade-in card-delay-3\" "
    "id=\"sensor2card\">\n"
    "      <div class=\"sensor-header\">\n"
    "        <div class=\"sensor-title\">\n"
    "          <div id=\"dot2\" class=\"sensor-dot ok\"></div>\n"
    "          Sensor 3\n"
    "        </div>\n"
    "        <div style=\"display:flex;align-items:center;gap:8px\">\n"
    "          <span id=\"chip2\" class=\"info-chip chip-ok\">OK</span>\n"
    "          <label class=\"toggle\" style=\"transform:scale(.8)\">\n"
    "            <input type=\"checkbox\" id=\"sensorToggle2\" checked "
    "onchange=\"setSensor(2,this.checked)\"/>\n"
    "            <span class=\"slider\"></span>\n"
    "          </label>\n"
    "        </div>\n"
    "      </div>\n"
    "      <div "
    "style=\"font-size:10px;color:var(--text-muted);margin-bottom:8px\">"
    "TRIG→32 · ECHO→33</div>\n"
    "      <div class=\"sensor-dist ok\" id=\"dist2\">— <span "
    "class=\"sensor-unit\">cm</span></div>\n"
    "      <div class=\"sensor-threshold-row\">\n"
    "        <span class=\"thr-label\">Threshold:</span>\n"
    "        <input type=\"number\" class=\"thr-input\" id=\"thr2\" "
    "value=\"100\" min=\"5\" max=\"400\"/>\n"
    "        <span class=\"thr-unit\">cm</span>\n"
    "        <button class=\"thr-set-btn\" "
    "onclick=\"setThreshold(2)\">Set</button>\n"
    "      </div>\n"
    "    </div>\n"
    "  </div>\n"
    "\n"
    "  <footer>\n"
    "    <div>HOLOGRAM MOTOR CONTROLLER &nbsp;·&nbsp; Fusion5 &nbsp;·&nbsp; "
    "ESP32 WebSocket Dashboard</div>\n"
    "    <div style=\"margin-top:6px\">A2212 Brushless Motors &nbsp;·&nbsp; "
    "HC-SR04 Ultrasonic Safety System</div>\n"
    "  </footer>\n"
    "</div>\n"
    "\n"
    "<script>\n"
    "// ═══════════════════════════════════════════════════\n"
    "//  WebSocket client\n"
    "// ═══════════════════════════════════════════════════\n"
    "let ws;\n"
    "let reconnectTimer;\n"
    "let safetyOverride = false;\n"
    "\n"
    "function connect(){\n"
    "  const host = window.location.hostname || '192.168.4.1';\n"
    "  ws = new WebSocket('ws://' + host + '/ws');\n"
    "  ws.onopen  = onOpen;\n"
    "  ws.onclose = onClose;\n"
    "  ws.onerror = onError;\n"
    "  ws.onmessage = onMessage;\n"
    "}\n"
    "\n"
    "function onOpen(){\n"
    "  clearTimeout(reconnectTimer);\n"
    "  setConn(true);\n"
    "}\n"
    "function onClose(){\n"
    "  setConn(false);\n"
    "  reconnectTimer = setTimeout(connect, 2000);\n"
    "}\n"
    "function onError(){ ws.close(); }\n"
    "\n"
    "function send(obj){ if(ws && ws.readyState===1) "
    "ws.send(JSON.stringify(obj)); }\n"
    "\n"
    "// ═══════════════════════════════════════════════════\n"
    "//  State update from ESP32\n"
    "// ═══════════════════════════════════════════════════\n"
    "function onMessage(ev){\n"
    "  const d = JSON.parse(ev.data);\n"
    "  safetyOverride = d.safetyOverride;\n"
    "\n"
    "  // Common throttle — use fan0's throttle as the shared value\n"
    "  const sharedThrottle = d.motors[0].throttle;\n"
    "  document.getElementById('throttleSliderCommon').value = "
    "sharedThrottle;\n"
    "  document.getElementById('throttleBigVal').innerHTML = sharedThrottle + "
    "'<span class=\"throttle-big-unit\">%</span>';\n"
    "  document.getElementById('throttleBadge').textContent = sharedThrottle + "
    "'%';\n"
    "\n"
    "  // Motors\n"
    "  d.motors.forEach((m, i) => {\n"
    "    document.getElementById('fanToggle'+i).checked = m.running;\n"
    "    const statusEl = document.getElementById('fanStatus'+i);\n"
    "    const iconEl   = document.getElementById('fanIcon'+i);\n"
    "    const btnEl    = document.getElementById('fanBtn'+i);\n"
    "    if(m.running){\n"
    "      statusEl.textContent='● Running';\n"
    "      statusEl.className='fan-status on';\n"
    "      iconEl.classList.add('spinning');\n"
    "      btnEl.textContent='■ Stop Fan '+(i+1);\n"
    "      btnEl.className='fan-start-btn stop';\n"
    "    } else {\n"
    "      statusEl.textContent='● Stopped';\n"
    "      statusEl.className='fan-status off';\n"
    "      iconEl.classList.remove('spinning');\n"
    "      btnEl.textContent='▶ Start Fan '+(i+1);\n"
    "      btnEl.className='fan-start-btn start';\n"
    "    }\n"
    "  });\n"
    "\n"
    "  // Sensors\n"
    "  const allOff = d.allSensorsOff;\n"
    "  document.getElementById('allSensorsToggle').checked = !allOff;\n"
    "\n"
    "  d.sensors.forEach((s, i) => {\n"
    "    const en = s.enabled && !allOff;\n"
    "    document.getElementById('sensorToggle'+i).checked = s.enabled;\n"
    "\n"
    "    const distEl = document.getElementById('dist'+i);\n"
    "    const dotEl  = document.getElementById('dot'+i);\n"
    "    const chipEl = document.getElementById('chip'+i);\n"
    "    const thrEl  = document.getElementById('thr'+i);\n"
    "\n"
    "    thrEl.value = Math.round(s.thresholdCm);\n"
    "\n"
    "    if(!en){\n"
    "      distEl.innerHTML = '— <span class=\"sensor-unit\">cm</span>';\n"
    "      distEl.className='sensor-dist off';\n"
    "      dotEl.className='sensor-dot off';\n"
    "      chipEl.textContent='OFF';\n"
    "      chipEl.className='info-chip chip-off';\n"
    "    } else {\n"
    "      const dist = s.distanceCm >= 999 ? '—' : s.distanceCm.toFixed(1);\n"
    "      const over = s.distanceCm < s.thresholdCm;\n"
    "      distEl.innerHTML = (s.distanceCm >= 999 ? '—' : "
    "s.distanceCm.toFixed(1))\n"
    "                         + ' <span class=\"sensor-unit\">cm</span>';\n"
    "      if(over){\n"
    "        distEl.className='sensor-dist warn';\n"
    "        dotEl.className='sensor-dot warn';\n"
    "        chipEl.textContent='⚠ IN RANGE';\n"
    "        chipEl.className='info-chip chip-warn';\n"
    "      } else {\n"
    "        distEl.className='sensor-dist ok';\n"
    "        dotEl.className='sensor-dot ok';\n"
    "        chipEl.textContent='OK';\n"
    "        chipEl.className='info-chip chip-ok';\n"
    "      }\n"
    "    }\n"
    "  });\n"
    "\n"
    "  // Safety banner\n"
    "  updateSafetyBanner(d);\n"
    "}\n"
    "\n"
    "function updateSafetyBanner(d){\n"
    "  const banner  = document.getElementById('safetyBanner');\n"
    "  const icon    = document.getElementById('safetyIcon');\n"
    "  const title   = document.getElementById('safetyTitle');\n"
    "  const sub     = document.getElementById('safetySub');\n"
    "  const chip    = document.getElementById('overrideChip');\n"
    "  const btn     = document.getElementById('overrideBtn');\n"
    "  const bothBtn = document.getElementById('bothOnBtn');\n"
    "\n"
    "  if(d.safetyOverride){\n"
    "    banner.className='glass safety-banner safe';\n"
    "    icon.textContent='⚡';\n"
    "    title.textContent='Safety Override ACTIVE';\n"
    "    sub.textContent='Override enabled — motors may start regardless of "
    "sensor state';\n"
    "    chip.textContent='Override ON';\n"
    "    chip.className='info-chip chip-override';\n"
    "    btn.textContent='⚡ Disable Override';\n"
    "    btn.className='override-btn active';\n"
    "    bothBtn.disabled=false;bothBtn.style.opacity='';\n"
    "    return;\n"
    "  }\n"
    "\n"
    "  if(!d.safeToStart){\n"
    "    const n = (d.triggeringSensor >= 0) ? ('Sensor "
    "'+(d.triggeringSensor+1)) : 'a sensor';\n"
    "    banner.className='glass safety-banner unsafe';\n"
    "    icon.textContent='🚨';\n"
    "    title.textContent='⚠ NOT SAFE TO START — Object Detected within "
    "Range';\n"
    "    sub.textContent  = n+' detected object within threshold distance. "
    "Motors locked for safety.';\n"
    "    chip.textContent='Override Off';chip.className='info-chip chip-off';\n"
    "    btn.textContent='⚡ Override Safety';btn.className='override-btn "
    "inactive';\n"
    "    bothBtn.disabled=true;bothBtn.style.opacity='.5';\n"
    "  } else {\n"
    "    banner.className='glass safety-banner safe';\n"
    "    icon.textContent='✅';\n"
    "    title.textContent='Safe to Start';\n"
    "    sub.textContent='All active sensors clear — no objects within "
    "detection range';\n"
    "    chip.textContent='Override Off';chip.className='info-chip chip-off';\n"
    "    btn.textContent='⚡ Override Safety';btn.className='override-btn "
    "inactive';\n"
    "    bothBtn.disabled=false;bothBtn.style.opacity='';\n"
    "  }\n"
    "}\n"
    "\n"
    "// ═══════════════════════════════════════════════════\n"
    "//  Connection status UI\n"
    "// ═══════════════════════════════════════════════════\n"
    "function setConn(connected){\n"
    "  const badge = document.getElementById('connBadge');\n"
    "  const text  = document.getElementById('connText');\n"
    "  if(connected){\n"
    "    badge.className='conn-badge connected';\n"
    "    text.textContent='Connected';\n"
    "  } else {\n"
    "    badge.className='conn-badge disconnected';\n"
    "    text.textContent='Disconnected';\n"
    "  }\n"
    "}\n"
    "\n"
    "// ═══════════════════════════════════════════════════\n"
    "//  Control functions\n"
    "// ═══════════════════════════════════════════════════\n"
    "function bothFansOn(){ send({cmd:'bothOn'}); }\n"
    "function bothFansOff(){ send({cmd:'bothOff'}); }\n"
    "\n"
    "function fanToggle(idx, on){\n"
    "  send({cmd: on ? 'fanOn' : 'fanOff', fan: idx});\n"
    "}\n"
    "\n"
    "// Track running state locally to toggle on the Start/Stop button\n"
    "const fanRunning = [false, false];\n"
    "function fanStartStop(idx){\n"
    "  fanRunning[idx] = !fanRunning[idx];\n"
    "  send({cmd: fanRunning[idx] ? 'fanOn' : 'fanOff', fan: idx});\n"
    "}\n"
    "\n"
    "// Single slider → sends throttle to BOTH fans simultaneously\n"
    "function setThrottleBoth(val){\n"
    "  const pct = parseInt(val);\n"
    "  document.getElementById('throttleBigVal').innerHTML = pct + '<span "
    "class=\"throttle-big-unit\">%</span>';\n"
    "  document.getElementById('throttleBadge').textContent = pct + '%';\n"
    "  send({cmd:'setThrottle', fan:0, throttle:pct});\n"
    "  send({cmd:'setThrottle', fan:1, throttle:pct});\n"
    "}\n"
    "\n"
    "function toggleOverride(){\n"
    "  send({cmd:'setOverride', value:!safetyOverride});\n"
    "}\n"
    "\n"
    "function setAllSensors(active){\n"
    "  send({cmd:'setAllSensors', value:active});\n"
    "}\n"
    "\n"
    "function setSensor(idx, enabled){\n"
    "  send({cmd:'setSensor', sensor:idx, enabled:enabled});\n"
    "}\n"
    "\n"
    "function setThreshold(idx){\n"
    "  const val = parseFloat(document.getElementById('thr'+idx).value);\n"
    "  if(isNaN(val) || val < 5 || val > 400) return;\n"
    "  send({cmd:'setThreshold', sensor:idx, threshold:val});\n"
    "}\n"
    "\n"
    "// ═══════════════════════════════════════════════════\n"
    "//  Kick off\n"
    "// ═══════════════════════════════════════════════════\n"
    "connect();\n"
    "</script>\n"
    "</body>\n"
    "</html>\n";

// ════════════════════════════════════════════════════════
//  SETUP
// ════════════════════════════════════════════════════════
void setup() {
  Serial.begin(115200);
  Serial.println("\n[BOOT] Hologram Motor Controller starting…");

  // ── Sensor Pins ──────────────────────────────────────
  uint8_t trigPins[] = {TRIG1, TRIG2, TRIG3};
  uint8_t echoPins[] = {ECHO1, ECHO2, ECHO3};
  for (int i = 0; i < 3; i++) {
    pinMode(trigPins[i], OUTPUT);
    pinMode(echoPins[i], INPUT);
    digitalWrite(trigPins[i], LOW);
  }
  Serial.println("[SENSOR] HC-SR04 pins configured.");

  // ── ESC / Motor Pins ─────────────────────────────────
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  esc[0].setPeriodHertz(ESC_FREQ);
  esc[1].setPeriodHertz(ESC_FREQ);
  esc[0].attach(ESC1_PIN, ESC_MIN_US, ESC_MAX_US);
  esc[1].attach(ESC2_PIN, ESC_MIN_US, ESC_MAX_US);
  Serial.println("[ESC] Pins attached.");

  // Arm both ESCs
  armESCs();

  // ── WiFi Access Point ─────────────────────────────────
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD);
  Serial.print("[WiFi] AP started. IP: ");
  Serial.println(WiFi.softAPIP());

  // ── WebSocket ─────────────────────────────────────────
  ws.onEvent(onWsEvent);
  server.addHandler(&ws);

  // ── HTTP Routes ───────────────────────────────────────
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *req) {
    req->send_P(200, "text/html", INDEX_HTML);
  });

  // 404
  server.onNotFound([](AsyncWebServerRequest *req) {
    req->send(404, "text/plain", "Not found");
  });

  server.begin();
  Serial.println("[HTTP] Web server started.");
  Serial.println("[BOOT] System ready — connect to WiFi: " + String(AP_SSID));
}

// ════════════════════════════════════════════════════════
//  LOOP
// ════════════════════════════════════════════════════════
void loop() {
  unsigned long now = millis();

  // ── Read Ultrasonic Sensors ───────────────────────────
  if (now - lastSensorRead >= SENSOR_READ_INTERVAL_MS) {
    lastSensorRead = now;

    if (!allSensorsOff) {
      uint8_t trigPins[] = {TRIG1, TRIG2, TRIG3};
      uint8_t echoPins[] = {ECHO1, ECHO2, ECHO3};
      for (int i = 0; i < 3; i++) {
        if (sensor[i].enabled) {
          sensor[i].distanceCm = readUltrasonic(trigPins[i], echoPins[i]);
        } else {
          sensor[i].distanceCm = 999.0f;
        }
      }
    }

    // Safety enforcement: if unsafe and no override, stop motors
    if (!isSafeToStart()) {
      bool anyRunning = motor[0].running || motor[1].running;
      if (anyRunning) {
        stopAllMotors();
        Serial.println("[SAFETY] Object detected! Motors stopped.");
      }
    }
  }

  // ── Broadcast State to all WS clients ────────────────
  if (now - lastBroadcast >= BROADCAST_INTERVAL_MS) {
    lastBroadcast = now;
    if (ws.count() > 0) {
      broadcastState();
    }
    ws.cleanupClients();
  }
}
