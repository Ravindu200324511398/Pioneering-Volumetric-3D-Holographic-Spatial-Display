import React, { useState } from 'react';
import {
  Disc, Wifi, Cpu, Layers, Activity, Sliders, UploadCloud, BookOpen, Code2, Users, Menu, X, Home
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isDualMode, setIsDualMode, isConnected }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Lab', icon: Home },
    { id: 'controller', label: 'Controller', icon: Sliders },
    { id: 'studio', label: 'Hologram Array', icon: UploadCloud },
    { id: 'geometry', label: '3D Geometry', icon: Layers },
    { id: 'electronics', label: 'Electronics', icon: Cpu },
    { id: 'guide', label: 'Build Guide', icon: BookOpen },
    { id: 'code', label: 'Firmware Code', icon: Code2 },
    { id: 'team', label: 'Team & Gallery', icon: Users },
  ];

  const handleTabClick = (id) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 px-4 py-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* ─── LEFT BRAND LOGO BADGE ─── */}
        <div
          onClick={() => handleTabClick('overview')}
          className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#070c1e]/90 border border-slate-800 text-xs font-bold text-slate-200 backdrop-blur-xl shadow-lg cursor-pointer hover:border-cyan-500/40 transition-all"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-slate-950">
            <Disc className="w-3.5 h-3.5 animate-spin-slow" />
          </div>
          <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-300">
            FUSION 5
          </span>
        </div>

        {/* ─── CENTERED FLOATING PILL NAVBAR (INVISIGRID STYLE) ─── */}
        <div className="pointer-events-auto hidden md:inline-flex items-center gap-1 bg-[#060a19]/90 border border-slate-800/90 rounded-full p-1.5 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,243,255,0.25)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── RIGHT CONTROLS: WI-FI CONNECTION STATUS ─── */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Wi-Fi Indicator Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#070c1e]/90 border border-slate-800 text-xs text-slate-400 backdrop-blur-xl shadow-lg">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <Wifi className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] text-slate-300 font-semibold">
              {isConnected ? '192.168.4.1' : 'Simulated'}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-[#070c1e]/90 border border-slate-800 text-cyan-400 hover:bg-slate-800 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-3 max-w-md mx-auto p-3 bg-[#070c1e]/95 border border-slate-800 rounded-2xl grid grid-cols-2 gap-2 backdrop-blur-2xl shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
                  isActive ? 'bg-slate-800 text-cyan-300 border border-cyan-400/40' : 'text-slate-400 bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}


