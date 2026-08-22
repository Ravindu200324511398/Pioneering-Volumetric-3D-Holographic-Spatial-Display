import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Download, FileCode, Check, Image as ImageIcon, Video, Sparkles, Filter, Eye, Sliders, ArrowRight } from 'lucide-react';
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
      ctx.fillStyle = '#070b19';
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
      ctx.strokeStyle = '#22c55e'; // Vibrant neon green line from screenshot
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
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl space-y-6 border border-slate-800 bg-[#0a0f24]/90 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <h2 className="text-2xl font-extrabold text-slate-100">Hologram Array</h2>

          {/* Configuration Mode Selector Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400">Configuration Mode</label>
            <div className="grid grid-cols-2 gap-2 bg-[#060a17] p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setConfigMode('single')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  configMode === 'single'
                    ? 'bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Single Fan
              </button>
              <button
                onClick={() => setConfigMode('dual')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  configMode === 'dual'
                    ? 'bg-[#3b82f6] text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
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
              className="w-full py-3.5 rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Select Image, GIF, or Video</span>
            </button>
          </div>

          {/* Sliders Section */}
          <div className="space-y-4 pt-2">
            {configMode === 'dual' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>Distance between centers</span>
                  <span className="font-mono">{centerDistance} cm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="50"
                  value={centerDistance}
                  onChange={(e) => setCenterDistance(Number(e.target.value))}
                  className="w-full accent-[#3b82f6]"
                />
              </div>
            )}

            {configMode === 'single' ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>Angle Offset</span>
                  <span className="font-mono">{angleOffset1}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={angleOffset1}
                  onChange={(e) => setAngleOffset1(Number(e.target.value))}
                  className="w-full accent-[#3b82f6]"
                />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-300">
                    <span>Fan 1 Angle Offset</span>
                    <span className="font-mono">{angleOffset1}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={angleOffset1}
                    onChange={(e) => setAngleOffset1(Number(e.target.value))}
                    className="w-full accent-[#3b82f6]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-300">
                    <span>Fan 2 Angle Offset</span>
                    <span className="font-mono">{angleOffset2}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={angleOffset2}
                    onChange={(e) => setAngleOffset2(Number(e.target.value))}
                    className="w-full accent-[#3b82f6]"
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Image Size</span>
                <span className="font-mono">{imageScale}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                value={imageScale}
                onChange={(e) => setImageScale(Number(e.target.value))}
                className="w-full accent-[#3b82f6]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Saturation</span>
                <span className="font-mono">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full accent-[#3b82f6]"
              />
            </div>
          </div>

          {/* Action Upload Buttons */}
          <div className="pt-2">
            {configMode === 'single' ? (
              <button
                onClick={handleUploadSingle}
                className="w-full py-3.5 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Upload to Fan</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleUploadToFan1}
                  className="py-3.5 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Upload Fan 1</span>
                </button>
                <button
                  onClick={handleUploadToFan2}
                  className="py-3.5 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Upload Fan 2</span>
                </button>
              </div>
            )}

            {statusMessage && (
              <p className="text-center text-[11px] text-emerald-400 font-medium pt-3 animate-fade-in">
                ✓ {statusMessage}
              </p>
            )}
          </div>
        </div>

        {/* Right Canvas Preview Area */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl space-y-4 border border-slate-800 bg-[#060918]/90 aspect-square flex flex-col justify-between relative shadow-[0_0_50px_rgba(0,0,0,0.7)]">
          {/* Top Status Pill Badge */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Image Ready (1 frame)</span>
          </div>

          {/* Main Canvas Preview */}
          <div className="w-full h-full flex items-center justify-center p-4">
            <canvas
              ref={canvasRef}
              width={500}
              height={500}
              className="max-w-full max-h-full object-contain rounded-2xl border border-slate-800/80 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
            />
          </div>

          {/* Bottom Info Pill Badge */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-[11px] font-mono text-slate-400 backdrop-blur-md">
            {configMode === 'single' ? '1 frame • 12KB' : '1 frame • 12KB per fan'}
          </div>
        </div>
      </div>
    </section>
  );
}

