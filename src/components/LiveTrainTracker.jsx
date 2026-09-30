import React, { useState, useEffect } from 'react';
import { Search, Train, Clock, MapPin, Gauge, ShieldCheck, RefreshCw, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import api from '../services/api.js';
import { Badge } from './Badge.jsx';

export default function LiveTrainTracker({ defaultTrain = '22436', onBookTrain }) {
  const [searchQuery, setSearchQuery] = useState(defaultTrain);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const popularTrains = [
    { num: '22436', name: 'Vande Bharat (NDLS → BSB)' },
    { num: '12951', name: 'Tejas Rajdhani (MMCT → NDLS)' },
    { num: '20901', name: 'Vande Bharat (MMCT → ADI)' },
    { num: '12002', name: 'Bhopal Shatabdi (NDLS → BPL)' },
    { num: '20607', name: 'Mysuru Vande Bharat (MAS → SBC)' }
  ];

  useEffect(() => {
    fetchLiveStatus(searchQuery);
  }, []);

  const fetchLiveStatus = async (trainNo) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/trains/live/${trainNo || '22436'}`);
      if (res.success && res.data) {
        setLiveData(res.data);
      } else {
        setError('Train not found or inactive schedule.');
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve live status telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchLiveStatus(searchQuery.trim());
    }
  };

  const handleQuickSelect = (num) => {
    setSearchQuery(num);
    fetchLiveStatus(num);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLiveStatus(searchQuery);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Live Train Running Status & Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time GPS & station logging from Indian Railways operations grid
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Train # (e.g. 22436)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            Track
          </button>
        </form>
      </div>

      {/* Quick Select Train Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500">Popular Trains:</span>
        {popularTrains.map(t => (
          <button
            key={t.num}
            onClick={() => handleQuickSelect(t.num)}
            className={`text-xs px-3 py-1 rounded-lg border transition font-medium cursor-pointer ${
              searchQuery === t.num
                ? 'bg-sky-50 border-sky-300 text-sky-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            #{t.num} {t.name.split('(')[0]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Retrieving live GPS telemetry & schedule records...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-700 text-xs">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
          <div className="font-bold">{error}</div>
          <div className="text-[11px] text-rose-500 mt-1">Try searching for Train # 22436, 12951, 20901, or 12002.</div>
        </div>
      ) : liveData && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Status Hero Card */}
          <div className="bg-gradient-to-r from-sky-50/80 via-teal-50/40 to-slate-50 border border-sky-200/80 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-sky-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 font-mono">#{liveData.trainNumber}</span>
                  <span className="text-base font-extrabold text-slate-900">{liveData.trainName}</span>
                  <Badge variant={liveData.delayMinutes === 0 ? 'success' : 'warning'}>
                    {liveData.delayNotice}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span>{liveData.source.city} ({liveData.source.code})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{liveData.destination.city} ({liveData.destination.code})</span>
                  <span>• Total: {liveData.totalDistanceKm} km</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Updated: {liveData.lastUpdatedTime}</span>
                </button>

                {onBookTrain && (
                  <button
                    onClick={() => onBookTrain(liveData.trainId)}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Book Seats
                  </button>
                )}
              </div>
            </div>

            {/* Telemetry Numbers Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
              <div className="bg-white/90 rounded-2xl p-3.5 border border-sky-100 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Current Speed</span>
                  <Gauge className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                  <span>{liveData.currentSpeedKmh}</span>
                  <span className="text-xs font-semibold text-slate-500">km/h</span>
                </div>
                <div className="text-[10px] text-teal-700 font-semibold mt-0.5">High-Speed Corridor</div>
              </div>

              <div className="bg-white/90 rounded-2xl p-3.5 border border-sky-100 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Current Station</span>
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div className="text-lg font-black text-slate-900 mt-1 truncate">
                  {liveData.currentStation?.stationName || 'En Route'}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  Platform {liveData.currentStation?.platform || '1'} • {liveData.currentStation?.stationCode}
                </div>
              </div>

              <div className="bg-white/90 rounded-2xl p-3.5 border border-sky-100 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Next Stoppage</span>
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-lg font-black text-slate-900 mt-1 truncate">
                  {liveData.nextStation?.stationName || 'Terminal'}
                </div>
                <div className="text-[11px] text-amber-700 font-semibold">
                  ETA: {liveData.nextStation?.actualArrival || liveData.nextStation?.arrivalTime} • Plat {liveData.nextStation?.platform || '1'}
                </div>
              </div>

              <div className="bg-white/90 rounded-2xl p-3.5 border border-sky-100 shadow-2xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Route Completed</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-1 flex items-baseline gap-1">
                  <span>{liveData.progressPercent}%</span>
                  <span className="text-xs font-semibold text-slate-400 font-sans">
                    ({liveData.distanceCoveredKm}/{liveData.totalDistanceKm} km)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${liveData.progressPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Route Stations Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Train className="w-4 h-4 text-sky-600" />
                <span>Station-by-Station Live Progression</span>
              </h3>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Departed</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-600 animate-pulse"></span> Current</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Upcoming</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Station</th>
                    <th className="py-2.5 px-3">Sched. Arr / Dep</th>
                    <th className="py-2.5 px-3">Actual / Estimated</th>
                    <th className="py-2.5 px-3">Halt</th>
                    <th className="py-2.5 px-3">Distance</th>
                    <th className="py-2.5 px-3">Platform</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveData.stops?.map((stop) => {
                    const isDeparted = stop.status === 'DEPARTED';
                    const isCurrent = stop.status === 'CURRENT';
                    const isUpcoming = stop.status === 'UPCOMING';

                    return (
                      <tr
                        key={stop.stopNumber}
                        className={`transition ${
                          isCurrent
                            ? 'bg-sky-50/70 font-semibold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-400">
                          {stop.stopNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {isDeparted && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                            {isCurrent && <span className="w-3 h-3 rounded-full bg-sky-600 ring-4 ring-sky-200 shrink-0 animate-ping"></span>}
                            {isUpcoming && <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0"></span>}
                            <div>
                              <div className="font-bold text-slate-900">
                                {stop.stationName} ({stop.stationCode})
                              </div>
                              <div className="text-[11px] text-slate-400">{stop.city}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {stop.arrivalTime.substring(0, 5)} / {stop.departureTime.substring(0, 5)}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">
                          <span className={stop.delayMinutes > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                            {stop.actualArrival.substring(0, 5)} / {stop.actualDeparture.substring(0, 5)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {stop.haltDurationMinutes} min
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {stop.distanceKm} km
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">
                          Plat {stop.platform}
                        </td>
                        <td className="py-3 px-3">
                          {isDeparted && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              Departed
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-sky-800 bg-sky-100 border border-sky-300 px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse"></span> Current Station
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              Upcoming
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
