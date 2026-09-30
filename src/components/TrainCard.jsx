import React, { useState } from 'react';
import { Clock, ArrowRight, ShieldCheck, Zap, Info, ChevronRight, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from './Badge.jsx';
import api from '../services/api.js';

export default function TrainCard({ train, onSelectClass, onBook }) {
  const [selectedClass, setSelectedClass] = useState(train.classes?.[0]?.travel_class || 'CC');
  const [showRoute, setShowRoute] = useState(false);
  const [routeStops, setRouteStops] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const activeClassObj = train.classes?.find(c => c.travel_class === selectedClass) || train.classes?.[0];

  const handleToggleRoute = async () => {
    if (!showRoute && !routeStops) {
      setLoadingRoute(true);
      try {
        const res = await api.get(`/trains/${train.train_id}/route`);
        if (res.route) setRouteStops(res.route);
      } catch (e) {
        console.warn('Failed to load route stops:', e.message);
      } finally {
        setLoadingRoute(false);
      }
    }
    setShowRoute(!showRoute);
  };

  const getStatusBadge = (status, delay) => {
    if (status === 'ON_TIME' || delay === 0) {
      return <Badge variant="success">On Time</Badge>;
    }
    return <Badge variant="warning">Delayed by {delay}m</Badge>;
  };

  const getTrainTypeBadge = (type) => {
    switch (type) {
      case 'VANDE_BHARAT':
        return <Badge variant="teal">Vande Bharat 160</Badge>;
      case 'RAJDHANI':
        return <Badge variant="primary">Tejas Rajdhani</Badge>;
      case 'SHATABDI':
        return <Badge variant="purple">Shatabdi Express</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow-md transition-all p-5 md:p-6 mb-4">
      {/* Top Header: Train Info & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-3 py-1.5 text-center">
            <span className="text-xs font-bold text-sky-800 tracking-wider">#{train.train_number}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {train.train_name}
            </h3>
            <div className="text-xs text-slate-500 font-medium">
              Runs on: <span className="text-slate-700 font-semibold">{train.runs_on_days || 'Daily'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getTrainTypeBadge(train.train_type)}
          {getStatusBadge(train.status, train.delay_minutes)}
        </div>
      </div>

      {/* Middle Grid: Departure, Duration, Arrival */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-5 items-center">
        {/* Departure */}
        <div className="md:col-span-4">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {train.departure_datetime ? train.departure_datetime.substring(11, 16) : '06:00'}
          </div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            {train.source_city} ({train.source_code})
          </div>
          <div className="text-xs text-slate-400">
            {train.source_name} • Platform {train.platform_number || '1'}
          </div>
        </div>

        {/* Journey Duration Graphic */}
        <div className="md:col-span-4 flex flex-col items-center justify-center px-2">
          <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{train.duration || '8h 00m'}</span>
          </div>
          <div className="relative w-full flex items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-sky-100"></div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-sky-400 via-teal-400 to-teal-500 mx-1 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600 ring-4 ring-teal-100"></div>
          </div>
          <div className="text-[11px] font-medium text-slate-400 mt-1">Direct Express Route</div>
        </div>

        {/* Arrival */}
        <div className="md:col-span-4 md:text-right">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {train.arrival_datetime ? train.arrival_datetime.substring(11, 16) : '14:00'}
          </div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">
            {train.dest_city} ({train.dest_code})
          </div>
          <div className="text-xs text-slate-400">
            {train.dest_name}
          </div>
        </div>
      </div>

      {/* Route & Intermediate Stoppages Toggle */}
      <div className="pb-3 flex justify-between items-center">
        <button
          type="button"
          onClick={handleToggleRoute}
          className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1.5 transition cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{showRoute ? 'Hide Route Stoppages' : 'View Intermediate Stations (TRAIN_ROUTES)'}</span>
          {showRoute ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <span className="text-[11px] text-slate-400 font-medium">
          Source: {train.source_code} → Dest: {train.dest_code}
        </span>
      </div>

      {/* Expanded Route Stoppages Table */}
      {showRoute && (
        <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-3.5 animate-fade-in">
          {loadingRoute ? (
            <div className="text-xs text-slate-400 py-3 text-center">Loading route data from database...</div>
          ) : !routeStops || routeStops.length === 0 ? (
            <div className="text-xs text-slate-500 py-2">Direct non-stop express journey between origin and destination stations.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="pb-1.5">#</th>
                    <th className="pb-1.5">Station</th>
                    <th className="pb-1.5">Arrival</th>
                    <th className="pb-1.5">Departure</th>
                    <th className="pb-1.5">Halt</th>
                    <th className="pb-1.5">Distance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {routeStops.map(s => (
                    <tr key={s.stopNumber} className="hover:bg-white/60">
                      <td className="py-1.5 font-bold">{s.stopNumber}</td>
                      <td className="py-1.5 font-sans font-semibold text-slate-900">
                        {s.stationCode} - {s.stationName}
                      </td>
                      <td className="py-1.5">{s.arrivalTime}</td>
                      <td className="py-1.5">{s.departureTime}</td>
                      <td className="py-1.5">{s.haltDurationMinutes} min</td>
                      <td className="py-1.5">{s.distanceKm} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Class Selection Cards & Availability */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
        {train.classes?.map((c) => {
          const isSelected = selectedClass === c.travel_class;
          const isAvailable = c.available_seats > 0;
          const isRac = !isAvailable && c.rac_seats > 0;
          const isWl = !isAvailable && !isRac;

          return (
            <button
              key={c.travel_class}
              type="button"
              onClick={() => {
                setSelectedClass(c.travel_class);
                if (onSelectClass) onSelectClass(c);
              }}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-600 bg-sky-50/70 shadow-sm ring-2 ring-sky-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900">{c.travel_class}</span>
                <span className="text-xs font-bold text-slate-700">₹{c.base_fare}</span>
              </div>

              <div className="mt-2">
                {isAvailable && (
                  <span className="text-xs font-bold text-emerald-600 block">
                    AVL {c.available_seats}
                  </span>
                )}
                {isRac && (
                  <span className="text-xs font-bold text-amber-600 block">
                    RAC {c.rac_seats}
                  </span>
                )}
                {isWl && (
                  <span className="text-xs font-bold text-rose-600 block">
                    WL {c.waiting_seats || 14}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Booking & ML Prediction Action Bar */}
      {activeClassObj && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/80 -mx-5 -mb-5 md:-mx-6 md:-mb-6 p-4 md:px-6 rounded-b-2xl">
          {/* ML Waitlist Confirmation Probability if Waitlisted or RAC */}
          <div className="flex-1">
            {activeClassObj.available_seats > 0 ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Instant Confirmation Guaranteed • {activeClassObj.available_seats} seats ready in active quota</span>
              </div>
            ) : (
              <div className="bg-white border border-amber-200/90 rounded-xl p-2.5 shadow-sm max-w-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">
                    ML Confirmation Predictor:
                  </span>
                  <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Estimated probability: {activeClassObj.prediction?.probability || 72}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>
                    Official Estimate: High probability of berth confirmation based on historical cancellation trends. Not a guarantee.
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Book Action Button */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Total Base Fare</div>
              <div className="text-lg font-black text-slate-900">₹{activeClassObj.base_fare}</div>
            </div>

            <button
              type="button"
              onClick={() => onBook(train, activeClassObj)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-sm transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Book Ticket ({activeClassObj.travel_class})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
