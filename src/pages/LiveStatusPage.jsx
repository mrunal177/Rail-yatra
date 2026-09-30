import React from 'react';
import LiveTrainTracker from '../components/LiveTrainTracker.jsx';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function LiveStatusPage({ navigate }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              REAL-TIME OPERATIONS GRID
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Satellite Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Live Train Status & Position Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time location, speed, arrival delays, and platform numbers for all express corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            Find & Book Trains
          </button>
        </div>
      </div>

      {/* Main Live Train Tracker Component */}
      <LiveTrainTracker
        defaultTrain="22436"
        onBookTrain={(trainId) => navigate(`/search?trainId=${trainId}`)}
      />
    </div>
  );
}
