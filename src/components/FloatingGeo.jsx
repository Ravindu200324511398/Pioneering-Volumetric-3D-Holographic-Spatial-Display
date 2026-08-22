import React from 'react';

export default function FloatingGeo() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 hidden md:block">
      {/* Top Right Floating 3D Wireframe Box */}
      <div className="absolute right-[6%] top-[14%] w-36 h-36 perspective-[1000px]">
        <div className="relative w-full h-full animate-spin-3d transform-style-3d">
          <div className="absolute inset-0 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-sm shadow-[0_0_20px_rgba(0,243,255,0.15)] translate-z-[45px]"></div>
          <div className="absolute inset-0 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-sm shadow-[0_0_20px_rgba(0,243,255,0.15)] -translate-z-[45px]"></div>
          <div className="absolute inset-0 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-sm rotate-y-90 translate-z-[45px]"></div>
          <div className="absolute inset-0 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-sm rotate-y-90 -translate-z-[45px]"></div>
        </div>
      </div>

      {/* Bottom Left Floating Concentric Cyan Rings */}
      <div className="absolute left-[4%] bottom-[16%] w-48 h-48 rounded-full border border-cyan-400/20 flex items-center justify-center animate-pulse">
        <div className="w-36 h-36 rounded-full border border-cyan-400/25 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-cyan-400/30"></div>
        </div>
      </div>
    </div>
  );
}
