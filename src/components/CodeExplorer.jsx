import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, FileCode, Server, Cpu } from 'lucide-react';
import { ESP32_FIRMWARE_INO, PYTHON_PROCESSING_PY, MOTOR_CONTROLLER_INO } from '../data/firmwareCode';

export default function CodeExplorer() {
  const [activeCodeTab, setActiveCodeTab] = useState('firmware');
  const [copied, setCopied] = useState(false);

  const getCodeContent = () => {
    switch (activeCodeTab) {
      case 'motor_controller':
        return MOTOR_CONTROLLER_INO;
      case 'firmware':
        return ESP32_FIRMWARE_INO;
      case 'python':
        return PYTHON_PROCESSING_PY;
      case 'api':
      default:
        return `// HTTP REST & WebSocket API Specifications for Fusion 5 ESP32 Controllers
// Base Fan IP: http://192.168.4.1 (Fan 1) / http://192.168.4.2 (Fan 2)
// Motor Controller WebSocket: ws://192.168.4.1/ws (AP SSID: HOLOGRAM MOTOR CONTROLLER)

// 1. GET /status (Fan Display MCU)
{
  "fanId": 1,
  "rpm": 2400,
  "brightness": 25,
  "ffatFreeBytes": 9800000
}

// 2. WebSocket Outgoing Command (Motor Controller MCU)
// Set Fan 1 & Fan 2 ESC Throttle (0-100%)
{
  "action": "set_throttle",
  "motor1": 80,
  "motor2": 80
}

// 3. WebSocket Emergency Cut-off Command
{
  "action": "emergency_stop"
}

// 4. WebSocket Sensor Telemetry Broadcast (Every 200ms)
{
  "event": "telemetry",
  "motors": [
    { "running": true, "throttle": 80 },
    { "running": true, "throttle": 80 }
  ],
  "sensors": [
    { "id": 1, "enabled": true, "distanceCm": 142.5 },
    { "id": 2, "enabled": true, "distanceCm": 138.0 },
    { "id": 3, "enabled": true, "distanceCm": 165.2 }
  ],
  "safetyOverride": false
}`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-cyan-500/20 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-cyan-400" />
            <span>Firmware & Source Code Explorer</span>
          </h2>
          <p className="text-xs text-slate-400">
            Motor controller firmware, POV FastLED display sketch, polar coordinate processing, & API specs.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-cyan-500/30">
          <button
            onClick={() => setActiveCodeTab('motor_controller')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCodeTab === 'motor_controller' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,243,255,0.4)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Motor Controller (.ino)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('firmware')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCodeTab === 'firmware' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,243,255,0.4)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>POV Display Firmware (.ino)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('python')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCodeTab === 'python' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,243,255,0.4)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python Script (.py)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('api')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCodeTab === 'api' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,243,255,0.4)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>API Specs</span>
          </button>
        </div>
      </div>

      {/* Code Window Container */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {/* Code Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="text-xs font-mono text-slate-400 ml-2">
              {activeCodeTab === 'motor_controller'
                ? 'hologram_motor_controller.ino'
                : activeCodeTab === 'firmware'
                ? 'HologramFanFirmware.ino'
                : activeCodeTab === 'python'
                ? 'processing.py'
                : 'API_Spec.json'}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-300 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code View */}
        <pre className="p-6 text-xs font-mono text-cyan-300 bg-[#02050e] overflow-x-auto max-h-[500px] leading-relaxed">
          <code>{getCodeContent()}</code>
        </pre>
      </div>
    </section>
  );
}
