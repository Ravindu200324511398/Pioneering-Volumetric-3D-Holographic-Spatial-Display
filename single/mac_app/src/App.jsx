import { useState, useRef, useEffect, useCallback } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';
import './index.css';

const NUM_LEDS = 200;
const HALF_LEDS = NUM_LEDS / 2;
const POLAR_ROWS = 60; // 360 / 6 degree resolution
const FRAME_SIZE = POLAR_ROWS * HALF_LEDS * 2; // bytes per fan frame
const MAX_FRAMES = 850; // matches firmware MAX_FRAMES storage limit

// "Distance between centers" and "Overlap" used to be two separate sliders
// that both fed into the same radius formula (R = (distance+overlap)/2),
// making them redundant and confusing. We keep distance as the one
// user-facing control (it's the physically meaningful one - how far apart
// you mount the two fans) and fix overlap at a sensible constant.
const OVERLAP_CM = 13;

function rgbToRgb565(r, g, b) {
  const r5 = (r * 249 + 1014) >> 11;
  const g6 = (g * 253 + 505) >> 10;
  const b5 = (b * 249 + 1014) >> 11;
  return (r5 << 11) + (g6 << 5) + b5;
}

// Luminance-preserving saturation adjustment. satPct = 100 is unchanged,
// 0 is grayscale, >100 boosts color intensity.
function adjustSaturation(r, g, b, satPct) {
  if (satPct === 100) return [r, g, b];
  const factor = satPct / 100;
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  const nr = gray + (r - gray) * factor;
  const ng = gray + (g - gray) * factor;
  const nb = gray + (b - gray) * factor;
  return [
    Math.min(255, Math.max(0, Math.round(nr))),
    Math.min(255, Math.max(0, Math.round(ng))),
    Math.min(255, Math.max(0, Math.round(nb))),
  ];
}

