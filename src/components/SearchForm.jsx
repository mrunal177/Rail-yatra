import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Calendar, Users, MapPin, Search } from 'lucide-react';
import api from '../services/api.js';

export default function SearchForm({ onSearch, initialValues = {} }) {
  const [stations, setStations] = useState([]);
  const [fromStation, setFromStation] = useState(initialValues.from || 'NDLS');
  const [toStation, setToStation] = useState(initialValues.to || 'BSB');
  const [date, setDate] = useState(initialValues.date || '2026-09-25');
  const [travelClass, setTravelClass] = useState(initialValues.travelClass || '');
  const [passengers, setPassengers] = useState(initialValues.passengers || '1');

  useEffect(() => {
    async function fetchStations() {
      try {
        const res = await api.get('/trains/stations');
        if (res.data) setStations(res.data);
      } catch (err) {
        // Fallback default stations
        setStations([
          { station_id: 1, station_code: 'NDLS', station_name: 'New Delhi', city: 'Delhi' },
          { station_id: 2, station_code: 'MMCT', station_name: 'Mumbai Central', city: 'Mumbai' },
          { station_id: 3, station_code: 'SBC', station_name: 'Bengaluru City', city: 'Bengaluru' },
          { station_id: 4, station_code: 'MAS', station_name: 'Chennai Central', city: 'Chennai' },
          { station_id: 6, station_code: 'ADI', station_name: 'Ahmedabad Junction', city: 'Ahmedabad' },
          { station_id: 9, station_code: 'BSB', station_name: 'Varanasi Junction', city: 'Varanasi' }
        ]);
      }
    }
    fetchStations();
  }, []);

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        from: fromStation,
        to: toStation,
        date,
        travelClass,
        passengers
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/90 p-5 md:p-6 transition-all"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* FROM STATION */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            FROM
          </label>
          <div className="relative">
            <select
              value={fromStation}
              onChange={(e) => setFromStation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
            >
              {stations.map(st => (
                <option key={st.station_id} value={st.station_code}>
                  {st.station_code} - {st.city} ({st.station_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SWAP BUTTON */}
        <div className="md:col-span-1 flex justify-center pt-2 md:pt-4">
          <button
            type="button"
            onClick={handleSwap}
            aria-label="Swap origin and destination"
            className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-sky-600 flex items-center justify-center shadow-sm transition hover:scale-105"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* TO STATION */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            TO
          </label>
          <div className="relative">
            <select
              value={toStation}
              onChange={(e) => setToStation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            >
              {stations.map(st => (
                <option key={st.station_id} value={st.station_code}>
                  {st.station_code} - {st.city} ({st.station_name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DATE PICKER */}
        <div className="md:col-span-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            DATE
          </label>
          <input
            type="date"
            value={date}
            min="2026-09-25"
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
        </div>

        {/* PASSENGERS & CLASS */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-600" />
            PASSENGERS
          </label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          >
            <option value="1">1 Passenger</option>
            <option value="2">2 Passengers</option>
            <option value="3">3 Passengers</option>
            <option value="4">4 Passengers</option>
            <option value="5">5 Passengers</option>
            <option value="6">6 Passengers</option>
          </select>
        </div>
      </div>

      {/* QUICK CLASS FILTERS & SUBMIT BUTTON */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase">Class:</span>
          {['', 'CC', 'EC', '1A', '2A', '3A'].map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setTravelClass(cls)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                travelClass === cls
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cls === '' ? 'All Classes' : cls}
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>SEARCH TRAINS</span>
        </button>
      </div>
    </form>
  );
}
