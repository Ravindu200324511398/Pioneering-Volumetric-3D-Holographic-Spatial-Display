import React from 'react';
import { Layers, MoveVertical, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

export default function GeometryViewer({ distanceCm, setDistanceCm, overlapCm, setOverlapCm, angleOffset1, setAngleOffset1, angleOffset2, setAngleOffset2 }) {
  return (
    <section className="py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-cyan-500/20 pb-4">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-6 h-6 text-cyan-400" />
          <span>Interactive 3D Geometry & Array Alignment</span>
        </h2>
        <p className="text-xs text-slate-400">
          Visual representation of the 2×1 vertical fan layout, center distance spacing, overlap region, and angle calibration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Interactive Blueprint Canvas Simulation */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-lg h-[520px] rounded-3xl bg-slate-950/90 border border-cyan-500/30 p-6 flex flex-col items-center justify-between overflow-hidden shadow-[0_0_40px_rgba(0,243,255,0.1)]">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>

            {/* Fan 1 (Top Unit) */}
            <div className="relative flex flex-col items-center z-10">
              <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-2 border-dashed border-cyan-400/60 bg-cyan-950/20 animate-spin-slow">
                <div className="absolute w-full h-1 bg-cyan-400/80 rounded-full"></div>
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center text-[10px] font-mono text-cyan-300">
                  F1
                </div>
              </div>
              <span className="text-[11px] font-bold text-cyan-300 mt-1">FAN 1 (Top • ID=1)</span>
            </div>

            {/* Overlap Zone Badge */}
            <div className="relative z-10 my-auto flex flex-col items-center">
              <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/40 backdrop-blur-md text-center shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-100">
                  <MoveVertical className="w-4 h-4 text-pink-400" />
                  <span>Overlap Zone: {overlapCm} cm</span>
                </div>
                <p className="text-[10px] text-cyan-300 font-mono">Distance between centers: {distanceCm} cm</p>
              </div>
            </div>

            {/* Fan 2 (Bottom Unit) */}
            <div className="relative flex flex-col items-center z-10">
              <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-2 border-dashed border-purple-400/60 bg-purple-950/20 animate-spin-slow">
                <div className="absolute w-full h-1 bg-purple-400/80 rounded-full"></div>
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-purple-400 flex items-center justify-center text-[10px] font-mono text-purple-300">
                  F2
                </div>
              </div>
              <span className="text-[11px] font-bold text-purple-300 mt-1">FAN 2 (Bottom • ID=2)</span>
            </div>
          </div>
        </div>

        {/* Right Adjustments & Specifications */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Array Geometry Controls</h3>

            {/* Distance Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Distance Between Centers</span>
                <span className="text-cyan-400 font-mono">{distanceCm} cm</span>
              </div>
              <input
                type="range"
                min="20"
                max="45"
                value={distanceCm}
                onChange={(e) => setDistanceCm(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Overlap Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Vertical Overlap Zone</span>
                <span className="text-pink-400 font-mono">{overlapCm} cm</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={overlapCm}
                onChange={(e) => setOverlapCm(Number(e.target.value))}
                className="w-full accent-pink-400"
              />
            </div>
          </div>

          {/* Specifications Overview Table */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Default Mechanical Specs</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Array Configuration</span>
                <span className="text-slate-200 font-semibold">2 Rows × 1 Column Vertical</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">LED Count per Fan</span>
                <span className="text-cyan-400 font-mono font-bold">100 APA102-2020 LEDs</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Angular Resolution</span>
                <span className="text-slate-200 font-semibold">6.0 Degrees (60 sectors)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Hall Sensor Module</span>
                <span className="text-slate-200 font-semibold">Digital A3144 (GPIO 4)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Rotation Sync Tolerance</span>
                <span className="text-emerald-400 font-mono">± 0.25 ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