export default function App() {
  const [mode, setMode] = useState('single'); // 'single' or 'dual'
  const [mediaSrc, setMediaSrc] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image', 'video', or 'gif'
  const [distance, setDistance] = useState(31);
  const [angle1, setAngle1] = useState(0);
  const [angle2, setAngle2] = useState(0);
  const [zoom, setZoom] = useState(100); // Image Size (%) - scales the source image
  const [saturation, setSaturation] = useState(100); // 100 = normal, 0 = grayscale
  const [fps, setFps] = useState(15);
  const [status, setStatus] = useState({ state: 'idle', msg: 'Ready' });
  const [bins, setBins] = useState(null);
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const videoRef = useRef(null);
  const gifFileRef = useRef(null);

  useEffect(() => {
    if (mediaSrc && mediaType === 'image') {
      processImage(imgRef.current);
    }
  }, [mediaSrc, distance, angle1, angle2, zoom, saturation, mode]);

  // -------------------------------------------------------
  // GEOMETRY HELPERS
  // -------------------------------------------------------
  const getGeometry = () => {
    if (mode === 'single') {
      const scale = 2.0;
      const w_px = NUM_LEDS * scale;
      const h_px = NUM_LEDS * scale;
      const center1_x = (NUM_LEDS / 2) * scale;
      const center1_y = (NUM_LEDS / 2) * scale;
      return { w_px, h_px, scale, center1_x, center1_y, center2_x: null, center2_y: null };
    }

    const R_cm = (parseFloat(distance) + OVERLAP_CM) / 2.0;
    if (R_cm <= 0) return null;
    const leds_per_cm = HALF_LEDS / R_cm;
    const dist_leds = parseFloat(distance) * leds_per_cm;
    const scale = 2.0;
    const total_width_leds = NUM_LEDS;
    const total_height_leds = Math.floor(HALF_LEDS + dist_leds + HALF_LEDS);
    const w_px = Math.floor(total_width_leds * scale);
    const h_px = Math.floor(total_height_leds * scale);
    const center1_x = (total_width_leds / 2) * scale;
    const center1_y = HALF_LEDS * scale;
    const center2_x = (total_width_leds / 2) * scale;
    const center2_y = (HALF_LEDS + dist_leds) * scale;
    return { w_px, h_px, scale, center1_x, center1_y, center2_x, center2_y };
  };

  // -------------------------------------------------------
  // PROCESS A SINGLE FRAME (canvas already drawn)
  // -------------------------------------------------------
  const processFrame = (ctx, w_px, h_px, scale, cx1, cy1, cx2, cy2, satPct) => {
    const imageData = ctx.getImageData(0, 0, w_px, h_px).data;

    const getPixel = (x, y) => {
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x >= w_px) x = w_px - 1;
      if (y >= h_px) y = h_px - 1;
      const idx = (Math.floor(y) * w_px + Math.floor(x)) * 4;
      return adjustSaturation(imageData[idx], imageData[idx + 1], imageData[idx + 2], satPct);
    };

    const generateFanBin = (cx, cy, offsetAngle) => {
      const buffer = new ArrayBuffer(POLAR_ROWS * HALF_LEDS * 2);
      const view = new DataView(buffer);
      let degrees = 0;
      let byteOffset = 0;
      for (let row = 0; row < POLAR_ROWS; row++) {
        const effectiveDeg = (degrees + parseFloat(offsetAngle)) % 360;
        const rad = (effectiveDeg * Math.PI) / 180.0;
        for (let j = 0; j < HALF_LEDS; j++) {
          const r = HALF_LEDS - j;
          const dx = r * Math.sin(rad);
          const dy = r * Math.cos(rad);
          const px = cx + dx * scale;
          const py = cy - dy * scale;
          const [r8, g8, b8] = getPixel(px, py);
          const rgb565 = rgbToRgb565(r8, g8, b8);
          view.setUint16(byteOffset, rgb565, true);
          byteOffset += 2;
        }
        degrees += 6;
      }
      return buffer;
    };

    const bin1 = generateFanBin(cx1, cy1, angle1);
    const bin2 = mode === 'dual' ? generateFanBin(cx2, cy2, angle2) : null;
    return { fan1: bin1, fan2: bin2 };
  };

  // -------------------------------------------------------
  // DRAW SOURCE ONTO CANVAS (crop + scale)
  // -------------------------------------------------------
  const drawSourceToCanvas = (source, srcW, srcH, ctx, w_px, h_px, sizePct = 100) => {
    // Clear canvas to black
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w_px, h_px);

    const imgRatio = srcW / srcH;
    const targetRatio = w_px / h_px;

    // "Contain" baseline: the whole image is visible at 100% (letterboxed
    // if its aspect ratio doesn't match the canvas), instead of the old
    // "cover" baseline which always filled/cropped the canvas and made the
    // zoom slider barely visible. This makes "Image Size" behave like an
    // actual resize control: smaller % literally shrinks the image,
    // larger % literally grows it past the canvas edges.
    let baseW = w_px;
    let baseH = h_px;
    if (imgRatio > targetRatio) {
      baseH = w_px / imgRatio;
    } else {
      baseW = h_px * imgRatio;
    }

    const sizeScale = (parseFloat(sizePct) || 100) / 100.0;
    const drawW = baseW * sizeScale;
    const drawH = baseH * sizeScale;

    // Center it
    const dX = (w_px - drawW) / 2;
    const dY = (h_px - drawH) / 2;

    ctx.drawImage(source, 0, 0, srcW, srcH, dX, dY, drawW, drawH);
  };

  // -------------------------------------------------------
  // PROCESS STATIC IMAGE
  // -------------------------------------------------------
  const processImage = (img) => {
    if (!img) return;
    setStatus({ state: 'processing', msg: 'Processing Image...' });

    const geo = getGeometry();
    if (!geo) {
      setStatus({ state: 'error', msg: 'Invalid distance/overlap' });
      return;
    }

    const canvas = canvasRef.current;
    canvas.width = geo.w_px;
    canvas.height = geo.h_px;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    drawSourceToCanvas(img, img.width, img.height, ctx, geo.w_px, geo.h_px, zoom);

    // Draw fan overlay circles
    ctx.beginPath();
    ctx.arc(geo.center1_x, geo.center1_y, HALF_LEDS * geo.scale, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (mode === 'dual') {
      ctx.beginPath();
      ctx.arc(geo.center2_x, geo.center2_y, HALF_LEDS * geo.scale, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Re-draw without overlay for processing
    drawSourceToCanvas(img, img.width, img.height, ctx, geo.w_px, geo.h_px, zoom);

    const frame = processFrame(ctx, geo.w_px, geo.h_px, geo.scale,
      geo.center1_x, geo.center1_y, geo.center2_x, geo.center2_y, saturation);

    // Single-frame .bin: 4-byte header (frameCount=1) + frame data
    const header = new ArrayBuffer(4);
    new DataView(header).setUint32(0, 1, true); // 1 frame, little-endian

    const fan1Blob = new Blob([header, frame.fan1], { type: 'application/octet-stream' });
    const fan2Blob = mode === 'dual' ? new Blob([header, frame.fan2], { type: 'application/octet-stream' }) : null;

    setBins({ fan1: fan1Blob, fan2: fan2Blob, frameCount: 1 });

    // Re-draw with overlay for display
    drawSourceToCanvas(img, img.width, img.height, ctx, geo.w_px, geo.h_px, zoom);
    ctx.beginPath();
    ctx.arc(geo.center1_x, geo.center1_y, HALF_LEDS * geo.scale, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (mode === 'dual') {
      ctx.beginPath();
      ctx.arc(geo.center2_x, geo.center2_y, HALF_LEDS * geo.scale, 0, 2 * Math.PI);
      ctx.stroke();
    }

    setStatus({ state: 'success', msg: 'Image Ready (1 frame)' });
  };

  // -------------------------------------------------------
  // PROCESS VIDEO — extract frames and build multi-frame .bin
  // -------------------------------------------------------
  const processVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    const geo = getGeometry();
    if (!geo) {
      setStatus({ state: 'error', msg: 'Invalid distance/overlap' });
      return;
    }

    setStatus({ state: 'processing', msg: 'Extracting video frames...' });

    const canvas = canvasRef.current;
    canvas.width = geo.w_px;
    canvas.height = geo.h_px;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const duration = video.duration;
    const targetFps = parseInt(fps);
    const totalFrames = Math.min(Math.floor(duration * targetFps), 850); // cap at ~850 frames (storage limit)
    const frameInterval = 1.0 / targetFps;

    const fan1Buffers = [];
    const fan2Buffers = [];

    for (let i = 0; i < totalFrames; i++) {
      const seekTime = i * frameInterval;

      // Seek video to the target time
      await new Promise((resolve) => {
        video.currentTime = seekTime;
        video.onseeked = resolve;
      });

      // Draw frame to canvas
      drawSourceToCanvas(video, video.videoWidth, video.videoHeight, ctx, geo.w_px, geo.h_px, zoom);

      // Process this frame
      const frame = processFrame(ctx, geo.w_px, geo.h_px, geo.scale,
        geo.center1_x, geo.center1_y, geo.center2_x, geo.center2_y, saturation);

      fan1Buffers.push(frame.fan1);
      if (mode === 'dual') {
        fan2Buffers.push(frame.fan2);
      }

      setProgress(Math.round(((i + 1) / totalFrames) * 100));
      setStatus({ state: 'processing', msg: `Processing frame ${i + 1}/${totalFrames}...` });

      // Yield to UI thread every 5 frames
      if (i % 5 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    // Build final .bin files: 4-byte header (frameCount) + all frame data
    const header = new ArrayBuffer(4);
    new DataView(header).setUint32(0, totalFrames, true);

    const fan1Blob = new Blob([header, ...fan1Buffers], { type: 'application/octet-stream' });
    const fan2Blob = mode === 'dual' ? new Blob([header, ...fan2Buffers], { type: 'application/octet-stream' }) : null;

    const sizeMB = (fan1Blob.size / (1024 * 1024)).toFixed(1);

    setBins({ fan1: fan1Blob, fan2: fan2Blob, frameCount: totalFrames });
    setProgress(0);
    setStatus({ state: 'success', msg: mode === 'dual' ? `Video Ready (${totalFrames} frames, ${sizeMB}MB each)` : `Video Ready (${totalFrames} frames, ${sizeMB}MB)` });
  };

  // -------------------------------------------------------
  // PROCESS GIF — decode frames, composite with disposal
  // handling, and build a multi-frame .bin (like video)
  // -------------------------------------------------------
  const processGif = async () => {
    const file = gifFileRef.current;
    if (!file) return;

    const geo = getGeometry();
    if (!geo) {
      setStatus({ state: 'error', msg: 'Invalid distance' });
      return;
    }

    setStatus({ state: 'processing', msg: 'Decoding GIF frames...' });

    const buf = await file.arrayBuffer();
    const gif = parseGIF(buf);
    const gifFrames = decompressFrames(gif, true);

    if (!gifFrames.length) {
      setStatus({ state: 'error', msg: 'No frames found in GIF' });
      return;
    }

    const totalFrames = Math.min(gifFrames.length, MAX_FRAMES);

    const canvas = canvasRef.current;
    canvas.width = geo.w_px;
    canvas.height = geo.h_px;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Offscreen canvas the GIF frames get composited onto, full GIF
    // logical-screen size, handling each frame's disposal method.
    const gifW = gif.lsd.width;
    const gifH = gif.lsd.height;
    const gifCanvas = document.createElement('canvas');
    gifCanvas.width = gifW;
    gifCanvas.height = gifH;
    const gifCtx = gifCanvas.getContext('2d', { willReadFrequently: true });

    const patchCanvas = document.createElement('canvas');
    const patchCtx = patchCanvas.getContext('2d');

    const fan1Buffers = [];
    const fan2Buffers = [];

    let previousDisposal = 0;
    let previousRect = null;

    for (let i = 0; i < totalFrames; i++) {
      const frame = gifFrames[i];
      const dims = frame.dims;

      // Handle disposal of the PREVIOUS frame before drawing this one.
      if (previousDisposal === 2 && previousRect) {
        // Restore to background: clear that region.
        gifCtx.clearRect(previousRect.x, previousRect.y, previousRect.w, previousRect.h);
      }
      // (disposalType 3 "restore to previous" is rare; treated as a no-op
      // here, same as disposalType 0/1 "do not dispose" — frames simply
      // accumulate, which is correct for the vast majority of GIFs.)

      patchCanvas.width = dims.width;
      patchCanvas.height = dims.height;
      const patchImageData = new ImageData(
        new Uint8ClampedArray(frame.patch),
        dims.width,
        dims.height
      );
      patchCtx.putImageData(patchImageData, 0, 0);
      gifCtx.drawImage(patchCanvas, dims.left, dims.top);

      previousDisposal = frame.disposalType;
      previousRect = { x: dims.left, y: dims.top, w: dims.width, h: dims.height };

      // Draw the fully-composited GIF frame onto our processing canvas
      drawSourceToCanvas(gifCanvas, gifW, gifH, ctx, geo.w_px, geo.h_px, zoom);

      const frameData = processFrame(ctx, geo.w_px, geo.h_px, geo.scale,
        geo.center1_x, geo.center1_y, geo.center2_x, geo.center2_y, saturation);

      fan1Buffers.push(frameData.fan1);
      if (mode === 'dual') {
        fan2Buffers.push(frameData.fan2);
      }

      setProgress(Math.round(((i + 1) / totalFrames) * 100));
      setStatus({ state: 'processing', msg: `Processing GIF frame ${i + 1}/${totalFrames}...` });

      if (i % 5 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    const header = new ArrayBuffer(4);
    new DataView(header).setUint32(0, totalFrames, true);

    const fan1Blob = new Blob([header, ...fan1Buffers], { type: 'application/octet-stream' });
    const fan2Blob = mode === 'dual' ? new Blob([header, ...fan2Buffers], { type: 'application/octet-stream' }) : null;

    const sizeMB = (fan1Blob.size / (1024 * 1024)).toFixed(1);

    setBins({ fan1: fan1Blob, fan2: fan2Blob, frameCount: totalFrames });
    setProgress(0);
    const truncatedNote = gifFrames.length > MAX_FRAMES
      ? ` (truncated from ${gifFrames.length})` : '';
    setStatus({ state: 'success', msg: mode === 'dual' ? `GIF Ready (${totalFrames} frames${truncatedNote}, ${sizeMB}MB each)` : `GIF Ready (${totalFrames} frames${truncatedNote}, ${sizeMB}MB)` });
  };

  // -------------------------------------------------------
  // FILE INPUT HANDLER
  // -------------------------------------------------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBins(null);
    setProgress(0);

    if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
      setMediaType('gif');
      gifFileRef.current = file;
      const url = URL.createObjectURL(file);
      setMediaSrc(url);
      setStatus({ state: 'idle', msg: 'GIF loaded. Click "Process GIF" to start.' });
    } else if (file.type.startsWith('image/')) {
      setMediaType('image');
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setMediaSrc(url);
      };
      img.src = url;
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.onloadedmetadata = () => {
        videoRef.current = video;
        setMediaSrc(url);
        setStatus({ state: 'idle', msg: `Video loaded (${video.duration.toFixed(1)}s). Click "Process Video" to start.` });
      };
    }
  };

  // -------------------------------------------------------
  // ESP32 UPLOAD HANDLER
  // -------------------------------------------------------
  const handleEspUpload = async (fanNum) => {
    if (!bins) return;
    setStatus({ state: 'processing', msg: mode === 'single' ? 'Uploading to Fan...' : `Uploading to Fan ${fanNum}...` });

    try {
      const formData = new FormData();
      if (mode === 'single') {
        formData.append('file', bins.fan1, 'fan.bin');
      } else if (fanNum === 1) {
        formData.append('file', bins.fan1, 'fan1.bin');
      } else {
        formData.append('file', bins.fan2, 'fan2.bin');
      }

      const espUrl = 'http://192.168.4.1/upload';
      const res = await fetch(espUrl, { method: 'POST', body: formData });

      if (!res.ok) {
        throw new Error(`ESP32 responded with status ${res.status}`);
      }

      setStatus({ state: 'success', msg: mode === 'single' ? 'Upload to Fan Complete!' : `Upload to Fan ${fanNum} Complete!` });
    } catch (err) {
      console.error(err);
      const ssid = mode === 'single' ? 'HologramFan' : `HologramFan${fanNum}`;
      setStatus({ state: 'error', msg: `Upload Failed. Connect to ${ssid} Wi-Fi!` });
    }
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div className="app-container">
      <div className="panel controls-panel">
        <h1>Hologram Array</h1>

        {/* Mode Selector */}
        <div className="control-group" style={{ marginBottom: '1.5rem' }}>
          <label><span>Configuration Mode</span></label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              className={`btn ${mode === 'single' ? 'active' : ''}`}
              onClick={() => setMode('single')}
              style={{
                flex: 1,
                background: mode === 'single' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255,255,255,0.05)',
                color: mode === 'single' ? 'white' : 'var(--text-muted)',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Single Fan
            </button>
            <button
              className={`btn ${mode === 'dual' ? 'active' : ''}`}
              onClick={() => setMode('dual')}
              style={{
                flex: 1,
                background: mode === 'dual' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(255,255,255,0.05)',
                color: mode === 'dual' ? 'white' : 'var(--text-muted)',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Dual Fan (Overlap)
            </button>
          </div>
        </div>

        <div className="file-input-wrapper">
          <button className="btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Select Image, GIF, or Video
          </button>
          <input type="file" accept="image/*,video/*,.gif" onChange={handleFileUpload} />
        </div>

        {mediaType === 'video' && (
          <>
            <div className="control-group">
              <label><span>Frame Rate</span> <span>{fps} FPS</span></label>
              <input type="range" min="5" max="30" value={fps} onChange={(e) => setFps(e.target.value)} />
            </div>
            <button className="btn btn-process" onClick={processVideo}
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Process Video
            </button>
          </>
        )}

        {mediaType === 'gif' && (
          <button className="btn btn-process" onClick={processGif}
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Process GIF
          </button>
        )}

        {mode === 'dual' && (
          <div className="control-group">
            <label><span>Distance between centers</span> <span>{distance} cm</span></label>
            <input type="range" min="10" max="60" value={distance} onChange={(e) => setDistance(e.target.value)} />
          </div>
        )}

        {mode === 'single' ? (
          <div className="control-group">
            <label><span>Angle Offset</span> <span>{angle1}°</span></label>
            <input type="range" min="0" max="360" value={angle1} onChange={(e) => setAngle1(e.target.value)} />
          </div>
        ) : (
          <>
            <div className="control-group">
              <label><span>Fan 1 Angle Offset</span> <span>{angle1}°</span></label>
              <input type="range" min="0" max="360" value={angle1} onChange={(e) => setAngle1(e.target.value)} />
            </div>

            <div className="control-group">
              <label><span>Fan 2 Angle Offset</span> <span>{angle2}°</span></label>
              <input type="range" min="0" max="360" value={angle2} onChange={(e) => setAngle2(e.target.value)} />
            </div>
          </>
        )}

        <div className="control-group">
          <label><span>Image Size</span> <span>{zoom}%</span></label>
          <input type="range" min="10" max="300" value={zoom} onChange={(e) => setZoom(e.target.value)} />
        </div>

        <div className="control-group">
          <label><span>Saturation</span> <span>{saturation}%</span></label>
          <input type="range" min="0" max="300" value={saturation} onChange={(e) => setSaturation(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
          {mode === 'single' ? (
            <button
              className="btn btn-upload"
              disabled={!bins}
              onClick={() => handleEspUpload(1)}
              style={{ opacity: !bins ? 0.5 : 1, width: '100%' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              Upload to Fan
            </button>
          ) : (
            <>
              <button
                className="btn btn-upload"
                disabled={!bins}
                onClick={() => handleEspUpload(1)}
                style={{ opacity: !bins ? 0.5 : 1 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                Upload Fan 1
              </button>

              <button
                className="btn btn-upload"
                disabled={!bins}
                onClick={() => handleEspUpload(2)}
                style={{ opacity: !bins ? 0.5 : 1 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                Upload Fan 2
              </button>
            </>
          )}
        </div>
      </div>

      <div className="panel preview-panel">
        <div className="status-badge">
          <div className={`status-dot ${status.state}`}></div>
          {status.msg}
        </div>
        {progress > 0 && (
          <div style={{
            position: 'absolute', top: '3.5rem', left: '1rem', right: '1rem',
            height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', zIndex: 10
          }}>
            <div style={{
              height: '100%', width: `${progress}%`, borderRadius: '2px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              transition: 'width 0.2s ease'
            }}></div>
          </div>
        )}
        <div className="preview-canvas-container">
          {!mediaSrc && <span style={{ color: 'var(--text-muted)' }}>No image or video selected</span>}
          <canvas ref={canvasRef} style={{ display: mediaSrc ? 'block' : 'none' }}></canvas>
        </div>
        {bins && (
          <div style={{
            position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
            fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.5)',
            padding: '0.4rem 1rem', borderRadius: '12px', backdropFilter: 'blur(8px)'
          }}>
            {bins.frameCount} frame{bins.frameCount > 1 ? 's' : ''} • {(bins.fan1.size / 1024).toFixed(0)}KB{mode === 'dual' ? ' per fan' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
