/**
 * Firmware and Source Code snippets for Fusion 5
 */

export const ESP32_FIRMWARE_INO = `/*
 * 🌀 Fusion 5 - Hologram Fan POV Firmware
 * Microcontroller: ESP32-S3-N16R8 (16MB Flash, 8MB PSRAM)
 * LED Strip: APA102 2020 (100 LEDs per blade)
 * Rotation Sync: A3144 Hall Effect Sensor
 */

#define FASTLED_INTERNAL
#include <FastLED.h>
#include <WiFi.h>
#include <WebServer.h>
#include "FFat.h"

// Set Fan ID: 1 for Top Fan, 2 for Bottom Fan
#define FAN_ID 1

#define NUM_LEDS     100
#define DATA_PIN     11
#define CLOCK_PIN    12
#define HALL_PIN     4

#define POLAR_ROWS   60   // 360 / 6 degrees = 60 rows
#define FRAME_BYTES  (POLAR_ROWS * NUM_LEDS * 2) // 12,000 bytes

CRGB leds[NUM_LEDS];
uint8_t imageBuffer[FRAME_BYTES];
volatile unsigned long lastRotationTime = 0;
volatile unsigned long rotationPeriod = 40000; // default ~1500 RPM (40ms)
volatile bool newRotation = false;

WebServer server(80);

void IRAM_ATTR hallISR() {
  unsigned long now = micros();
  rotationPeriod = now - lastRotationTime;
  lastRotationTime = now;
  newRotation = true;
}

void setup() {
  Serial.begin(115200);
  Serial.println("=== Fusion 5 Hologram Fan Firmware ===");

  pinMode(HALL_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(HALL_PIN), hallISR, FALLING);

  FastLED.addLeds<APA102, DATA_PIN, CLOCK_PIN, BGR, DATA_RATE_MHZ(12)>(leds, NUM_LEDS);
  FastLED.setBrightness(25); // ~10% brightness for safety

  // Mount FFat File System
  if (!FFat.begin(true)) {
    Serial.println("FFat Mount Failed!");
  } else {
    Serial.println("FFat Mounted Successfully");
  }

  // Start Access Point
  String apSSID = "HologramFan" + String(FAN_ID);
  WiFi.softAP(apSSID.c_str(), "12345678");
  Serial.print("WiFi AP Started! IP: ");
  Serial.println(WiFi.softAPIP());

  // Setup Web Server Endpoints
  server.on("/status", HTTP_GET, []() {
    String json = "{\\"fanId\\":" + String(FAN_ID) + 
                  ",\\"rpm\\":" + String(60000000UL / (rotationPeriod ? rotationPeriod : 1)) +
                  ",\\"brightness\\":25}";
    server.send(200, "application/json", json);
  });

  server.on("/upload", HTTP_POST, []() {
    server.send(200, "text/plain", "Upload OK");
  }, []() {
    HTTPUpload& upload = server.upload();
    if (upload.status == UPLOAD_FILE_WRITE) {
      if (upload.currentSize <= FRAME_BYTES) {
        memcpy(imageBuffer + upload.totalBytes, upload.buf, upload.currentSize);
      }
    }
  });

  server.begin();
}

void loop() {
  server.handleClient();

  // POV Render Loop
  if (rotationPeriod > 5000 && rotationPeriod < 200000) {
    unsigned long rowDelayUs = rotationPeriod / POLAR_ROWS;
    unsigned long startTime = micros();

    for (int r = 0; r < POLAR_ROWS; r++) {
      int rowOffset = r * NUM_LEDS * 2;
      for (int i = 0; i < NUM_LEDS; i++) {
        uint8_t low  = imageBuffer[rowOffset + i * 2];
        uint8_t high = imageBuffer[rowOffset + i * 2 + 1];
        uint16_t rgb565 = (high << 8) | low;

        // Convert RGB565 to FastLED CRGB
        uint8_t r_val = ((rgb565 >> 11) & 0x1F) << 3;
        uint8_t g_val = ((rgb565 >> 5)  & 0x3F) << 2;
        uint8_t b_val = (rgb565 & 0x1F) << 3;
        leds[i] = CRGB(r_val, g_val, b_val);
      }
      FastLED.show();

      while (micros() - startTime < (r + 1) * rowDelayUs) {
        // Precise spin wait
      }
    }
  }
}
`;

