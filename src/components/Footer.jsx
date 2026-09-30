import React from 'react';
import { Train, ShieldCheck, Zap, Heart, CheckCircle2, Phone, Mail } from 'lucide-react';

export default function Footer({ navigate }) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-100">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-600 flex items-center justify-center text-white">
                <Train className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                RAILCONNECT MOBILITY
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Next-generation railway technology platform delivering high-speed passenger rail reservations,
              automated seat inventory allocation, and predictive journey intelligence across the national express grid.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified Express Operations · Sub-Second Ticket Issuance</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2 text-xs font-medium">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Passenger Services</h4>
            <div>
              <button onClick={() => navigate('/search')} className="text-slate-500 hover:text-sky-600 transition cursor-pointer">
                Journey Search & Route Schedules
              </button>
            </div>
            <div>
              <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-sky-600 transition cursor-pointer">
                PNR Status & Active Reservations
              </button>
            </div>
            <div>
              <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-sky-600 transition cursor-pointer">
                Automated Cancellation & Refunds
              </button>
            </div>
            <div>
              <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-sky-600 transition cursor-pointer">
                Passenger Support & Grievances
              </button>
            </div>
          </div>

          {/* Fleet & Passenger Network */}
          <div className="md:col-span-4 space-y-2 text-xs text-slate-500">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Fleet Specifications</h4>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5 font-sans text-xs">
              <div className="flex justify-between">
                <span>Vande Bharat 2.0:</span>
                <span className="font-bold text-slate-800">160 km/h · Auto Doors</span>
              </div>
              <div className="flex justify-between">
                <span>Tejas Rajdhani:</span>
                <span className="font-bold text-slate-800">Overnight Sleepers</span>
              </div>
              <div className="flex justify-between">
                <span>Passenger Helpline:</span>
                <span className="font-bold text-sky-700">139 (Toll Free)</span>
              </div>
              <div className="flex justify-between">
                <span>Safety Rating:</span>
                <span className="font-bold text-emerald-700">99.8% Punctual</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Legal Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 RailConnect Mobility Systems. All rights reserved.
          </div>
          <div className="text-[11px] text-slate-400 italic">
            * Waitlist confirmation probabilities are algorithmic estimates based on historical cancellation trends and do not constitute a legal allotment guarantee.
          </div>
        </div>
      </div>
    </footer>
  );
}
