import React, { useState } from 'react';
import {
  Sliders, Power, Sun, RefreshCw, RotateCcw, Play, Pause, SkipForward, SkipBack,
  Wifi, Send, CheckCircle2, AlertCircle, ShieldAlert, Cpu, Layers, Gauge, ShieldCheck, Zap, AlertTriangle, Disc, Radio
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
    <section className="py-8 px-4 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* ─── TOP HEADER CARD ─── */}
      <div className="glass-card p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 border border-slate-800 bg-[#090d21]/90 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Disc className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-100 uppercase tracking-wider">
              HOLOGRAM MOTOR CONTROLLER
            </h2>
            <p className="text-xs text-slate-400 font-mono">FUSION5 • ESP32 LIVE DASHBOARD</p>
          </div>
        </div>

        <button
          onClick={() => setIsConnected(!isConnected)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
            isConnected
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-red-950/80 border-red-500/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`}></span>
          <span>{isConnected ? 'Connected (ws://192.168.4.1/ws)' : 'Disconnected'}</span>
        </button>
      </div>

      {/* ─── SAFETY STATUS BANNER ─── */}
      <div className={`p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border transition-all ${
        isSafe
          ? 'bg-[#052e16]/90 border-emerald-500/40 text-emerald-200'
          : 'bg-[#450a0a]/90 border-red-500/50 text-red-200 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isSafe ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {isSafe ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5 animate-bounce" />}
          </div>
          <div>
            <p className="text-xs font-bold">
              {isSafe ? 'Safe to Start' : 'OBSTRUCTION DETECTED — EMERGENCY STOP'}
            </p>
            <p className="text-[11px] text-slate-300">
              {isSafe ? 'All sensors clear — no objects within detection range' : 'Object breached perimeter threshold! Motor power cut.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
            safetyOverride ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}>
            {safetyOverride ? 'OVERRIDE ON' : 'OVERRIDE OFF'}
          </span>

          <button
            onClick={() => setSafetyOverride(!safetyOverride)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-amber-400 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Override Safety</span>
          </button>
        </div>
      </div>

      {/* ─── THROTTLE SLIDER CARD ─── */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800 bg-[#090d21]/90">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 text-cyan-400" />
            THROTTLE — BOTH FANS
          </span>
          <span className="font-mono text-cyan-400 font-extrabold text-sm">{bothThrottle}%</span>
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-extrabold font-mono text-slate-100 flex items-baseline gap-1">
            <span>{bothThrottle}</span>
            <span className="text-xl text-cyan-400">%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={bothThrottle}
            onChange={(e) => handleThrottleChange(Number(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* ─── MASTER FAN CONTROL BUTTONS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleStartBoth}
          className="py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all uppercase tracking-wider"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>START BOTH FANS</span>
        </button>

        <button
          onClick={handleStopBoth}
          className="py-4 rounded-2xl bg-[#881337] hover:bg-[#9f1239] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(136,19,55,0.4)] transition-all uppercase tracking-wider"
        >
          <Power className="w-4 h-4" />
          <span>STOP BOTH FANS</span>
        </button>
      </div>

      {/* ─── INDIVIDUAL FAN CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fan 1 Card */}
        <div className="glass-card p-5 rounded-3xl space-y-4 border border-slate-800 bg-[#090d21]/90">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Disc className="w-4 h-4 text-cyan-400" />
                <span>Fan 1 — ESC Pin 18</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {fan1Running ? '● Running (PWM Active)' : '● Stopped'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fan1Running}
                onChange={() => setFan1Running(!fan1Running)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <button
            onClick={() => setFan1Running(!fan1Running)}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
          >
            {fan1Running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{fan1Running ? 'Pause Fan 1' : '► Start Fan 1'}</span>
          </button>
        </div>

        {/* Fan 2 Card */}
        <div className="glass-card p-5 rounded-3xl space-y-4 border border-slate-800 bg-[#090d21]/90">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Disc className="w-4 h-4 text-purple-400" />
                <span>Fan 2 — ESC Pin 19</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {fan2Running ? '● Running (PWM Active)' : '● Stopped'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fan2Running}
                onChange={() => setFan2Running(!fan2Running)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          <button
            onClick={() => setFan2Running(!fan2Running)}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
          >
            {fan2Running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{fan2Running ? 'Pause Fan 2' : '► Start Fan 2'}</span>
          </button>
        </div>
      </div>

      {/* ─── ULTRASONIC SAFETY SENSORS SECTION ─── */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>ULTRASONIC SAFETY SENSORS</span>
        </h3>

        {/* Master Sensors Switch */}
        <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-slate-800 bg-[#090d21]/90">
          <div>
            <p className="text-xs font-bold text-slate-200">All Sensors Master Switch</p>
            <p className="text-[11px] text-slate-400">Disable all 3 HC-SR04 sensors at once</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={masterSensorsOn}
              onChange={() => setMasterSensorsOn(!masterSensorsOn)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
          </label>
        </div>

        {/* 3 Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sensor 1 */}
          <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-800 bg-[#090d21]/90">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-100">Sensor 1</h4>
                <span className="text-[10px] text-slate-500 font-mono">TRIG:25 • ECHO:26</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">● OK</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={sensor1On} onChange={() => setSensor1On(!sensor1On)} className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center font-mono">
              <span className="text-xl font-bold text-slate-200">{sensor1Dist}</span>
              <span className="text-xs text-slate-400 ml-1">cm</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 gap-2">
              <span>Threshold:</span>
              <input
                type="number"
                value={threshold1}
                onChange={(e) => setThreshold1(Number(e.target.value))}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-cyan-300 text-xs"
              />
              <button className="px-2 py-1 bg-slate-800 rounded-lg text-slate-300 font-bold text-[10px]">Set</button>
            </div>
          </div>

          {/* Sensor 2 */}
          <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-800 bg-[#090d21]/90">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-100">Sensor 2</h4>
                <span className="text-[10px] text-slate-500 font-mono">TRIG:27 • ECHO:14</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">● OK</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={sensor2On} onChange={() => setSensor2On(!sensor2On)} className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center font-mono">
              <span className="text-xl font-bold text-slate-200">{sensor2Dist}</span>
              <span className="text-xs text-slate-400 ml-1">cm</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 gap-2">
              <span>Threshold:</span>
              <input
                type="number"
                value={threshold2}
                onChange={(e) => setThreshold2(Number(e.target.value))}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-cyan-300 text-xs"
              />
              <button className="px-2 py-1 bg-slate-800 rounded-lg text-slate-300 font-bold text-[10px]">Set</button>
            </div>
          </div>

          {/* Sensor 3 */}
          <div className="glass-card p-5 rounded-3xl space-y-3 border border-slate-800 bg-[#090d21]/90">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-100">Sensor 3</h4>
                <span className="text-[10px] text-slate-500 font-mono">TRIG:32 • ECHO:33</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">● OK</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={sensor3On} onChange={() => setSensor3On(!sensor3On)} className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center font-mono">
              <span className="text-xl font-bold text-slate-200">{sensor3Dist}</span>
              <span className="text-xs text-slate-400 ml-1">cm</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 gap-2">
              <span>Threshold:</span>
              <input
                type="number"
                value={threshold3}
                onChange={(e) => setThreshold3(Number(e.target.value))}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-cyan-300 text-xs"
              />
              <button className="px-2 py-1 bg-slate-800 rounded-lg text-slate-300 font-bold text-[10px]">Set</button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER BAR ─── */}
      <div className="text-center pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
        HOLOGRAM MOTOR CONTROLLER • Fusion5 • ESP32 WebSocket Dashboard • A2212 Brushless Motors • HC-SR04 Ultrasonic Safety System
      </div>
    </section>
  );
}
