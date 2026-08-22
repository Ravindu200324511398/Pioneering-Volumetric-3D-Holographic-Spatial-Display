import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LiveController from './components/LiveController';
import MediaStudio from './components/MediaStudio';
import GeometryViewer from './components/GeometryViewer';
import ElectronicsSection from './components/ElectronicsSection';
import BuildGuideSection from './components/BuildGuideSection';
import CodeExplorer from './components/CodeExplorer';
import TeamSection from './components/TeamSection';
import ParticleField from './components/ParticleField';
import FloatingGeo from './components/FloatingGeo';
import { IMAGE_PRESETS } from './data/presetData';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPreset, setSelectedPreset] = useState(IMAGE_PRESETS[0]); // Fusion 5 emblem
  const [rpm, setRpm] = useState(2400);
  const [brightness, setBrightness] = useState(80);
  const [isDualMode, setIsDualMode] = useState(true);
  const [angleOffset1, setAngleOffset1] = useState(0);
  const [angleOffset2, setAngleOffset2] = useState(0);
  const [overlapCm, setOverlapCm] = useState(13);
  const [distanceCm, setDistanceCm] = useState(31);
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* Invisigrid Ambient Particle Field & Floating Geo Wireframe Background */}
      <ParticleField />
      <FloatingGeo />

      {/* Navigation Header */}
      <div className="relative z-10">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDualMode={isDualMode}
          setIsDualMode={setIsDualMode}
          isConnected={isConnected}
        />
      </div>

      {/* Main Dynamic Content Body */}
      <main className="relative z-10 flex-grow">
        {activeTab === 'overview' && (
          <HeroSection
            setActiveTab={setActiveTab}
            selectedPreset={selectedPreset}
            rpm={rpm}
            setRpm={setRpm}
            brightness={brightness}
            setBrightness={setBrightness}
            isDualMode={isDualMode}
            angleOffset1={angleOffset1}
            angleOffset2={angleOffset2}
          />
        )}

        {activeTab === 'controller' && (
          <LiveController
            rpm={rpm}
            setRpm={setRpm}
            brightness={brightness}
            setBrightness={setBrightness}
            angleOffset1={angleOffset1}
            setAngleOffset1={setAngleOffset1}
            angleOffset2={angleOffset2}
            setAngleOffset2={setAngleOffset2}
            overlapCm={overlapCm}
            setOverlapCm={setOverlapCm}
            distanceCm={distanceCm}
            setDistanceCm={setDistanceCm}
            isDualMode={isDualMode}
            setIsDualMode={setIsDualMode}
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            isConnected={isConnected}
            setIsConnected={setIsConnected}
          />
        )}

        {activeTab === 'studio' && (
          <MediaStudio
            setSelectedPreset={setSelectedPreset}
            isDualMode={isDualMode}
            distanceCm={distanceCm}
            overlapCm={overlapCm}
            angleOffset1={angleOffset1}
            angleOffset2={angleOffset2}
          />
        )}

        {activeTab === 'geometry' && (
          <GeometryViewer
            distanceCm={distanceCm}
            setDistanceCm={setDistanceCm}
            overlapCm={overlapCm}
            setOverlapCm={setOverlapCm}
            angleOffset1={angleOffset1}
            setAngleOffset1={setAngleOffset1}
            angleOffset2={angleOffset2}
            setAngleOffset2={setAngleOffset2}
          />
        )}

        {activeTab === 'electronics' && <ElectronicsSection />}

        {activeTab === 'guide' && <BuildGuideSection />}

        {activeTab === 'code' && <CodeExplorer />}

        {activeTab === 'team' && <TeamSection />}
      </main>
    </div>
  );
}
