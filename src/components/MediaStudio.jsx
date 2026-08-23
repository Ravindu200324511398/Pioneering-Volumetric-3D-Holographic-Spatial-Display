import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Download, FileCode, Check, Image as ImageIcon, Video, Sparkles, Filter, Eye, Sliders, ArrowRight, Disc, Layers, Clock, Type, Play, RefreshCw } from 'lucide-react';
import { IMAGE_PRESETS, VIDEO_PRESETS } from '../data/presetData';

export default function MediaStudio({ setSelectedPreset, isDualMode: propIsDualMode, distanceCm: propDistanceCm }) {
  const [sourceMode, setSourceMode] = useState('image'); // 'image' | 'clock' | 'text'
  const [configMode, setConfigMode] = useState('single'); // 'single' | 'dual'
  const [centerDistance, setCenterDistance] = useState(31);
  const [angleOffset1, setAngleOffset1] = useState(0);
  const [angleOffset2, setAngleOffset2] = useState(0);
  const [imageScale, setImageScale] = useState(73);
  const [saturation, setSaturation] = useState(100);
  
  // Custom Text State
  const FONT_OPTIONS = [
    { id: 'orbitron', name: 'Orbitron', family: "'Orbitron', sans-serif" },
    { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif" },
    { id: 'mono', name: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
    { id: 'russo', name: 'Russo One', family: "'Russo One', sans-serif" },
    { id: 'cinzel', name: 'Cinzel', family: "'Cinzel', serif" },
  ];

  const [customText, setCustomText] = useState('FUSION 5 • UOM FIT');
  const [fontFamily, setFontFamily] = useState("'Orbitron', sans-serif");
  const [textColor, setTextColor] = useState('#00f3ff');
  const [textSize, setTextSize] = useState(36);
  const [textSpeed, setTextSpeed] = useState(5);

  // Live Clock State
  const CLOCK_FONT_OPTIONS = [
    { id: 'jetbrains', name: 'JetBrains', family: "'JetBrains Mono', monospace" },
    { id: 'orbitron', name: 'Orbitron', family: "'Orbitron', sans-serif" },
    { id: 'sharetech', name: 'Digital HUD', family: "'Share Tech Mono', monospace" },
    { id: 'vt323', name: 'Arcade VT323', family: "'VT323', monospace" },
    { id: 'russo', name: 'Russo Heavy', family: "'Russo One', sans-serif" },
  ];

  const [clockTheme, setClockTheme] = useState('#00f3ff');
  const [clockFormat, setClockFormat] = useState('12h'); // '12h' | '24h'
  const [clockFontFamily, setClockFontFamily] = useState("'JetBrains Mono', monospace");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Clock ticker timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Default to University of Moratuwa emblem or sample image
  useEffect(() => {
    setSelectedImageSrc('/Fusion5_POV_Images/uom.png');
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImageSrc(event.target.result);
      setStatusMessage(`Loaded custom image (${file.name})`);
    };
    reader.readAsDataURL(file);
  };

  // Draw overlay canvas preview (Images / Live Clock / Custom Text)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const cw = canvas.width;
    const ch = canvas.height;

    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#050917';
    ctx.fillRect(0, 0, cw, ch);

    if (sourceMode === 'image') {
      if (!selectedImageSrc) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedImageSrc;
      img.onload = () => {
        ctx.save();
        ctx.filter = `saturate(${saturation}%)`;
        
        const drawWidth = (cw * (imageScale / 100)) * 0.75;
        const drawHeight = (ch * (imageScale / 100)) * 0.75;
        const drawX = (cw - drawWidth) / 2;
        const drawY = (ch - drawHeight) / 2;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();

        drawGreenBoundaries(ctx, cw, ch);
      };
    } else if (sourceMode === 'clock') {
      // 🕒 LIVE SPATIAL HOLOGRAM CLOCK RENDERER
      ctx.save();
      
      // Outer Clock Dial Ring
      ctx.strokeStyle = clockTheme;
      ctx.lineWidth = 3;
      ctx.shadowColor = clockTheme;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(cw / 2, ch / 2, cw * 0.38, 0, Math.PI * 2);
      ctx.stroke();

      // Seconds Tick Sweep Hand
      const seconds = currentTime.getSeconds();
      const secAngle = (seconds / 60) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cw / 2, ch / 2);
      ctx.lineTo(cw / 2 + Math.cos(secAngle) * (cw * 0.32), ch / 2 + Math.sin(secAngle) * (ch * 0.32));
      ctx.stroke();

      // Digital Clock Time String
      const hours = clockFormat === '12h' 
        ? (currentTime.getHours() % 12 || 12).toString().padStart(2, '0')
        : currentTime.getHours().toString().padStart(2, '0');
      const mins = currentTime.getMinutes().toString().padStart(2, '0');
      const secs = currentTime.getSeconds().toString().padStart(2, '0');
      const ampm = clockFormat === '12h' ? (currentTime.getHours() >= 12 ? ' PM' : ' AM') : '';
      
      const timeStr = `${hours}:${mins}:${secs}${ampm}`;

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 34px ${clockFontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(timeStr, cw / 2, ch / 2 - 10);

      // Date String
      const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
      ctx.fillStyle = clockTheme;
      ctx.font = 'bold 14px "Outfit", sans-serif';
      ctx.fillText(dateStr, cw / 2, ch / 2 + 30);

      ctx.restore();

      drawGreenBoundaries(ctx, cw, ch);
    } else if (sourceMode === 'text') {
      // 📝 CUSTOM HOLOGRAM TEXT RENDERER
      ctx.save();

      ctx.shadowColor = textColor;
      ctx.shadowBlur = 20;
      ctx.fillStyle = textColor;
      ctx.font = `900 ${textSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText(customText || 'FUSION 5', cw / 2, ch / 2);

      // Neon Sub-Text Line
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText('3D SPATIAL LIGHT ARRAY', cw / 2, ch / 2 + 45);

      ctx.restore();

      drawGreenBoundaries(ctx, cw, ch);
    }
  }, [selectedImageSrc, configMode, imageScale, saturation, centerDistance, sourceMode, currentTime, clockFormat, clockTheme, clockFontFamily, customText, fontFamily, textColor, textSize]);

  const drawGreenBoundaries = (ctx, cw, ch) => {
    ctx.strokeStyle = '#22c55e'; // Vibrant neon green line
    ctx.lineWidth = 2;

    if (configMode === 'single') {
      const radius = Math.min(cw, ch) * 0.38;
      ctx.beginPath();
      ctx.arc(cw / 2, ch / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      const radius = Math.min(cw, ch) * 0.32;
      const topCenterY = ch * 0.35;
      const bottomCenterY = ch * 0.65;

      ctx.beginPath();
      ctx.arc(cw / 2, topCenterY, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cw / 2, bottomCenterY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const handleUploadToFan1 = () => {
    setStatusMessage(`Pushed ${sourceMode.toUpperCase()} buffer (12KB) to Fan 1 (Top) over Wi-Fi REST.`);
  };

  const handleUploadToFan2 = () => {
    setStatusMessage(`Pushed ${sourceMode.toUpperCase()} buffer (12KB) to Fan 2 (Bottom) over Wi-Fi REST.`);
  };

  const handleUploadSingle = () => {
    setStatusMessage(`Pushed ${sourceMode.toUpperCase()} buffer (12KB) to Hologram Fan.`);
  };

  return (
    <section className="py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* ─── TOP MODE SELECTOR CARD ─── */}
      <div className="rounded-3xl border border-cyan-500/30 bg-[#070c1e]/90 p-3 backdrop-blur-2xl grid grid-cols-3 gap-3 shadow-lg">
        <button
          onClick={() => setSourceMode('image')}
          className={`py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-300 ${
            sourceMode === 'image'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image / Video Mode</span>
        </button>

        <button
          onClick={() => setSourceMode('clock')}
          className={`py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-300 ${
            sourceMode === 'clock'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Live Hologram Clock</span>
        </button>

        <button
          onClick={() => setSourceMode('text')}
          className={`py-3.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-300 ${
            sourceMode === 'text'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Custom Text Mode</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#080d24]/95 via-[#050817]/95 to-[#02040b]/95 p-7 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] space-y-6">
          <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              {sourceMode === 'image' && <Sparkles className="w-6 h-6" />}
              {sourceMode === 'clock' && <Clock className="w-6 h-6 text-purple-400" />}
              {sourceMode === 'text' && <Type className="w-6 h-6 text-emerald-400" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-cyan-400 uppercase">
                {sourceMode === 'image' && 'HOLOGRAM ARRAY'}
                {sourceMode === 'clock' && 'LIVE SPATIAL CLOCK'}
                {sourceMode === 'text' && 'SPATIAL TEXT MATRIX'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {sourceMode === 'image' && 'RGB565 Image Buffer Converter'}
                {sourceMode === 'clock' && 'Realtime Ticking Holographic Clock'}
                {sourceMode === 'text' && 'Live Neon Text Projection Engine'}
              </p>
            </div>
          </div>

          {/* MODE 1: IMAGE / VIDEO CONTROLS */}
          {sourceMode === 'image' && (
            <>
              {/* Configuration Mode Toggle */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Configuration Mode</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#050814] p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setConfigMode('single')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      configMode === 'single' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    Single Fan
                  </button>
                  <button
                    onClick={() => setConfigMode('dual')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      configMode === 'dual' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400'
                    }`}
                  >
                    Dual Fan (Overlap)
                  </button>
                </div>
              </div>

              {/* File Picker */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.gif"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(0,243,255,0.35)] transition-all uppercase tracking-wider border border-cyan-400/40"
                >
                  <UploadCloud className="w-4 h-4 text-slate-950" />
                  <span>Select Image, GIF, or Video</span>
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Image Scale</span>
                    <span className="font-mono text-cyan-400 font-extrabold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40">{imageScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={imageScale}
                    onChange={(e) => setImageScale(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Color Saturation</span>
                    <span className="font-mono text-emerald-400 font-extrabold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-emerald-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </>
          )}

          {/* MODE 2: LIVE HOLOGRAPHIC CLOCK CONTROLS */}
          {sourceMode === 'clock' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Clock Format</label>
                <div className="grid grid-cols-2 gap-2 bg-[#050814] p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setClockFormat('12h')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      clockFormat === '12h' ? 'bg-purple-600 text-white font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    12-Hour (AM/PM)
                  </button>
                  <button
                    onClick={() => setClockFormat('24h')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      clockFormat === '24h' ? 'bg-purple-600 text-white font-extrabold' : 'text-slate-400'
                    }`}
                  >
                    24-Hour Military
                  </button>
                </div>
              </div>

              {/* Clock Number Digit Font Style Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Number Digit Font Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CLOCK_FONT_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setClockFontFamily(f.family)}
                      style={{ fontFamily: f.family }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center truncate ${
                        clockFontFamily === f.family
                          ? 'border-purple-400 bg-purple-950/80 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-102'
                          : 'border-slate-800 bg-[#050814] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Neon Clock Color Theme</label>
                <div className="flex items-center gap-3">
                  {[
                    { name: 'Cyan', color: '#00f3ff' },
                    { name: 'Purple', color: '#a855f7' },
                    { name: 'Emerald', color: '#10b981' },
                    { name: 'Gold', color: '#f59e0b' },
                  ].map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setClockTheme(t.color)}
                      style={{ backgroundColor: t.color }}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${
                        clockTheme === t.color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: DISPLAY CUSTOM TEXT CONTROLS */}
          {sourceMode === 'text' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Custom Text String</label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter hologram text..."
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-2xl px-4 py-3 text-slate-100 font-bold text-sm focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              {/* Font Family Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Font Style Family</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFontFamily(f.family)}
                      style={{ fontFamily: f.family }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center truncate ${
                        fontFamily === f.family
                          ? 'border-emerald-400 bg-emerald-950/80 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-102'
                          : 'border-slate-800 bg-[#050814] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Text Font Size ({textSize}px)</label>
                <input
                  type="range"
                  min="16"
                  max="140"
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-full accent-emerald-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Neon Text Glow Theme</label>
                <div className="flex items-center gap-3">
                  {[
                    { name: 'Cyan', color: '#00f3ff' },
                    { name: 'Purple', color: '#a855f7' },
                    { name: 'Emerald', color: '#10b981' },
                    { name: 'Pink', color: '#ec4899' },
                  ].map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setTextColor(t.color)}
                      style={{ backgroundColor: t.color }}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${
                        textColor === t.color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Upload Buttons */}
          <div className="pt-4 border-t border-slate-800/80">
            {configMode === 'single' ? (
              <button
                onClick={handleUploadSingle}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all uppercase tracking-wider border border-emerald-400/40"
              >
                <ArrowRight className="w-4 h-4 text-slate-950" />
                <span>Upload {sourceMode.toUpperCase()} to Fan</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleUploadToFan1}
                  className="py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all uppercase tracking-wider border border-cyan-400/40"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                  <span>Upload Fan 1</span>
                </button>
                <button
                  onClick={handleUploadToFan2}
                  className="py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all uppercase tracking-wider border border-purple-400/40"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                  <span>Upload Fan 2</span>
                </button>
              </div>
            )}

            {statusMessage && (
              <p className="text-center text-xs text-emerald-400 font-mono font-bold pt-3 animate-fade-in">
                ✓ {statusMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right Canvas Preview Area */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-[#060918]/95 via-[#030612]/95 to-[#010309]/95 p-6 backdrop-blur-2xl flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.7)] min-h-[520px]">
          
          {/* Top Status Pill Badge */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/85 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 backdrop-blur-md shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              {sourceMode === 'image' && 'Image Ready (60×100 Polar Mesh)'}
              {sourceMode === 'clock' && 'Live Spatial Clock Ticking (60 FPS)'}
              {sourceMode === 'text' && 'Custom Text Matrix Streaming'}
            </span>
          </div>

          {/* Main Canvas Preview Container */}
          <div className="relative w-full h-full flex items-center justify-center p-4 min-h-[440px]">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="max-w-full max-h-[460px] object-contain rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(0,243,255,0.2)]"
            />
          </div>

          {/* Bottom Info Pill Badge */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-slate-950/90 border border-slate-800 text-xs font-mono font-bold text-slate-300 backdrop-blur-md shadow-lg">
            {configMode === 'single' ? '1 Frame • 12,000 Byte RGB565 Buffer' : '1 Frame • 12,000 Byte Buffer per fan'}
          </div>
        </div>

      </div>
    </section>
  );
}
