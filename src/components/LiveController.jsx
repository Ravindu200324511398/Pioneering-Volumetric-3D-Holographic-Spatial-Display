import React, { useState } from 'react';
import {
  Sliders, Power, Sun, RefreshCw, RotateCcw, Play, Pause, SkipForward, SkipBack,
  Wifi, Send, CheckCircle2, AlertCircle, ShieldAlert, Cpu, Layers, Gauge, ShieldCheck, Zap, AlertTriangle, Disc, Radio, Activity
} from 'lucide-react';
import { IMAGE_PRESETS } from '../data/presetData';

export default function LiveController({
  rpm, setRpm,
  brightness, setBrightness,
  angleOffset1, setAngleOffset1,
  angleOffset2, setAngleOffset2,
  overlapCm, setOverlapCm,
  distanceCm, setDistanceCm,
  isDualMode, setIsDualMode,
  selectedPreset, setSelectedPreset,
  isConnected, setIsConnected
}) {
  // ─── Motor Controller State ─────────────────────────
  const [bothThrottle, setBothThrottle] = useState(0);
  const [isBothRunning, setIsBothRunning] = useState(false);
  const [fan1Running, setFan1Running] = useState(false);
  const [fan2Running, setFan2Running] = useState(false);

  // Safety & Overrides
  const [safetyOverride, setSafetyOverride] = useState(false);
  const [masterSensorsOn, setMasterSensorsOn] = useState(true);

  // Sensor state (Sensor 1, 2, 3)
  const [sensor1On, setSensor1On] = useState(true);
  const [sensor2On, setSensor2On] = useState(true);
  const [sensor3On, setSensor3On] = useState(true);

  const [sensor1Dist, setSensor1Dist] = useState(142);
  const [sensor2Dist, setSensor2Dist] = useState(138);
  const [sensor3Dist, setSensor3Dist] = useState(165);

  const [threshold1, setThreshold1] = useState(100);
  const [threshold2, setThreshold2] = useState(100);
  const [threshold3, setThreshold3] = useState(100);

  const [statusMessage, setStatusMessage] = useState('');

  const handleStartBoth = () => {
    setIsBothRunning(true);
    setFan1Running(true);
    setFan2Running(true);
    if (bothThrottle === 0) setBothThrottle(75);
    setRpm(2400);
    setStatusMessage('Started Both Fans at 75% Throttle (2400 RPM).');
  };

  const handleStopBoth = () => {
    setIsBothRunning(false);
    setFan1Running(false);
    setFan2Running(false);
    setBothThrottle(0);
    setRpm(0);
    setStatusMessage('Stopped Both Fans (0% Throttle / 1000µs ESC signal).');
  };

  const handleThrottleChange = (val) => {
    setBothThrottle(val);
    if (val > 0) {
      setIsBothRunning(true);
      setFan1Running(true);
      setFan2Running(true);
      setRpm(Math.round(600 + (val / 100) * 3000));
    } else {
      handleStopBoth();
    }
  };

  const isSafe = safetyOverride || (masterSensorsOn && sensor1Dist >= threshold1 && sensor2Dist >= threshold2 && sensor3Dist >= threshold3);

  return (
    <section className="py-8 px-4 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* ─── TOP HEADER COMMAND CARD ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-[#070c1e]/95 via-[#0a132e]/95 to-[#050917]/95 p-6 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,243,255,0.15)] flex flex-wrap items-center justify-between gap-4">
        <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 opacity-50"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 shadow-[0_0_20px_rgba(0,243,255,0.3)]">
            <Disc className="w-7 h-7 animate-spin-slow" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold">
              <span>● ESP32 REALTIME TELEMETRY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-cyan-400">
              FUSION 5 LIVE MOTOR CONTROLLER
            </h2>
          </div>
        </div>

        <button
          onClick={() => setIsConnected(!isConnected)}
          className={`relative z-10 flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-bold font-mono transition-all duration-300 border ${
            isConnected
              ? 'bg-emerald-950/80 border-emerald-400/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-900/80'
              : 'bg-red-950/80 border-red-500/50 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-900/80'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`}></span>
          <span>{isConnected ? 'Connected • ws://192.168.4.1/ws' : 'Disconnected (Simulated)'}</span>
        </button>
      </div>

      {/* ─── SAFETY STATUS BANNER ─── */}
      <div className={`relative overflow-hidden rounded-3xl p-5 border backdrop-blur-2xl transition-all duration-500 flex flex-wrap items-center justify-between gap-4 shadow-xl ${
        isSafe
          ? 'bg-gradient-to-r from-[#032014]/90 via-[#052e16]/90 to-[#02170e]/90 border-emerald-500/40 text-emerald-200'
          : 'bg-gradient-to-r from-[#3b0707]/95 via-[#450a0a]/95 to-[#240303]/95 border-red-500/60 text-red-100 shadow-[0_0_35px_rgba(239,68,68,0.4)] animate-pulse'
      }`}>
        <div className="flex items-center gap-4 relative z-10">
          <div className={`p-3 rounded-2xl ${isSafe ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
            {isSafe ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6 animate-bounce" />}
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-wide uppercase">
              {isSafe ? 'Perimeter Safe — All Sonar Sensors Clear' : 'OBSTRUCTION DETECTED — EMERGENCY STOP CUTOFF ACTIVE'}
            </h3>
            <p className="text-xs text-slate-300 pt-0.5">
              {isSafe ? 'All 3 ultrasonic safety posts clear — ready for high-speed PWM spin' : 'Perimeter clearance breached! 50Hz PWM signal pulled to 1000µs zero throttle.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
            safetyOverride ? 'bg-amber-950/90 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-950/80 text-slate-400 border-slate-800'
          }`}>
            {safetyOverride ? 'OVERRIDE ON' : 'OVERRIDE OFF'}
          </span>

          <button
            onClick={() => setSafetyOverride(!safetyOverride)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-amber-500/40 text-xs font-bold text-amber-400 shadow-md transition-all hover:border-amber-400"
          >
            <Zap className="w-4 h-4" />
            <span>Override Safety</span>
          </button>
        </div>
      </div>

      {/* ─── THROTTLE SLIDER BENTO CARD ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#080d24]/95 via-[#050817]/95 to-[#02040b]/95 p-7 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-cyan-300 font-bold uppercase tracking-wider text-sm">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <span>MASTER THROTTLE CONTROLLER • DUAL ESC</span>
          </div>
          <span className="font-mono text-cyan-400 font-black text-lg px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40">
            {bothThrottle}%
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="text-5xl font-black font-mono text-slate-100 flex items-baseline gap-2">
              <span>{bothThrottle}</span>
              <span className="text-2xl text-cyan-400 font-bold">%</span>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <span>Target Output: </span>
              <span className="text-cyan-300 font-bold">{Math.round(600 + (bothThrottle / 100) * 3000)} RPM</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={bothThrottle}
            onChange={(e) => handleThrottleChange(Number(e.target.value))}
            className="w-full accent-cyan-400 h-3 bg-slate-950 rounded-xl cursor-pointer shadow-inner"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono font-bold px-1">
            <span>0% (1000µs)</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100% (2000µs)</span>
          </div>
        </div>
      </div>

      {/* ─── MASTER FAN CONTROL ACTION BUTTONS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <button
          onClick={handleStartBoth}
          className="group relative overflow-hidden py-5 rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-sm flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(0,243,255,0.35)] transition-all duration-300 uppercase tracking-wider border border-cyan-400/40 active:scale-[0.98]"
        >
          <Play className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform" />
          <span>START BOTH FANS (75% THROTTLE)</span>
        </button>

        <button
          onClick={handleStopBoth}
          className="group relative overflow-hidden py-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-700 to-red-800 hover:brightness-110 text-white font-extrabold text-sm flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(239,68,68,0.35)] transition-all duration-300 uppercase tracking-wider border border-red-400/40 active:scale-[0.98]"
        >
          <Power className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          <span>STOP BOTH FANS (EMERGENCY CUTOFF)</span>
        </button>
      </div>

      {/* ─── INDIVIDUAL FAN CONTROLS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fan 1 Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#070c1e]/90 p-6 backdrop-blur-2xl space-y-5 shadow-lg hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2.5">
                <Disc className="w-5 h-5 text-cyan-400 animate-spin-slow" />
                <span>Fan 1 • Upper Rotor</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                GPIO 18 • ESC PWM Throttle Channel
              </p>
            </div>

            <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
              fan1Running ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              {fan1Running ? '● RUNNING' : '● STOPPED'}
            </span>
          </div>

          <button
            onClick={() => setFan1Running(!fan1Running)}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
              fan1Running
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black shadow-[0_0_20px_rgba(0,243,255,0.3)]'
            }`}
          >
            {fan1Running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{fan1Running ? 'Pause Fan 1 Signal' : '► Start Fan 1 Signal'}</span>
          </button>
        </div>

        {/* Fan 2 Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#070c1e]/90 p-6 backdrop-blur-2xl space-y-5 shadow-lg hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2.5">
                <Disc className="w-5 h-5 text-purple-400 animate-spin-slow" />
                <span>Fan 2 • Lower Rotor</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                GPIO 19 • ESC PWM Throttle Channel
              </p>
            </div>

            <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
              fan2Running ? 'bg-purple-950 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}>
              {fan2Running ? '● RUNNING' : '● STOPPED'}
            </span>
          </div>

          <button
            onClick={() => setFan2Running(!fan2Running)}
            className={`w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
              fan2Running
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40'
                : 'bg-purple-600 hover:bg-purple-500 text-white font-black shadow-[0_0_20px_rgba(168,85,247,0.3)]'
            }`}
          >
            {fan2Running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{fan2Running ? 'Pause Fan 2 Signal' : '► Start Fan 2 Signal'}</span>
          </button>
        </div>

      </div>

      {/* ─── ULTRASONIC SAFETY SENSORS SECTION ─── */}
      <div className="space-y-5 pt-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>ULTRASONIC SAFETY SENSOR TELEMETRY</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">3x HC-SR04 Acoustics</span>
        </div>

        {/* Master Sensors Switch */}
        <div className="rounded-3xl border border-slate-800 bg-[#070c1e]/90 p-5 backdrop-blur-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-100">All Safety Sensors Master Guard</p>
            <p className="text-xs text-slate-400">Enable or bypass perimeter clearance verification</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={masterSensorsOn}
              onChange={() => setMasterSensorsOn(!masterSensorsOn)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        {/* 3 Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Sensor 1 */}
          <div className="rounded-3xl border border-slate-800 bg-[#070c1e]/90 p-5 backdrop-blur-2xl space-y-4 shadow-lg hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100">Sensor 01 • Left Post</h4>
                <span className="text-[10px] text-slate-400 font-mono">TRIG:25 • ECHO:26</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                ● CLEAR
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center font-mono space-y-1">
              <div className="text-2xl font-black text-cyan-300">{sensor1Dist} <span className="text-xs text-slate-400">cm</span></div>
              <div className="text-[10px] text-slate-500">Realtime Clearance Distance</div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <span>Cutoff Threshold:</span>
              <input
                type="number"
                value={threshold1}
                onChange={(e) => setThreshold1(Number(e.target.value))}
                className="w-16 bg-slate-950 border border-cyan-500/40 rounded-xl px-2 py-1 text-center font-mono text-cyan-300 text-xs font-bold"
              />
            </div>
          </div>

          {/* Sensor 2 */}
          <div className="rounded-3xl border border-slate-800 bg-[#070c1e]/90 p-5 backdrop-blur-2xl space-y-4 shadow-lg hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100">Sensor 02 • Center Post</h4>
                <span className="text-[10px] text-slate-400 font-mono">TRIG:27 • ECHO:14</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                ● CLEAR
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center font-mono space-y-1">
              <div className="text-2xl font-black text-purple-300">{sensor2Dist} <span className="text-xs text-slate-400">cm</span></div>
              <div className="text-[10px] text-slate-500">Realtime Clearance Distance</div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <span>Cutoff Threshold:</span>
              <input
                type="number"
                value={threshold2}
                onChange={(e) => setThreshold2(Number(e.target.value))}
                className="w-16 bg-slate-950 border border-purple-500/40 rounded-xl px-2 py-1 text-center font-mono text-purple-300 text-xs font-bold"
              />
            </div>
          </div>

          {/* Sensor 3 */}
          <div className="rounded-3xl border border-slate-800 bg-[#070c1e]/90 p-5 backdrop-blur-2xl space-y-4 shadow-lg hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-100">Sensor 03 • Right Post</h4>
                <span className="text-[10px] text-slate-400 font-mono">TRIG:32 • ECHO:33</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                ● CLEAR
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center font-mono space-y-1">
              <div className="text-2xl font-black text-emerald-300">{sensor3Dist} <span className="text-xs text-slate-400">cm</span></div>
              <div className="text-[10px] text-slate-500">Realtime Clearance Distance</div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
              <span>Cutoff Threshold:</span>
              <input
                type="number"
                value={threshold3}
                onChange={(e) => setThreshold3(Number(e.target.value))}
                className="w-16 bg-slate-950 border border-emerald-500/40 rounded-xl px-2 py-1 text-center font-mono text-emerald-300 text-xs font-bold"
              />
            </div>
          </div>

        </div>
      </div>

      {/* ─── FOOTER TELEMETRY NOTE ─── */}
      <div className="text-center pt-6 border-t border-slate-800 text-xs text-slate-400 font-mono">
        HOLOGRAM MOTOR CONTROLLER • FUSION 5 • ESP32 WEBSOCKET ENGINE • DUAL A2212 BLDC MOTORS • TRIPLE HC-SR04 SONAR
      </div>
    </section>
  );
}
