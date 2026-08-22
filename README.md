# Pioneering-Volumetric-3D-Holographic-Spatial-Display

# FUSION 5 • Volumetric 3D Holographic Spatial Display System

An advanced, high-speed volumetric 3D holographic POV (Persistence of Vision) control system developed at the **Faculty of Information Technology, University of Moratuwa**. 

---

## 🌟 Key Features

* **Dual-Rotor 2×1 Vertical Overlap Choreography**: Unified tall aspect ratio display matrix with a 13cm center convergence zone.
* **Invisigrid Interactive Motion UI**: Glassmorphic web console featuring 60 FPS constellation particle canvas and custom adaptive cursor system.
* **ESP32 Dual-MCU Architecture**: Dedicated POV rendering engine (ESP32-S3-N16R8 @ 20MHz SPI) + Wi-Fi motor controller (SoftAP @ 192.168.4.1 + WebSockets).
* **50Hz ESC Pulse-Width Motor Control**: Servo PWM throttle curves ($1000\mu\text{s} \to 2000\mu\text{s}$) driving dual 2200KV BLDC motors up to 3600 RPM.
* **Ultrasonic Sonar Safety Shield**: Triple HC-SR04 acoustic distance sensors with sub-30ms hardware interrupt motor cutoff.
* **RGB565 Polar Image Processor**: Live image/video converter generating 12,000-byte binary payloads for mid-air holographic projection.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Canvas 2D API
* **Firmware**: C++ Arduino ESP32 (SoftAP, WebSockets, FastLED/APA102, Interrupt Handlers)
* **Deployment**: Vercel

---

## 🚀 Local Development Setup

```bash
# Clone repository
git clone https://github.com/Ravindu200324511398/Pioneering-Volumetric-3D-Holographic-Spatial-Display.git

# Navigate into project directory
cd Pioneering-Volumetric-3D-Holographic-Spatial-Display

# Install dependencies
npm install

# Start local dev server
npm run dev
```

---

## 👥 Engineering Team

Built with passion at the **Faculty of Information Technology, University of Moratuwa**.
