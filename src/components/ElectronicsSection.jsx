import React, { useState } from 'react';
import { Cpu, Zap, AlertTriangle, ShieldCheck, CheckCircle2, Cable, Server, Gauge, Activity, Radio, Lock, Flame, Info, ChevronRight, Layers } from 'lucide-react';

export default function ElectronicsSection() {
  const [activeTab, setActiveTab] = useState('all');

  const pinouts = [
    { pin: 'GPIO 18', target: 'Fan 1 ESC PWM Signal', type: 'Servo PWM (50Hz, 1000–2000µs)', role: 'Motor Speed Control', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
    { pin: 'GPIO 19', target: 'Fan 2 ESC PWM Signal', type: 'Servo PWM (50Hz, 1000–2000µs)', role: 'Motor Speed Control', color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
    { pin: 'GPIO 25 / 26', target: 'HC-SR04 Sensor 1 (Top)', type: 'Trig (Out) / Echo (In)', role: 'Perimeter Safety', color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' },
    { pin: 'GPIO 27 / 14', target: 'HC-SR04 Sensor 2 (Center)', type: 'Trig (Out) / Echo (In)', role: 'Perimeter Safety', color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' },
    { pin: 'GPIO 32 / 33', target: 'HC-SR04 Sensor 3 (Bottom)', type: 'Trig (Out) / Echo (In)', role: 'Perimeter Safety', color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' },
    { pin: 'GPIO 11', target: 'APA102 Data (DI)', type: 'SPI MOSI (Display MCU)', role: 'High-Speed LED Data', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' },
    { pin: 'GPIO 12', target: 'APA102 Clock (CI)', type: 'SPI SCK (Display MCU)', role: 'High-Speed LED Clock', color: 'text-purple-400 border-purple-500/40 bg-purple-950/40' },
    { pin: 'GPIO 4', target: 'A3144 Hall Sensor Signal', type: 'Digital Interrupt (FALLING)', role: 'RPM Phase Sync', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
    { pin: '12V DC / LiPo', target: 'A2212 ESC Power Rail', type: 'High Current (12V / 15A Peak)', role: 'Motor Battery Supply', color: 'text-red-400 border-red-500/40 bg-red-950/40' },
    { pin: 'GND Rail', target: 'Common System Ground', type: 'MCU + ESC + Sensor GND', role: 'System Ground Ref', color: 'text-slate-300 border-slate-700 bg-slate-900/60' },
  ];

  return (
    <section className="py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Page Title Header */}
      <div className="border-b border-cyan-500/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-1 text-xs font-mono text-cyan-300 mb-2">
            / hardware_architecture
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-cyan-400" />
            <span>Electronics & Motor Controller Hardware Architecture</span>
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            In-depth technical breakdown of ESC 50Hz pulse-width modulation, BLDC motor dynamics, ultrasonic acoustic time-of-flight physics, and dual-MCU hardware architecture.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 bg-[#070c1e] p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Subsystems
          </button>

          <button
            onClick={() => setActiveTab('mcu')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mcu' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dual MCUs
          </button>

          <button
            onClick={() => setActiveTab('esc')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'esc' ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ESC PWM Physics
          </button>

          <button
            onClick={() => setActiveTab('sonar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sonar' ? 'bg-blue-500 text-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sonar Shield
          </button>
        </div>
      </div>

      {/* ─── 4 MAIN HARDWARE ARCHITECTURE CARDS (BENTO CIRCUIT GRID) ─── */}
      {(activeTab === 'all' || activeTab === 'mcu') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Display MCU */}
          <div className="group relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0a122c]/90 via-[#060a1a]/95 to-[#030612]/95 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(0,243,255,0.25)] flex flex-col justify-between space-y-6">
            <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/40">
                  240MHz Dual Core
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-slate-100 to-cyan-100">
                  ESP32-S3-N16R8
                </h3>
                <span className="text-xs text-cyan-400 font-mono font-semibold">Primary Display Engine</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Dedicated POV rendering MCU featuring <span className="text-cyan-300 font-mono font-bold">16MB QSPI Flash</span> & <span className="text-cyan-300 font-mono font-bold">8MB PSRAM</span>. Reads RGB565 frame files and drives 100 APA102 LEDs via hardware SPI at <span className="text-cyan-300 font-mono font-bold">20MHz</span>.
              </p>
            </div>

            <div className="relative z-10 pt-3 border-t border-cyan-500/20 flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">✓ 16MB Flash</span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">✓ 8MB PSRAM</span>
              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">✓ SPI 20MHz</span>
            </div>
          </div>

          {/* Card 2: Motor MCU */}
          <div className="group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#1c1407]/90 via-[#0e0a03]/95 to-[#050301]/95 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.25)] flex flex-col justify-between space-y-6">
            <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  <Server className="w-6 h-6 animate-pulse" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/40">
                  SoftAP + WebSockets
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-slate-100 to-amber-100">
                  ESP32 Motor MCU
                </h3>
                <span className="text-xs text-amber-400 font-mono font-semibold">Wi-Fi & ESC Controller</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Independent MCU hosting Access Point <span className="text-amber-300 font-mono font-bold">192.168.4.1</span> and WebSocket server. Generates 50Hz PWM servo signals for dual ESC channels while polling sonar sensors every 100ms.
              </p>
            </div>

            <div className="relative z-10 pt-3 border-t border-amber-500/20 flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">✓ SoftAP Host</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">✓ WS 100Hz</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">✓ Dual PWM</span>
            </div>
          </div>

          {/* Card 3: ESC & Motors */}
          <div className="group relative overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-b from-[#21090f]/90 via-[#120407]/95 to-[#080203]/95 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-red-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.25)] flex flex-col justify-between space-y-6">
            <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-red-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-400/40 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <Gauge className="w-6 h-6 animate-pulse" />
                </div>
                <span className="px-3 py-1 rounded-full bg-red-950/80 text-red-300 font-mono text-[11px] font-bold border border-red-500/40">
                  2200KV / 30A Peak
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-slate-100 to-red-100">
                  2x A2212 Motors
                </h3>
                <span className="text-xs text-red-400 font-mono font-semibold">High-RPM Brushless DC</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Outrunner BLDC motors driven by 30A ESC speed controllers. Controlled via <span className="text-red-300 font-mono font-bold">1000–2000µs PWM</span> timing, generating high-velocity rotation up to <span className="text-red-300 font-mono font-bold">3600 RPM</span> under load.
              </p>
            </div>

            <div className="relative z-10 pt-3 border-t border-red-500/20 flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/30">✓ 2200KV Outrunner</span>
              <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/30">✓ 30A ESC</span>
              <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/30">✓ 3600 RPM</span>
            </div>
          </div>

          {/* Card 4: Safety Sensors */}
          <div className="group relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#09152b]/90 via-[#040b17]/95 to-[#02050b]/95 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.25)] flex flex-col justify-between space-y-6">
            <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-blue-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <ShieldCheck className="w-6 h-6 animate-pulse" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 font-mono text-[11px] font-bold border border-blue-500/40">
                  40kHz Sonar
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-slate-100 to-blue-100">
                  3x HC-SR04 Sensors
                </h3>
                <span className="text-xs text-blue-400 font-mono font-semibold">Perimeter Safety Guard</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Acoustic sonar distance sensors firing 40kHz sonic pulses. If an obstacle breaches the <span className="text-blue-300 font-mono font-bold">100cm threshold</span>, MCU forces ESC pulses to 1000µs within <span className="text-blue-300 font-mono font-bold font-semibold">30ms</span>.
              </p>
            </div>

            <div className="relative z-10 pt-3 border-t border-blue-500/20 flex flex-wrap gap-1.5 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30">✓ Triple Radar</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30">✓ 40kHz Acoustic</span>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30">✓ &lt;30ms Cutoff</span>
            </div>
          </div>

        </div>
      )}

      {/* ─── DEEP TECHNICAL PHYSICS EXPLANATION SECTION ─── */}
      {(activeTab === 'all' || activeTab === 'esc' || activeTab === 'sonar') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ESC Signal & Motor Physics Deep Dive */}
          <div className="glass-card p-7 rounded-3xl space-y-5 border border-amber-500/40 bg-[#070c1e]/95 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 font-extrabold text-base border-b border-amber-500/20 pb-3">
              <Gauge className="w-6 h-6 text-amber-400" />
              <span>ESC Pulse Width Modulation & Motor Dynamics</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              The Electronic Speed Controller (ESC) converts digital logic commands from ESP32 GPIO pins 18 and 19 into high-frequency 3-phase AC power for the A2212 outrunner motor. Communication utilizes standard RC servo PWM timing operating at a fixed carrier frequency of <strong className="text-amber-300 font-mono">50 Hz (20ms frame period)</strong>:
            </p>

            <div className="space-y-2.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-amber-400 font-bold">1000 µs Pulse Width</span>
                <span className="text-slate-300">0% Throttle — Arming / Idle State</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-cyan-400 font-bold">1500 µs Pulse Width</span>
                <span className="text-slate-300">50% Throttle — ~1800 RPM Speed</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-emerald-400 font-bold">2000 µs Pulse Width</span>
                <span className="text-slate-300">100% Throttle — Max 3600 RPM Peak</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              During power-on, the ESC requires an arming sequence consisting of a sustained 1000µs pulse for at least 2000ms. If the ESP32 powers on with high pulse widths, the ESC safety latch engages, locking out motor power to prevent unintended spinning.
            </p>
          </div>

          {/* Ultrasonic Time-of-Flight Physics */}
          <div className="glass-card p-7 rounded-3xl space-y-5 border border-blue-500/40 bg-[#070c1e]/95 shadow-2xl">
            <div className="flex items-center gap-3 text-blue-400 font-extrabold text-base border-b border-blue-500/20 pb-3">
              <Radio className="w-6 h-6 text-blue-400" />
              <span>HC-SR04 Ultrasonic Sonar Time-of-Flight Physics</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              The HC-SR04 sensors provide active acoustic perimeter monitoring around the 3D hologram fan blades. Upon receiving a 10µs HIGH pulse on the TRIG pin, the transducer emits an 8-cycle sonic burst at <strong className="text-blue-300 font-mono">40 kHz</strong>:
            </p>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-2">
              <p className="text-cyan-400 font-bold text-sm">Distance Calculation Physics Formula:</p>
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-amber-300 font-bold text-sm text-center">
                Distance (cm) = [ Echo Duration (µs) × 0.0343 ] / 2
              </div>
              <p className="text-slate-400 text-[11px] pt-1">
                Where speed of sound in dry air at 20°C is v ≈ 343 m/s (0.0343 cm/µs). Division by 2 accounts for out-and-back wave travel.
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Sensors 1, 2, and 3 are triggered sequentially with a 30ms interval to eliminate acoustic cross-talk echo interference. When an object breaks the safety threshold (default 100cm), the firmware executes an instant hardware interrupt to pull ESC pulse widths to zero.
            </p>
          </div>

        </div>
      )}

      {/* ─── COMPLETE PINOUT WIRING SCHEMA TABLE ─── */}
      <div className="glass-card p-7 rounded-3xl space-y-6 border border-slate-800 bg-[#070c1e]/95 shadow-2xl">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-3">
            <Cable className="w-6 h-6 text-cyan-400" />
            <span>Complete Motor & Display Pinout Wiring Schema</span>
          </h3>
          <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
            10 Interconnect Channels
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Pinout Table */}
          <div className="lg:col-span-7 space-y-2.5">
            {pinouts.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-wrap items-center justify-between p-3.5 rounded-2xl border text-xs sm:text-sm transition-all hover:translate-x-1 ${item.color}`}
              >
                <span className="font-mono font-extrabold text-sm w-32">{item.pin}</span>
                <span className="text-slate-100 font-bold flex-1">{item.target}</span>
                <span className="font-mono text-xs text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  {item.type}
                </span>
              </div>
            ))}
          </div>

          {/* Critical Wiring Guidelines Box */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-amber-950/30 border border-amber-500/40 space-y-4 text-xs sm:text-sm shadow-xl">
            <div className="flex items-center gap-2.5 text-amber-400 font-extrabold text-base border-b border-amber-500/30 pb-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 animate-pulse" />
              <span>Critical Electrical Safety Guidelines</span>
            </div>

            <ul className="space-y-3 text-slate-300 list-disc list-inside leading-relaxed text-xs sm:text-sm">
              <li>
                <strong className="text-amber-300">ESC Arming Protocol:</strong> On startup, ESCs require 1000µs zero-throttle signal for 2 seconds before motor output will engage.
              </li>
              <li>
                <strong className="text-red-400">High Current Motor Supply:</strong> Connect 12V/15A external power or 3S LiPo battery directly to ESC V+ and GND. Do NOT route motor power through ESP32 rails.
              </li>
              <li>
                <strong className="text-blue-300">Ultrasonic Sensor Safety:</strong> Position HC-SR04 sensors facing outward away from blade turbulence to avoid false proximity trips.
              </li>
              <li>
                Ensure a <strong className="text-slate-100 font-bold">Common Ground</strong> connection between both ESP32 boards, ESCs, Hall Effect sensor, and external power supply.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}