export const PYTHON_PROCESSING_PY = `'''
🌀 Fusion 5 - Python Polar Coordinate Transformation Reference Script
Maps rectangular image onto dual overlap polar display matrices.
'''

import cv2
import numpy as np
import struct

POLAR_ROWS = 60
NUM_LEDS = 100

def rgb_to_rgb565(r, g, b):
    return ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3)

def convert_image_to_polar_bin(image_path, fan1_out='fan1.bin', fan2_out='fan2.bin'):
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Image {image_path} not found")

    h, w, _ = img.shape
    fan1_data = bytearray()
    fan2_data = bytearray()

    cx = w / 2.0
    cy1 = h * 0.35  # Fan 1 Center
    cy2 = h * 0.65  # Fan 2 Center
    max_r = min(w, h) / 2.0

    # Process Fan 1
    for r in range(POLAR_ROWS):
        angle_rad = np.radians(r * (360.0 / POLAR_ROWS))
        for led in range(NUM_LEDS):
            radius = (led / float(NUM_LEDS)) * max_r
            px = int(cx + radius * np.cos(angle_rad))
            py = int(cy1 + radius * np.sin(angle_rad))
            
            px = np.clip(px, 0, w - 1)
            py = np.clip(py, 0, h - 1)
            
            b, g, r_val = img[py, px]
            rgb565 = rgb_to_rgb565(r_val, g, b)
            fan1_data.extend(struct.pack('<H', rgb565))

    with open(fan1_out, 'wb') as f:
        f.write(fan1_data)
        
    print(f"Successfully generated {fan1_out} ({len(fan1_data)} bytes)")

if __name__ == '__main__':
    convert_image_to_polar_bin('sample.png')
`;

export const MOTOR_CONTROLLER_INO = `/*
 * =====================================================
 *   HOLOGRAM MOTOR CONTROLLER — ESP32 Firmware
 *   Fusion5 Project
 * =====================================================
 *  Hardware:
 *    - ESP32 Dev Board (SoftAP: "HOLOGRAM MOTOR CONTROLLER", Pass: "12345678")
 *    - 2x A2212 Brushless Motors + 30A ESC
 *      Fan 1 ESC → GPIO 18
 *      Fan 2 ESC → GPIO 19
 *    - 3x HC-SR04 Ultrasonic Sensors
 *      Sensor 1: TRIG→25, ECHO→26
 *      Sensor 2: TRIG→27, ECHO→14
 *      Sensor 3: TRIG→32, ECHO→33
 *  WebSocket Endpoints: ws://192.168.4.1/ws
 * =====================================================
 */

#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

const char *AP_SSID = "HOLOGRAM MOTOR CONTROLLER";
const char *AP_PASSWORD = "12345678";

#define ESC1_PIN 18
#define ESC2_PIN 19

#define TRIG1 25
#define ECHO1 26
#define TRIG2 27
#define ECHO2 14
#define TRIG3 32
#define ECHO3 33

#define ESC_MIN_US 1000 // 0% throttle / Arm position
#define ESC_MAX_US 2000 // 100% throttle
#define DEFAULT_SAFETY_DIST_CM 100

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

struct MotorState {
  bool running = false;
  int throttle = 0; // 0-100%
};

MotorState motor[2];
Servo esc[2];

struct SensorState {
  bool enabled = true;
  float distanceCm = 999.0f;
  float thresholdCm = DEFAULT_SAFETY_DIST_CM;
};

SensorState sensor[3];
bool safetyOverride = false;

float readUltrasonic(uint8_t trigPin, uint8_t echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return 999.0f;
  return (duration * 0.034f) / 2.0f;
}

void applyMotorState(int idx) {
  if (!motor[idx].running) {
    esc[idx].writeMicroseconds(ESC_MIN_US);
  } else {
    int us = ESC_MIN_US + (int)((float)motor[idx].throttle / 100.0f * (ESC_MAX_US - ESC_MIN_US));
    esc[idx].writeMicroseconds(us);
  }
}

void stopAllMotors() {
  for (int i = 0; i < 2; i++) {
    motor[i].running = false;
    applyMotorState(i);
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.softAP(AP_SSID, AP_PASSWORD);

  esc[0].attach(ESC1_PIN, ESC_MIN_US, ESC_MAX_US);
  esc[1].attach(ESC2_PIN, ESC_MIN_US, ESC_MAX_US);
  stopAllMotors();

  pinMode(TRIG1, OUTPUT); pinMode(ECHO1, INPUT);
  pinMode(TRIG2, OUTPUT); pinMode(ECHO2, INPUT);
  pinMode(TRIG3, OUTPUT); pinMode(ECHO3, INPUT);

  server.listen(80);
  Serial.println("Hologram Motor Controller Online");
}

void loop() {
  // Sensor distance polling & safety triggers
  for (int i = 0; i < 3; i++) {
    if (i == 0) sensor[0].distanceCm = readUltrasonic(TRIG1, ECHO1);
    if (i == 1) sensor[1].distanceCm = readUltrasonic(TRIG2, ECHO2);
    if (i == 2) sensor[2].distanceCm = readUltrasonic(TRIG3, ECHO3);

    if (!safetyOverride && sensor[i].enabled && sensor[i].distanceCm < sensor[i].thresholdCm) {
      stopAllMotors(); // Emergency cut-off triggered!
    }
  }
  delay(100);
}
`;

