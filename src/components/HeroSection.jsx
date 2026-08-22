import React from 'react';
import { Play, Sliders, UploadCloud, ShieldCheck, Cpu, Zap, Radio, ChevronRight, Activity, Gauge, Sparkles, Layers, ArrowRight, Eye, Code2, Disc } from 'lucide-react';
import HologramSimulator from './HologramSimulator';
import SlidingNumber from './SlidingNumber';

export default function HeroSection({
  setActiveTab,
  selectedPreset,
  rpm,
  setRpm,
  brightness,
  setBrightness,
  isDualMode,
  angleOffset1,
  angleOffset2
}) {
  return (
    <div className="relative space-y-24 pb-20">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-6 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Inline Spatial Feature Pill Bar (Clean Flow, Zero Overlap) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-1.5 text-xs font-mono text-cyan-300 backdrop-blur shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400"></span>
                </span>
                / fusion5_array [live]
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-[#030714]/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-300 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                Constellation Engine
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-[#030714]/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-purple-300 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                60 Rows × 100 LEDs
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-[#030714]/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Sonar Shield Active
              </span>
            </div>

            {/* Kinetic Typography Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              <span className="block text-slate-100">Hologram Array,</span>
              <span className="block text-transparent bg-clip-text bg-[linear-gradient(110deg,#00f3ff_10%,#a855f7_45%,#ec4899_80%)] bg-[length:200%_100%]">
                in motion.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              A living gallery of high-speed spatial light interaction. Combining dual-core ESP32-S3 microcontrollers, 
              real-time polar coordinate matrix transformation, sub-millisecond Hall Effect rotation sync, and ultrasonic perimeter safety.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab('controller')}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-[0_10px_40px_-10px_rgba(0,243,255,0.6)] transition-all hover:scale-105 active:scale-95"
              >
                <Sliders className="w-4 h-4 text-slate-950" />
                <span>Explore Live Array</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setActiveTab('studio')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur transition-colors hover:bg-slate-800 hover:border-cyan-500/40"
              >
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>Hologram Media Studio</span>
              </button>
            </div>

            {/* Interactive Telemetry Counters */}
            <div className="space-y-3 pt-6 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Interactive Telemetry Counters:</span>
                <div className="flex gap-1.5 font-mono text-[11px]">
                  {[1200, 2400, 3000].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setRpm && setRpm(speed)}
                      className={`px-2.5 py-0.5 rounded-md border transition-all ${
                        rpm === speed
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {speed} RPM
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-card p-3.5 rounded-2xl text-center space-y-1">
                  <p className="text-xl font-bold text-cyan-400 flex items-center justify-center">
                    <SlidingNumber value={200} />
                  </p>
                  <p className="text-[11px] text-slate-400">APA102 LEDs / Unit</p>
                </div>

                <div className="glass-card p-3.5 rounded-2xl text-center space-y-1">
                  <p className="text-xl font-bold text-purple-400 flex items-center justify-center">
                    <SlidingNumber value={rpm} suffix="RPM" />
                  </p>
                  <p className="text-[11px] text-slate-400">Target RPM Sync</p>
                </div>

                <div className="glass-card p-3.5 rounded-2xl text-center space-y-1">
                  <p className="text-xl font-bold text-pink-400 flex items-center justify-center">
                    <SlidingNumber value={13} suffix="cm" />
                  </p>
                  <p className="text-[11px] text-slate-400">Vertical Overlap</p>
                </div>

                <div className="glass-card p-3.5 rounded-2xl text-center space-y-1">
                  <p className="text-xl font-bold text-emerald-400 flex items-center justify-center">
                    <SlidingNumber value={brightness} suffix="%" />
                  </p>
                  <p className="text-[11px] text-slate-400">PWM Brightness</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Hologram Canvas Interactive Simulation */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full max-w-md lg:max-w-none">
              <HologramSimulator
                selectedPreset={selectedPreset}
                rpm={rpm}
                brightness={brightness}
                isDualMode={isDualMode}
                angleOffset1={angleOffset1}
                angleOffset2={angleOffset2}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6 ENGINEERING DISCIPLINES GRID (INVISIGRID STYLE) ─── */}
      <section className="relative border-t border-slate-800/80 pt-20 pb-12 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 text-xs font-mono text-cyan-400 mb-3">
            / engineering_disciplines
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-100">
            Six disciplines of spatial hologram engineering.
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl text-sm leading-relaxed">
            Every subsystem in the Fusion 5 hardware and web array is documented, phase-synchronized, and live-tested.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#070c1e]/70 p-7 backdrop-blur transition-all hover:-translate-y-1 hover:border-cyan-500/50">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <div className="relative flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Disc className="w-5 h-5 animate-spin-slow" />
              </div>
              <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[10px] uppercase text-cyan-300 font-bold">
                01 Dual POV
              </span>
            </div>
            <h3 className="relative mt-6 text-xl font-bold text-slate-100">Dual Rotor Choreography</h3>
            <p className="relative mt-2 text-xs text-slate-400 leading-relaxed">
              Interlocking 2x1 vertical fan array operating at 2400 RPM with 13cm spatial overlap field.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#070c1e]/70 p-7 backdrop-blur transition-all hover:-translate-y-1 hover:border-purple-500/50">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <div className="relative flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[10px] uppercase text-purple-300 font-bold">
                02 Matrix Engine
              </span>
            </div>
            <h3 className="relative mt-6 text-xl font-bold text-slate-100">Polar Image Transformation</h3>
            <p className="relative mt-2 text-xs text-slate-400 leading-relaxed">
              Converts Cartesian graphics to 60 angular rows × 100 radial LEDs RGB565 binary payloads.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#070c1e]/70 p-7 backdrop-blur transition-all hover:-translate-y-1 hover:border-pink-500/50">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-pink-500/20 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <div className="relative flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                <Radio className="w-5 h-5" />
              </div>
              <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[10px] uppercase text-pink-300 font-bold">
                03 Telemetry Link
              </span>
            </div>
            <h3 className="relative mt-6 text-xl font-bold text-slate-100">ESP32 WebSocket Protocol</h3>
            <p className="relative mt-2 text-xs text-slate-400 leading-relaxed">
              Real-time 100Hz bidirectional WebSocket broadcast at `ws://192.168.4.1/ws` for telemetry.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#070c1e]/70 p-7 backdrop-blur transition-all hover:-translate-y-1 hover:border-emerald-500/50">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <div className="relative flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[10px] uppercase text-emerald-300 font-bold">
                04 Sonar Shield
              </span>
            </div>
            <h3 className="relative mt-6 text-xl font-bold text-slate-100">Ultrasonic Safety Guard</h3>
            <p className="relative mt-2 text-xs text-slate-400 leading-relaxed">
              Triple HC-SR04 proximity sensor perimeter with emergency hardware ESC cut-off.
            </p>
          </div>

          {/* Card 5 */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#070c1e]/70 p-7 backdrop-blur transition-all hover:-translate-y-1 hover:border-amber-500/50">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <div className="relative flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[10px] uppercase text-amber-300 font-bold">
                05 Parallax Field
              </span>
            </div>
            <h3 className="relative mt-6 text-xl font-bold text-slate-100">Volumetric Hologram Field</h3>
            <p className="relative mt-2 text-xs text-slate-400 leading-relaxed">
              Spatial light persistence generating pseudo-3D floating graphics in free space.
            </p>
          </div>

          {/* Card 6 */}
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#070c1e]/70 p-7 backdrop-blur transition-all hover:-translate-y-1 hover:border-indigo-500/50">
            <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/20 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <div className="relative flex items-start justify-between">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <span className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-1 font-mono text-[10px] uppercase text-indigo-300 font-bold">
                06 ESC Drivers
              </span>
            </div>
            <h3 className="relative mt-6 text-xl font-bold text-slate-100">50Hz ESC Motor PWM</h3>
            <p className="relative mt-2 text-xs text-slate-400 leading-relaxed">
              Precise 1000–2000µs ESC pulse width timing driving dual A2212 2200KV BLDC motors.
            </p>
          </div>
        </div>
      </section>

      {/* ─── MOTION DOCTRINE SECTION (INVISIGRID STYLE) ─── */}
      <section className="relative overflow-hidden border-t border-slate-800/80 py-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/30 px-3 py-1 text-xs font-mono text-purple-300">
            / motion_doctrine
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <div className="relative rounded-2xl border border-slate-800 bg-[#070c1e]/60 p-8 backdrop-blur-xl space-y-3">
            <div className="font-mono text-xs text-cyan-400 font-bold">/ 01</div>
            <h3 className="text-xl font-bold text-slate-100">Listen first.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every revolution starts with precise synchronization. We study Hall sensor interrupt pulses to lock phase timing before rendering photons.
            </p>
            <div className="h-px bg-gradient-to-r from-cyan-500/60 to-transparent pt-3"></div>
          </div>

          <div className="relative rounded-2xl border border-slate-800 bg-[#070c1e]/60 p-8 backdrop-blur-xl space-y-3">
            <div className="font-mono text-xs text-purple-400 font-bold">/ 02</div>
            <h3 className="text-xl font-bold text-slate-100">Compose with restraint.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              One perfectly converted polar binary payload outperforms standard video streams. 12KB RGB565 buffers render instantly over Wi-Fi.
            </p>
            <div className="h-px bg-gradient-to-r from-purple-500/60 to-transparent pt-3"></div>
          </div>

          <div className="relative rounded-2xl border border-slate-800 bg-[#070c1e]/60 p-8 backdrop-blur-xl space-y-3">
            <div className="font-mono text-xs text-pink-400 font-bold">/ 03</div>
            <h3 className="text-xl font-bold text-slate-100">Ship the feeling.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Performance is the essence of 3D holography. Every frame is rendered at 2400 RPM for seamless persistence of vision.
            </p>
            <div className="h-px bg-gradient-to-r from-pink-500/60 to-transparent pt-3"></div>
          </div>
        </div>
      </section>

    </div>
  );
}


