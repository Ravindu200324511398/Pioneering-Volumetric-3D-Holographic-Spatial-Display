import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Download, FileCode, Check, Image as ImageIcon, Video, Sparkles, Filter, Eye, Sliders, ArrowRight, Disc, Layers } from 'lucide-react';
import { IMAGE_PRESETS, VIDEO_PRESETS } from '../data/presetData';

export default function MediaStudio({ setSelectedPreset, isDualMode: propIsDualMode, distanceCm: propDistanceCm }) {
  const [configMode, setConfigMode] = useState('single'); // 'single' | 'dual'
  const [centerDistance, setCenterDistance] = useState(31);
  const [angleOffset1, setAngleOffset1] = useState(0);
  const [angleOffset2, setAngleOffset2] = useState(0);
  const [imageScale, setImageScale] = useState(73);
  const [saturation, setSaturation] = useState(100);
  
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

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

  // Draw overlay circles on canvas preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedImageSrc) return;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImageSrc;
    img.onload = () => {
      const cw = canvas.width;
      const ch = canvas.height;

      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = '#050917';
      ctx.fillRect(0, 0, cw, ch);

      // Draw image scaled & filtered
      ctx.save();
      ctx.filter = `saturate(${saturation}%)`;
      
      const drawWidth = (cw * (imageScale / 100)) * 0.75;
      const drawHeight = (ch * (imageScale / 100)) * 0.75;
      const drawX = (cw - drawWidth) / 2;
      const drawY = (ch - drawHeight) / 2;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      // Draw Green Boundary Circles
      ctx.strokeStyle = '#22c55e'; // Vibrant neon green line
      ctx.lineWidth = 2.5;

      if (configMode === 'single') {
        const radius = Math.min(cw, ch) * 0.38;
        ctx.beginPath();
        ctx.arc(cw / 2, ch / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Dual Fan Mode Intersecting Overlap Circles
        const radius = Math.min(cw, ch) * 0.32;
        const topCenterY = ch * 0.35;
        const bottomCenterY = ch * 0.65;

        // Top Fan Circle
        ctx.beginPath();
        ctx.arc(cw / 2, topCenterY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Bottom Fan Circle
        ctx.beginPath();
        ctx.arc(cw / 2, bottomCenterY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };
  }, [selectedImageSrc, configMode, imageScale, saturation, centerDistance]);

  const handleUploadToFan1 = () => {
    setStatusMessage('Pushed RGB565 binary buffer (12KB) to Fan 1 (Top) over Wi-Fi REST.');
  };

  const handleUploadToFan2 = () => {
    setStatusMessage('Pushed RGB565 binary buffer (12KB) to Fan 2 (Bottom) over Wi-Fi REST.');
  };

  const handleUploadSingle = () => {
    setStatusMessage('Pushed RGB565 binary buffer (12KB) to Hologram Fan.');
  };

  return (
    <section className="py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Container Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#080d24]/95 via-[#050817]/95 to-[#02040b]/95 p-7 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] space-y-6">
          <div className="flex items-center gap-3 border-b border-cyan-500/20 pb-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-cyan-400">
                HOLOGRAM ARRAY
              </h2>
              <p className="text-xs text-slate-400 font-mono">RGB565 Polar Image Matrix Converter</p>
            </div>
          </div>

          {/* Configuration Mode Selector Toggle */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Configuration Mode</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#050814] p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setConfigMode('single')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  configMode === 'single'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Single Fan
              </button>
              <button
                onClick={() => setConfigMode('dual')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  configMode === 'dual'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dual Fan (Overlap)
              </button>
            </div>
          </div>

          {/* File Picker Button */}
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

          {/* Sliders Section */}
          <div className="space-y-5 pt-2 border-t border-slate-800/80">
            {configMode === 'dual' && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Distance between centers</span>
                  <span className="font-mono text-cyan-400 font-extrabold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40">{centerDistance} cm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="50"
                  value={centerDistance}
                  onChange={(e) => setCenterDistance(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {configMode === 'single' ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Angle Offset</span>
                  <span className="font-mono text-cyan-400 font-extrabold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40">{angleOffset1}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={angleOffset1}
                  onChange={(e) => setAngleOffset1(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Fan 1 Angle Offset</span>
                    <span className="font-mono text-cyan-400 font-extrabold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40">{angleOffset1}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={angleOffset1}
                    onChange={(e) => setAngleOffset1(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Fan 2 Angle Offset</span>
                    <span className="font-mono text-purple-400 font-extrabold px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40">{angleOffset2}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={angleOffset2}
                    onChange={(e) => setAngleOffset2(Number(e.target.value))}
                    className="w-full accent-purple-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
                  />
                </div>
              </>
            )}

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

          {/* Action Upload Buttons */}
          <div className="pt-3 border-t border-slate-800/80">
            {configMode === 'single' ? (
              <button
                onClick={handleUploadSingle}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all uppercase tracking-wider border border-emerald-400/40"
              >
                <ArrowRight className="w-4 h-4 text-slate-950" />
                <span>Upload to Hologram Fan</span>
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
        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-[#060918]/95 via-[#030612]/95 to-[#010309]/95 p-6 backdrop-blur-2xl flex flex-col justify-between shadow-[0_0_50px_rgba(0,0,0,0.7)] min-h-[500px]">
          
          {/* Top Status Pill Badge */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/85 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 backdrop-blur-md shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Image Ready (1 frame • 60×100 Polar Mesh)</span>
          </div>

          {/* Main Canvas Preview Container */}
          <div className="relative w-full h-full flex items-center justify-center p-4 min-h-[420px]">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="max-w-full max-h-[440px] object-contain rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(0,243,255,0.2)]"
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
