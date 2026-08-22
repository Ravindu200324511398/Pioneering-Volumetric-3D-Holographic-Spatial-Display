import React, { useState } from 'react';
import { BookOpen, CheckCircle, ChevronDown, ChevronRight, Wrench, Cpu, Wifi, Sparkles, AlertCircle, Gauge } from 'lucide-react';

export default function BuildGuideSection() {
  const [openStep, setOpenStep] = useState(1);

  const steps = [
    {
      num: 1,
      title: 'Phase 1: Mechanical Frame & 3D Enclosure Assembly',
      icon: Wrench,
      description: 'Print the interlocking housing panels and mount the dual brushless DC motors in vertical 2x1 array alignment.',
      details: [
        '3D print the top and bottom fan bracket enclosures using PETG or ABS for high structural rigidity.',
        'Fix the two BLDC motors with 31 cm center-to-center vertical spacing to ensure an exact 13 cm blade overlap zone.',
        'Statically balance each fan blade by adding counterweights to prevent vibration at 3000 RPM.'
      ]
    },
    {
      num: 2,
      title: 'Phase 2: LED Blade Soldering & Power Wiring',
      icon: Cpu,
      description: 'Solder 100 APA102-2020 LEDs along each blade and route SPI data/clock lines to the ESP32-S3.',
      details: [
        'Adhere the 100 APA102 2020 LEDs along the fan blade using heat-resistant thermal tape.',
        'Connect GPIO 11 to APA102 Data (DI) and GPIO 12 to APA102 Clock (CI).',
        'Wire external 5V/3A DC power supply directly to VCC/GND of the LED strip, sharing a common ground with ESP32.'
      ]
    },
    {
      num: 3,
      title: 'Phase 3: Hall Effect Sensor & Neodymium Magnet Alignment',
      icon: Sparkles,
      description: 'Position the A3144 Hall Effect sensor to trigger a timing interrupt once per full revolution.',
      details: [
        'Glue a small N52 neodymium magnet onto the stationary frame near the blade rotation path.',
        'Mount the A3144 Hall sensor onto the rotating blade hub connected to GPIO 4 (active LOW).',
        'Verify sub-millisecond interrupt timing using a multimeter or oscilloscope.'
      ]
    },
    {
      num: 4,
      title: 'Phase 4: ESC Motor Controller & Ultrasonic Sensor Wiring',
      icon: Gauge,
      description: 'Connect 30A ESC signal lines to GPIO 18/19 and wire 3x HC-SR04 ultrasonic sensors for perimeter security.',
      details: [
        'Connect Fan 1 ESC signal line to ESP32 GPIO 18 and Fan 2 ESC signal to GPIO 19.',
        'Wire HC-SR04 ultrasonic sensors: Sensor 1 (TRIG 25/ECHO 26), Sensor 2 (TRIG 27/ECHO 14), Sensor 3 (TRIG 32/ECHO 33).',
        'Connect high-current 12V/15A power supply or 3S LiPo battery directly to ESC V+ and GND.',
        'Flash hologram_motor_controller.ino to the dedicated ESP32 Motor Controller MCU.'
      ]
    },
    {
      num: 5,
      title: 'Phase 5: Flashing ESP32 Display Firmware via Arduino IDE 2.x',
      icon: BookOpen,
      description: 'Compile and flash HologramFanFirmware.ino with FFat filesystem enabled.',
      details: [
        'Set Board to "ESP32S3 Dev Module" in Arduino IDE.',
        'Set Partition Scheme to "16M Flash (3MB APP/9.9MB FATFS)" and PSRAM to "OPI PSRAM".',
        'Set #define FAN_ID 1 for Fan 1 (Top) and flash over USB-C.',
        'Change to #define FAN_ID 2 and flash Fan 2 (Bottom).'
      ]
    },
    {
      num: 6,
      title: 'Phase 6: Wi-Fi Calibration & Polar Image Alignment',
      icon: Wifi,
      description: 'Connect your Mac/PC to the HologramFan & Motor Controller Wi-Fi APs and calibrate angle offsets.',
      details: [
        'Connect to Wi-Fi SSID "HOLOGRAM MOTOR CONTROLLER" (password: 12345678).',
        'Open this Web App and click "Transmit Settings to ESP32 Hardware".',
        'Use the Live Controller ESC throttle sliders (0–100%) and angle offset sliders (-180° to +180°) for smooth spinning and seamless image overlap.'
      ]
    }
  ];

  return (
    <section className="py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-cyan-500/20 pb-4">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <span>Step-by-Step DIY Build & Flashing Guide</span>
        </h2>
        <p className="text-xs text-slate-400">
          Comprehensive step-by-step instructions on assembling hardware, wiring components, flashing firmware, and calibrating polar alignment.
        </p>
      </div>

      {/* Accordion Steps List */}
      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isOpen = openStep === step.num;
          return (
            <div
              key={step.num}
              className="glass-card rounded-3xl overflow-hidden transition-all border border-slate-800 hover:border-cyan-500/40"
            >
              {/* Step Title Header */}
              <button
                onClick={() => setOpenStep(isOpen ? null : step.num)}
                className="w-full p-5 flex items-center justify-between text-left gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${isOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{step.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900 text-slate-400">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {/* Step Expanded Content */}
              {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 bg-slate-950/40 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Instructions & Checkpoints:</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
