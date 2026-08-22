import React, { useState } from 'react';
import { Disc, ShieldCheck, Cpu, Radio, Sparkles, Activity, Layers, Crosshair } from 'lucide-react';

export default function HologramSimulator({
  rpm = 2400,
  brightness = 80,
  isDualMode = true,
  overlapCm = 13
}) {
  const [activeHotspot, setActiveHotspot] = useState(null);

  return (
    <div className="w-full space-y-4">
      {/* ─── DEDICATED ANIMATED HARDWARE RIG COVER CARD ─── */}
      <div className="group relative rounded-3xl overflow-hidden border border-cyan-500/40 bg-gradient-to-b from-[#080f24]/95 via-[#030612]/95 to-[#02040a]/95 p-4 sm:p-6 shadow-[0_0_60px_rgba(0,243,255,0.25)] transition-all duration-500 hover:border-cyan-400/80 hover:shadow-[0_0_80px_rgba(0,243,255,0.35)] flex flex-col justify-between space-y-4">
        
        {/* Ambient Volumetric Backdrop Glow */}
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-tr from-cyan-500/10 via-slate-900/10 to-transparent blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* ─── TOP TELEMETRY HEADER BAR ─── */}
        <div className="flex flex-wrap items-center justify-between gap-2 z-20 pb-3 border-b border-cyan-500/20">
          <div className="bg-slate-950/90 px-3.5 py-1.5 rounded-full border border-cyan-500/40 text-xs font-extrabold text-cyan-300 backdrop-blur-xl flex items-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <div className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
            </div>
            <span>FUSION 5 GROUP • Hardware Unit</span>
          </div>

          <div className="bg-slate-950/90 px-3.5 py-1.5 rounded-full border border-purple-500/40 text-xs font-mono text-purple-300 backdrop-blur-xl flex items-center gap-2 shadow-lg">
            <Disc className="w-4 h-4 text-purple-400 animate-spin-slow" />
            <span>60 ROWS × 100 LEDS</span>
          </div>
        </div>

        {/* ─── MAIN HARDWARE IMAGE FRAME (CLEAN, ZERO OVERLAP) ─── */}
        <div className="relative w-full h-full flex items-center justify-center py-2">
          <img
            src="/fusion5_hardware_cover.jpg"
            alt="Fusion 5 Hardware Rig"
            className="max-w-full max-h-[440px] object-contain rounded-2xl drop-shadow-[0_0_35px_rgba(0,243,255,0.35)] transition-transform duration-500 group-hover:scale-[1.01]"
          />

          {/* Animated Rotating Radar Overlay */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-cyan-400/20 border-dashed animate-radar-spin"></div>

          {/* Pulsing Hologram Center Aura */}
          <div
            className="pointer-events-none absolute top-[43%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-cyan-400/40 bg-cyan-400/5 backdrop-blur-[1px] animate-hologram-pulse pointer-events-auto cursor-pointer"
            onMouseEnter={() => setActiveHotspot('center')}
            onMouseLeave={() => setActiveHotspot(null)}
          ></div>

          {/* Interactive Tooltip */}
          {activeHotspot === 'center' && (
            <div className="absolute top-[32%] left-1/2 -translate-x-1/2 bg-slate-950/95 border border-cyan-400 px-4 py-2 rounded-2xl text-xs font-mono text-cyan-300 backdrop-blur-2xl shadow-[0_0_25px_rgba(0,243,255,0.4)] animate-fade-in z-30">
              <span className="font-bold text-slate-100">Center Overlap Zone:</span> 13cm Dual Fan Convergence
            </div>
          )}
        </div>

        {/* ─── BOTTOM TELEMETRY FOOTER BAR ─── */}
        <div className="flex flex-wrap items-center justify-between gap-2 z-20 pt-3 border-t border-cyan-500/20">
          <div className="bg-slate-950/90 px-3.5 py-1.5 rounded-full border border-blue-500/40 text-xs font-mono text-blue-300 backdrop-blur-xl flex items-center gap-2 shadow-lg">
            <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>3x SONAR POSTS + ESP32</span>
          </div>

          <div className="bg-slate-950/90 px-3.5 py-1.5 rounded-full border border-emerald-500/40 text-xs font-mono text-emerald-300 backdrop-blur-xl flex items-center gap-2 shadow-lg">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>DUAL 2200KV BLDC MOTORS</span>
          </div>
        </div>
      </div>
    </div>
  );
}


