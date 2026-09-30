import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, RefreshCw, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import SearchForm from '../components/SearchForm.jsx';
import TrainCard from '../components/TrainCard.jsx';
import BookingModal from '../components/BookingModal.jsx';
import { Badge } from '../components/Badge.jsx';
import api from '../services/api.js';

export default function TrainSearchPage({ initialParams = {}, navigate }) {
  const [searchParams, setSearchParams] = useState({
    from: initialParams.from || 'NDLS',
    to: initialParams.to || 'BSB',
    date: initialParams.date || '2026-09-25',
    travelClass: initialParams.travelClass || '',
    passengers: initialParams.passengers || '1'
  });

  const [trains, setTrains] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const fetchSearchResults = async (params) => {
    setLoading(true);
    try {
      const res = await api.get('/trains/search', {
        params: {
          from: params.from,
          to: params.to,
          date: params.date,
          travelClass: params.travelClass
        }
      });

      if (res.data) {
        setTrains(res.data);

        // Fetch smart alternatives if top train is waitlisted or limited
        if (res.data.length > 0) {
          const altRes = await api.get('/trains/alternatives', {
            params: { trainId: res.data[0].train_id }
          });
          if (altRes.alternatives) setAlternatives(altRes.alternatives);
        }
      }
    } catch (err) {
      console.warn('Search query error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults(searchParams);
  }, []);

  const handleSearchSubmit = (newParams) => {
    setSearchParams(newParams);
    fetchSearchResults(newParams);
  };

  const handleBookTrigger = (train, classObj) => {
    setSelectedTrain(train);
    setSelectedClass(classObj);
    setBookingModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Search Filter Bar */}
      <div>
        <SearchForm onSearch={handleSearchSubmit} initialValues={searchParams} />
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Available Trains ({trains.length})
          </h1>
          <p className="text-xs text-slate-500">
            Route: <span className="font-bold text-slate-800">{searchParams.from}</span> →{' '}
            <span className="font-bold text-slate-800">{searchParams.to}</span> on {searchParams.date}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="teal">Real-Time Inventory</Badge>
          <Badge variant="primary">ML Confirmation Enabled</Badge>
        </div>
      </div>

      {/* Smart Alternative Train Suggestions Banner */}
      {alternatives.length > 0 && (
        <div className="bg-sky-50/70 border border-sky-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-sky-600" />
            <span>Smart Alternative Suggestions (Higher Confirmation Probability)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alternatives.map((alt) => (
              <div key={alt.train_id} className="bg-white border border-sky-100 rounded-xl p-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block font-mono">
                      #{alt.train_number} {alt.train_name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Departs {alt.departure_time.substring(11, 16) || '17:00'} ({alt.source_code} → {alt.dest_code})
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-teal-700 font-semibold mt-2">
                  ✓ {alt.advantageReason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Train Results List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Querying Train Master & Inventory Tables...</p>
        </div>
      ) : trains.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Direct Trains Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for broader corridors such as NDLS (New Delhi), MMCT (Mumbai Central), or BSB (Varanasi).
          </p>
        </div>
      ) : (
        <div>
          {trains.map((train) => (
            <TrainCard
              key={train.train_id}
              train={train}
              onBook={handleBookTrigger}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedTrain && selectedClass && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          train={selectedTrain}
          classInfo={selectedClass}
          onSuccess={() => {
            fetchSearchResults(searchParams);
          }}
        />
      )}
    </div>
  );
}
