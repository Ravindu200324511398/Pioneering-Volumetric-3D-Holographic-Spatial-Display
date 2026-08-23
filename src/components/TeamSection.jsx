import React, { useState } from 'react';
import { Users, Award, Sparkles, Camera, Heart, CheckCircle2, ChevronRight, UploadCloud, GraduationCap, Gauge, Activity, ShieldCheck } from 'lucide-react';

export default function TeamSection() {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // 2 Group Evaluation Photos
  const evaluationPhotos = [
    {
      id: 1,
      src: '/team/fusion5_team_group_selfie.jpg',
      title: 'Final Project Evaluation Showcase',
      role: 'FUSION 5 Engineering Team',
      location: 'Faculty of Information Technology',
      caption: 'The core engineering team presenting the functional 2×1 vertical dual-fan hologram array display during final project evaluation at the Faculty of Information Technology.',
      badge: 'Final Evaluation'
    },
    {
      id: 2,
      src: '/team/fusion5_team_faculty_steps.jpg',
      title: 'FIT Entrance Steps Showcase',
      role: 'Faculty of Information Technology Team',
      location: 'FIT Entrance Steps',
      caption: 'Team members gathered at the FIT entrance steps following successful live hardware demonstration and safety evaluation.',
      badge: 'Evaluation Day'
    },
  ];

  // 5 Individual Team Members (Raniru, Ravindu, Nesandu, Pavani, Janani)
  const teamMembers = [
    {
      id: 'm1',
      name: 'Raniru',
      role: 'Firmware & Embedded Systems Lead',
      badge: 'Firmware Lead',
      src: '/team/fusion5_team_member_2.jpg',
      caption: 'Engineered ESP32-S3 high-speed SPI rendering pipeline, sub-millisecond Hall Effect phase synchronization, and SoftAP WebSockets.',
      hasCustomImage: true
    },
    {
      id: 'm2',
      name: 'Ravindu',
      role: 'Project Lead & Hardware Systems Engineer',
      badge: 'Lead Engineer',
      src: '/team/fusion5_team_member_1.jpg',
      caption: 'Architected the 2×1 vertical overlap dual-rotor chassis, 50Hz ESC PWM motor dynamics, and live telemetry web application.',
      hasCustomImage: true
    },
    {
      id: 'm3',
      name: 'Nesandu',
      role: 'Mechanical Design & Structural Specialist',
      badge: 'Mechanical Lead',
      src: null,
      caption: 'Designed the vertical aluminium extrusion spine, dual A2212 motor mounting plates, and 3x sonar sensor safety posts.',
      hasCustomImage: false
    },
    {
      id: 'm4',
      name: 'Pavani',
      role: 'Polar Matrix Algorithms & Data Engineer',
      badge: 'Software Specialist',
      src: null,
      caption: 'Developed Cartesian-to-Polar coordinate matrix transformation algorithms and 12,000-byte RGB565 binary buffer generators.',
      hasCustomImage: false
    },
    {
      id: 'm5',
      name: 'Janani',
      role: 'Perimeter Safety & Quality Assurance Lead',
      badge: 'Safety & QA Lead',
      src: null,
      caption: 'Engineered triple HC-SR04 ultrasonic sonar time-of-flight acoustic safety monitoring and automated emergency cutoff routines.',
      hasCustomImage: false
    },
  ];

  return (
    <section className="py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* ─── PAGE HEADER & WORDS OF OUR WORK ─── */}
      <div className="border-b border-cyan-500/20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-3.5 py-1 text-xs font-mono text-cyan-300">
            <GraduationCap className="w-4 h-4 text-cyan-400" />
            <span>/ faculty_of_information_technology</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 flex items-center gap-3">
            <Users className="w-9 h-9 text-cyan-400" />
            <span>FUSION 5 Engineering Team & Gallery</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            FUSION 5 was conceived and engineered at the <strong className="text-cyan-300 font-bold">Faculty of Information Technology</strong>. Our team fused high-speed embedded systems, 50Hz ESC pulse-width motor control, and sub-millisecond Hall Effect phase synchronization into a unified 3D spatial display.
          </p>
        </div>

        {/* Stats Badge */}
        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto bg-[#070c1e]/90 p-3 rounded-2xl border border-cyan-500/30 backdrop-blur-xl shrink-0">
          <div className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/40 text-center flex flex-col items-center justify-center">
            <span className="block text-xl sm:text-2xl font-black text-cyan-300 font-mono">5</span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Engineers</span>
          </div>
          <div className="px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-400/40 text-center flex flex-col items-center justify-center">
            <span className="block text-xl sm:text-2xl font-black text-purple-300 font-mono">2×1</span>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">Dual Rig</span>
          </div>
        </div>
      </div>

      {/* ─── FEATURED FULL GROUP PHOTO HERO CARD ─── */}
      <div className="group relative rounded-3xl overflow-hidden border border-cyan-500/40 bg-[#060a1a] shadow-[0_0_50px_rgba(0,243,255,0.15)] transition-all duration-500 hover:border-cyan-400">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Photo */}
          <div className="lg:col-span-7 relative min-h-[380px] overflow-hidden bg-slate-950 flex items-center justify-center">
            <img
              src="/team/fusion5_team_group_selfie.jpg"
              alt="Fusion 5 Core Engineering Team"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060a1a] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#060a1a]"></div>
            
            <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-slate-950/85 border border-cyan-400 text-xs font-bold text-cyan-300 backdrop-blur-md flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Primary Group Photo</span>
            </span>
          </div>

          {/* Words of Our Work & Description */}
          <div className="lg:col-span-5 p-7 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                FIT Innovation Project
              </div>

              <h3 className="text-2xl font-black text-slate-100 leading-tight">
                Pioneering Volumetric 3D Holographic Spatial Displays
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                "Our journey began with a single vision: to transform standard two-dimensional LED displays into living three-dimensional spatial holograms in mid-air. Through rigorous experimentation with dual outrunner motors, phase-locked Hall Effect synchronization, and acoustic sonar clearance, FUSION 5 proves that cutting-edge hardware innovation thrives through dedicated teamwork."
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Faculty of Information Technology • University of Moratuwa</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Dual-Core ESP32-S3 POV Rendering & 50Hz Servo Control</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: FINAL PROJECT EVALUATION GROUP SHOWCASE (2 PHOTOS) ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Award className="w-5 h-5 text-cyan-400" />
            <span>Final Evaluation Showcase • Group Photographs</span>
          </h3>
          <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950 px-3 py-1 rounded-full border border-cyan-500/40">
            2 Evaluation Photos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evaluationPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#070c1e]/90 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400 hover:shadow-[0_15px_35px_rgba(0,243,255,0.2)] cursor-pointer flex flex-col justify-between"
            >
              <div className="relative h-72 overflow-hidden bg-slate-950">
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070c1e] via-transparent to-transparent opacity-85"></div>

                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 border border-cyan-400 text-xs font-mono font-bold text-cyan-300 backdrop-blur-md shadow-lg">
                  {photo.badge}
                </span>
              </div>

              <div className="p-6 space-y-2">
                <h4 className="text-lg font-extrabold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {photo.title}
                </h4>
                <p className="text-xs text-cyan-400 font-mono font-semibold">{photo.role}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{photo.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 2: 5 INDIVIDUAL TEAM MEMBERS (RAVINDU, RANIRU, NESANDU, PAWANI, JANANI) ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-purple-400" />
            <span>FUSION 5 Project Team Members</span>
          </h3>
          <span className="text-xs font-mono text-purple-300 font-bold bg-purple-950 px-3 py-1 rounded-full border border-purple-500/40">
            5 Engineers
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => member.src && setSelectedPhoto({ src: member.src, title: member.name, caption: member.caption })}
              className={`group relative overflow-hidden rounded-3xl border backdrop-blur-2xl transition-all duration-300 ${
                member.hasCustomImage
                  ? 'border-slate-800 bg-[#070c1e]/90 hover:-translate-y-1.5 hover:border-cyan-400 hover:shadow-[0_15px_35px_rgba(0,243,255,0.2)] cursor-pointer'
                  : 'border-2 border-dashed border-cyan-500/30 bg-[#050814]/70 hover:border-cyan-400 hover:bg-[#070d22]/90'
              } p-6 flex flex-col justify-between space-y-4`}
            >
              {member.hasCustomImage ? (
                <div className="relative h-64 overflow-hidden rounded-2xl bg-slate-950 mb-2">
                  <img
                    src={member.src}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070c1e] via-transparent to-transparent opacity-70"></div>
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/85 border border-cyan-400 text-[11px] font-mono font-bold text-cyan-300 backdrop-blur-md">
                    {member.badge}
                  </span>
                </div>
              ) : (
                <div className="relative h-48 rounded-2xl border border-cyan-500/20 bg-slate-950/80 flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-cyan-300 font-bold">Photo Space Reserved</span>
                  <p className="text-[11px] text-slate-400">Upload upcoming photo for {member.name}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-extrabold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {member.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
                    {member.badge}
                  </span>
                </div>

                <p className="text-xs text-cyan-400 font-mono font-medium">{member.role}</p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">{member.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CREATIVE WORDS OF OUR WORK CARDS (BENTO DOCTRINE NODES) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Execution */}
        <div className="group relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0a122c]/90 via-[#060a1a]/95 to-[#030612]/95 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(0,243,255,0.25)] flex flex-col justify-between space-y-5">
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 font-mono text-[11px] font-bold border border-cyan-500/40">
                01 • Execution
              </span>
              <span className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <Gauge className="w-4 h-4" />
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-slate-100 to-cyan-100">
              2400 RPM Persistence of Vision
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Converting ultra-fast rotating LED blade sweeps into crisp 3D spatial graphics through persistent human optical retina integration.
            </p>
          </div>

          <div className="relative z-10 pt-3 border-t border-cyan-500/20 flex items-center gap-1.5 font-mono text-[10px] text-cyan-400 font-semibold">
            <span>✓ 2400 RPM POV Retinal Engine</span>
          </div>
        </div>

        {/* Card 2: Phase Sync */}
        <div className="group relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-b from-[#1b0a2a]/90 via-[#0d0517]/95 to-[#04020a]/95 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.25)] flex flex-col justify-between space-y-5">
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 font-mono text-[11px] font-bold border border-purple-500/40">
                02 • Phase Sync
              </span>
              <span className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400">
                <Activity className="w-4 h-4" />
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-slate-100 to-purple-100">
              Sub-MS Hall Sensor Sync
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Hardware interrupts trigger exact polar matrix polar coordinate line updates on every rotor pass with zero phase jitter drift.
            </p>
          </div>

          <div className="relative z-10 pt-3 border-t border-purple-500/20 flex items-center gap-1.5 font-mono text-[10px] text-purple-400 font-semibold">
            <span>✓ Zero Phase Jitter Drift</span>
          </div>
        </div>

        {/* Card 3: Safety */}
        <div className="group relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#051f15]/90 via-[#020e0a]/95 to-[#010604]/95 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.25)] flex flex-col justify-between space-y-5">
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/40">
                03 • Safety
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-slate-100 to-emerald-100">
              Acoustic Sonar Shield
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Triple HC-SR04 ultrasonic distance sensors constantly guard the perimeter clearance zone for instant emergency shutdown.
            </p>
          </div>

          <div className="relative z-10 pt-3 border-t border-emerald-500/20 flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 font-semibold">
            <span>✓ Triple Sonar Radar Cutoff</span>
          </div>
        </div>

        {/* Card 4: Vision */}
        <div className="group relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#211604]/90 via-[#0e0a02]/95 to-[#050301]/95 p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/80 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.25)] flex flex-col justify-between space-y-5">
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-amber-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/40">
                04 • Vision
              </span>
              <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <GraduationCap className="w-4 h-4" />
              </span>
            </div>

            <h4 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-slate-100 to-amber-100">
              Faculty of IT Excellence
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Driven by passion for software and hardware fusion, built at the Faculty of Information Technology, University of Moratuwa.
            </p>
          </div>

          <div className="relative z-10 pt-3 border-t border-amber-500/20 flex items-center gap-1.5 font-mono text-[10px] text-amber-400 font-semibold">
            <span>✓ University of Moratuwa</span>
          </div>
        </div>

      </div>

      {/* ─── FULLSCREEN MODAL PHOTO VIEWER ─── */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#070c1e] border border-cyan-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 sm:p-6"
          >
            <div className="relative max-h-[70vh] overflow-hidden rounded-2xl flex items-center justify-center bg-slate-950">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-100">{selectedPhoto.title}</h3>
                <p className="text-xs text-cyan-400 font-mono">{selectedPhoto.caption}</p>
              </div>

              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
