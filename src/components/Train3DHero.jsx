import React, { useState } from 'react';
import { ArrowRight, Activity, ShieldCheck, Zap, Gauge, CheckCircle2 } from 'lucide-react';

export default function Train3DHero({ onExploreSearch }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-7xl mx-auto rounded-3xl bg-gradient-to-b from-sky-50/60 via-white to-slate-50 border border-slate-200/90 p-8 md:p-12 shadow-xl shadow-sky-100/30 overflow-hidden"
    >
      {/* Background Elevated Rail Track Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/2 left-0 right-0 h-16 railway-track-bg -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Content */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Next-Generation High-Speed Rail Network</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Precision travel.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700">
                Engineered for speed.
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
              Experience seamless intercity journeys with instant seat allocation, predictive waitlist intelligence,
              and synchronized operations across our fleet of high-speed express trains.
            </p>
          </div>

          {/* Key Railway Telemetry Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200/60">
            <div>
              <div className="text-2xl font-black text-slate-900">160 km/h</div>
              <div className="text-xs font-semibold text-slate-500">Service Speed</div>
            </div>
            <div>
              <div className="text-2xl font-black text-teal-600">89.4%</div>
              <div className="text-xs font-semibold text-slate-500">Confirmation Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-black text-sky-600">&lt; 0.1s</div>
              <div className="text-xs font-semibold text-slate-500">Instant Reservation</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExploreSearch}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Search Available Trains</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#fleet-corridors"
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl shadow-xs transition hover:border-slate-300"
            >
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Explore Routes & Fleet</span>
            </a>
          </div>
        </div>

        {/* Right 3D Train Isometric Stage */}
        <div className="lg:col-span-6 relative flex justify-center items-center py-6 perspective-1000">
          <div
            className="relative w-full max-w-md transition-transform duration-300 ease-out"
            style={{
              transform: `rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`
            }}
          >
            {/* Floating Live Badge 1: Booking Intelligence Prediction */}
            <div className="absolute -top-6 -left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-lg shadow-slate-200/60 transition-transform hover:scale-105">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">
                  Booking Intelligence
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-800">
                Waitlist Clearance: <span className="text-amber-600 font-bold">WL 18</span>
              </div>
              <div className="text-xs font-black text-teal-800 bg-teal-50 border border-teal-200/80 rounded-md px-2 py-0.5 mt-1">
                Estimated probability: 72%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Probabilistic Journey Estimate</div>
            </div>

            {/* Floating Live Badge 2: Real-time Seat Allocation */}
            <div className="absolute -bottom-4 -right-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 shadow-lg shadow-slate-200/60 transition-transform hover:scale-105">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Direct Berth Allocation</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Coach: <span className="font-bold text-slate-800 font-mono">C-4</span> · Berth: <span className="font-bold text-slate-800">Window</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Instant PNR Issuance
              </div>
            </div>

            {/* Aerodynamic High Speed Train Visual (Vande Bharat Express) */}
            <div className="relative mx-auto rounded-3xl p-6 bg-gradient-to-tr from-sky-100/40 via-white to-teal-50/30 border border-slate-200/90 shadow-2xl">
              <svg viewBox="0 0 540 280" className="w-full h-auto drop-shadow-md">
                <defs>
                  <linearGradient id="trainBody" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="60%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <linearGradient id="trainStripe" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#0f766e" />
                  </linearGradient>
                  <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                </defs>

                {/* Railway Tracks & Ballast */}
                <g id="tracks">
                  <path d="M 20 220 L 520 220" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 20 236 L 520 236" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
                  {[40, 90, 140, 190, 240, 290, 340, 390, 440, 490].map((x, i) => (
                    <line key={i} x1={x} y1="214" x2={x + 12} y2="242" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
                  ))}
                </g>

                {/* Train Shadow */}
                <ellipse cx="280" cy="226" rx="220" ry="12" fill="#0f172a" opacity="0.12" />

                {/* Train Structure */}
                <g id="train-engine">
                  {/* High Speed Pantograph */}
                  <path d="M 120 78 L 135 55 L 175 55 L 190 78" stroke="#475569" strokeWidth="3" fill="none" strokeLinejoin="round" />
                  <line x1="130" y1="52" x2="180" y2="52" stroke="#334155" strokeWidth="4" />

                  {/* Aerodynamic Shell */}
                  <path
                    d="M 50 180 
                       C 50 150, 70 95, 130 85 
                       L 480 85 
                       C 505 85, 515 95, 515 115 
                       L 515 195 
                       C 515 205, 505 210, 480 210 
                       L 150 210 
                       C 90 210, 50 195, 50 180 Z"
                    fill="url(#trainBody)"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                  />

                  {/* High-Speed Teal/Cyan Speed Stripe */}
                  <path
                    d="M 58 170 
                       C 75 160, 100 135, 140 135 
                       L 515 135 
                       L 515 160 
                       L 135 160 
                       C 95 160, 68 168, 58 170 Z"
                    fill="url(#trainStripe)"
                  />

                  {/* Aerodynamic Cockpit Windshield */}
                  <path
                    d="M 68 160 
                       C 80 135, 105 105, 145 100 
                       L 185 100 
                       L 185 135 
                       L 95 145 
                       Z"
                    fill="url(#glassGrad)"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  <path d="M 85 145 L 140 106 L 160 106 L 105 145 Z" fill="#38bdf8" opacity="0.35" />

                  {/* Executive Coach Windows */}
                  {[210, 260, 310, 360, 410, 460].map((wx, idx) => (
                    <rect
                      key={idx}
                      x={wx}
                      y="104"
                      width="38"
                      height="24"
                      rx="4"
                      fill="url(#glassGrad)"
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Headlights */}
                  <circle cx="68" cy="184" r="7" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
                  <circle cx="68" cy="184" r="14" fill="#fef08a" opacity="0.25" />

                  {/* Bogies & Wheels */}
                  <g id="bogies">
                    <rect x="110" y="200" width="70" height="12" rx="3" fill="#334155" />
                    <circle cx="125" cy="214" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
                    <circle cx="165" cy="214" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
                    <circle cx="125" cy="214" r="4" fill="#94a3b8" />
                    <circle cx="165" cy="214" r="4" fill="#94a3b8" />

                    <rect x="410" y="200" width="70" height="12" rx="3" fill="#334155" />
                    <circle cx="425" cy="214" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
                    <circle cx="465" cy="214" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
                    <circle cx="425" cy="214" r="4" fill="#94a3b8" />
                    <circle cx="465" cy="214" r="4" fill="#94a3b8" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
