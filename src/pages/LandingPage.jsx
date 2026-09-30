import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ShieldCheck, Zap, ArrowRight, Activity, TrendingUp, CheckCircle2, MessageSquare, Clock, MapPin } from 'lucide-react';
import Train3DHero from '../components/Train3DHero.jsx';
import SearchForm from '../components/SearchForm.jsx';
import PredictionCard from '../components/PredictionCard.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage({ navigate }) {
  const containerRef = useRef(null);
  const routeTrackRef = useRef(null);
  const trainRunnerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (trainRunnerRef.current && routeTrackRef.current) {
        gsap.to(trainRunnerRef.current, {
          x: () => routeTrackRef.current.offsetWidth - 70,
          ease: 'none',
          scrollTrigger: {
            trigger: routeTrackRef.current,
            start: 'top 80%',
            end: 'bottom 30%',
            scrub: 1
          }
        });
      }

      gsap.from('.feature-card-anim', {
        y: 35,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#platform-pillars',
          start: 'top 80%'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSearchSubmit = (searchParams) => {
    navigate(`/search?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}&travelClass=${searchParams.travelClass}&passengers=${searchParams.passengers}`);
  };

  return (
    <div ref={containerRef} className="space-y-16 md:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="pt-6 md:pt-10">
        <Train3DHero onExploreSearch={() => {
          document.getElementById('search-panel')?.scrollIntoView({ behavior: 'smooth' });
        }} />
      </section>

      {/* 2. JOURNEY PLANNER SEARCH PANEL */}
      <section id="search-panel" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 uppercase tracking-wider">
            Express Reservation Portal
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Plan your high-speed express journey
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time seat inventory, automated coach allocation, and ML waitlist estimates.
          </p>
        </div>
        <SearchForm onSearch={handleSearchSubmit} />
      </section>

      {/* 3. SCROLL-TRIGGERED HIGH SPEED CORRIDOR VISUAL */}
      <section id="fleet-corridors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                FEATURED HIGH-SPEED ROUTE
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                New Delhi ↔ Varanasi Vande Bharat Express (#22436)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700">759 km in 8h 00m · Direct Express Service</span>
            </div>
          </div>

          {/* Interactive Animated Route Line */}
          <div ref={routeTrackRef} className="relative py-8 px-4 overflow-hidden bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="absolute top-1/2 left-6 right-6 h-1.5 bg-slate-200 -translate-y-1/2 rounded-full"></div>

            {/* Stations on route */}
            <div className="relative z-10 flex justify-between items-center text-xs font-bold">
              <div className="text-center">
                <div className="w-5 h-5 rounded-full bg-sky-600 border-4 border-white shadow-sm mx-auto mb-1"></div>
                <div className="text-slate-900">New Delhi (NDLS)</div>
                <div className="text-[10px] text-slate-400 font-normal">Dept 06:00 AM</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 rounded-full bg-slate-400 border-2 border-white mx-auto mb-1"></div>
                <div className="text-slate-700">Kanpur (CNB)</div>
                <div className="text-[10px] text-slate-400 font-normal">Arr 10:08 AM</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 rounded-full bg-slate-400 border-2 border-white mx-auto mb-1"></div>
                <div className="text-slate-700">Prayagraj (PRYJ)</div>
                <div className="text-[10px] text-slate-400 font-normal">Arr 12:08 PM</div>
              </div>
              <div className="text-center">
                <div className="w-5 h-5 rounded-full bg-teal-600 border-4 border-white shadow-sm mx-auto mb-1"></div>
                <div className="text-slate-900">Varanasi (BSB)</div>
                <div className="text-[10px] text-slate-400 font-normal">Arr 02:00 PM</div>
              </div>
            </div>

            {/* Traveling Train Runner Indicator */}
            <div
              ref={trainRunnerRef}
              className="absolute top-1/2 -translate-y-1/2 left-4 z-20 pointer-events-none"
            >
              <div className="px-3 py-1 bg-slate-900 text-teal-300 text-[10px] font-bold rounded-full shadow-lg flex items-center gap-1.5">
                <span>🚆 VB 22436</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUR CORE PLATFORM PILLARS (ENTERPRISE FOCUSED) */}
      <section id="platform-pillars" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 uppercase tracking-wider">
            Core Mobility Capabilities
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            Setting the standard for railway technology
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Engineered for high passenger throughput, instant seat reservations, and journey intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: High-Speed Fleet */}
          <div className="feature-card-anim bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-sky-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">High-Speed Fleet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vande Bharat, Tejas Rajdhani, and Shatabdi Express services connecting metropolitan hubs with automated doors, onboard Wi-Fi, and 160 km/h velocity.
            </p>
            <div className="text-xs font-semibold text-sky-700">
              Intercity Express Network
            </div>
          </div>

          {/* Pillar 2: Booking Intelligence */}
          <div className="feature-card-anim bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-teal-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Waitlist Intelligence</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Probabilistic clearance models analyze class cancellation velocity and seasonal rush multipliers to provide clear confirmation probability estimates.
            </p>
            <div className="text-xs font-semibold text-teal-700">
              Bayesian Churn Forecasting
            </div>
          </div>

          {/* Pillar 3: Secure Transactions */}
          <div className="feature-card-anim bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-amber-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Sub-Second Booking</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Concurrency-locked seat reservations ensure zero double-booking, instant PNR issuance, and automated refund disbursement upon itinerary cancellation.
            </p>
            <div className="text-xs font-semibold text-amber-700">
              Guaranteed Seat Integrity
            </div>
          </div>

          {/* Pillar 4: Passenger Experience */}
          <div className="feature-card-anim bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">24/7 Service Redressal</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated passenger grievance logging with strict resolution SLAs, onboard housekeeping dispatch, and natural language sentiment feedback.
            </p>
            <div className="text-xs font-semibold text-indigo-700">
              Rapid Operations Support
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE BOOKING PREDICTION SIMULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PredictionCard />
      </section>

      {/* 6. ENTERPRISE MOBILITY CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              <Activity className="w-3.5 h-3.5" />
              <span>National Express Mobility Platform</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Ready for your next journey?
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Join thousands of daily commuters and business travelers experiencing the comfort, punctuality, and speed of our high-speed express network.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => {
                navigate('/search');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Book Express Tickets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
