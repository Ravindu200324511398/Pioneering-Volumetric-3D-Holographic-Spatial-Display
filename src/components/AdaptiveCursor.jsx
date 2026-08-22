import React, { useEffect, useState } from 'react';

export default function AdaptiveCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrameId;

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive element
      const target = e.target;
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer');
      setIsHovered(!!isInteractive);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    // Smooth lerp follower for expanding ring
    const loop = () => {
      setFollowerPos((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.2,
        y: prev.y + (position.y - prev.y) * 0.2,
      }));
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [position.x, position.y, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Expanding Outer Ring Follower */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-150 ease-out backdrop-blur-[1px] ${
          isHovered
            ? 'w-12 h-12 border-cyan-400/80 bg-cyan-400/10 shadow-[0_0_20px_rgba(0,243,255,0.4)] scale-110'
            : isClicking
            ? 'w-6 h-6 border-emerald-400/90 bg-emerald-400/20 scale-90'
            : 'w-9 h-9 border-cyan-500/40 bg-cyan-500/5'
        }`}
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
        }}
      />

      {/* Central Precision Cursor Dot */}
      <div
        className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_8px_#00f3ff]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </div>
  );
}
