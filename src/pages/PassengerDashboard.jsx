import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, ShieldCheck, Zap, AlertCircle, FileText,
  CreditCard, MessageSquare, RefreshCw, ChevronRight, TrendingUp, Ticket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../services/api.js';
import BookingCard from '../components/BookingCard.jsx';
import PredictionCard from '../components/PredictionCard.jsx';
import FeedbackModal from '../components/FeedbackModal.jsx';
import ComplaintModal from '../components/ComplaintModal.jsx';
import { Badge } from '../components/Badge.jsx';

export default function PassengerDashboard({ navigate }) {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'intelligence', 'payments', 'complaints', 'profile'
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedBookingForFeedback, setSelectedBookingForFeedback] = useState(null);
  const [selectedBookingForComplaint, setSelectedBookingForComplaint] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes, complaintsRes, intelRes] = await Promise.all([
        api.get('/bookings/my-bookings'),
        api.get('/payments/my-payments'),
        api.get('/complaints/my-complaints'),
        api.get('/analytics/passenger-intelligence')
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (paymentsRes.data) setPayments(paymentsRes.data);
      if (complaintsRes.data) setComplaints(complaintsRes.data);
      if (intelRes.insights) setIntelligence(intelRes.insights);
    } catch (err) {
      console.warn('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, reason) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`, { reason });
      if (res.success) {
        toast.success(`Booking cancelled. Refund of ₹${res.data.refundAmount} initiated.`);
        loadDashboardData();
      }
    } catch (err) {
      toast.error(err.message || 'Cancellation failed');
    }
  };

  const upcomingBooking = bookings.find(b => b.booking_status !== 'CANCELLED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">PASSENGER PORTAL</span>
            <Badge variant="teal">{intelligence?.loyaltyTier || 'Gold Commuter'}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.fullName || 'Rahul Sharma'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Email: <span className="font-semibold text-slate-700">{user?.email}</span> • Mobile: <span className="font-semibold text-slate-700">{user?.phone}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/search')}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition hover:scale-105 cursor-pointer"
          >
            + Book New Journey
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs text-slate-400 font-bold uppercase">Total Bookings</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{bookings.length}</div>
          <div className="text-[11px] text-slate-500">Lifetime reservations</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs text-slate-400 font-bold uppercase">Active Journeys</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {bookings.filter(b => b.booking_status === 'CONFIRMED' || b.booking_status === 'RAC' || b.booking_status === 'WAITLIST').length}
          </div>
          <div className="text-[11px] text-slate-500">Upcoming & active trips</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs text-slate-400 font-bold uppercase">Total Fare Paid</div>
          <div className="text-2xl font-black text-sky-700 mt-1">
            ₹{intelligence?.totalSpent || 6110}
          </div>
          <div className="text-[11px] text-slate-500">Verified settlements</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs text-slate-400 font-bold uppercase">Support Requests</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{complaints.length}</div>
          <div className="text-[11px] text-slate-500">SLA Monitored</div>
        </div>
      </div>

      {/* Next Upcoming Journey Showcase (if available) */}
      {upcomingBooking && (
        <div className="bg-gradient-to-r from-sky-50 via-teal-50/40 to-white rounded-3xl border border-sky-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              UPCOMING JOURNEY HIGHLIGHT
            </span>
            <span className="text-xs font-mono font-bold bg-white px-2.5 py-0.5 rounded-full border border-sky-200 text-sky-800">
              PNR: {upcomingBooking.pnr}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {upcomingBooking.train_name} (#{upcomingBooking.train_number})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {upcomingBooking.source_name} ({upcomingBooking.source_code}) → {upcomingBooking.dest_name} ({upcomingBooking.dest_code})
              </p>
              <div className="text-xs font-medium text-slate-500 mt-1">
                Departure: <span className="font-semibold text-slate-800">{upcomingBooking.departure_datetime || '06:00 AM'}</span> • Platform {upcomingBooking.platform_number || '1'}
              </div>
            </div>

            <div className="text-right">
              <div className={`text-sm font-extrabold ${upcomingBooking.booking_status === 'CONFIRMED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {upcomingBooking.booking_status}
              </div>
              <div className="text-xs font-bold text-slate-800">
                Coach {upcomingBooking.coach_number || 'C-4'} / Seat {upcomingBooking.seat_number || '34'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'bookings', label: 'My Bookings & PNR', icon: Ticket, count: bookings.length },
          { id: 'intelligence', label: 'Booking Intelligence & ML', icon: Zap },
          { id: 'insights', label: 'Travel Analytics & Habits', icon: TrendingUp },
          { id: 'payments', label: 'Payments & Refunds', icon: CreditCard, count: payments.length },
          { id: 'complaints', label: 'Complaints Redressal', icon: FileText, count: complaints.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'border-sky-600 text-sky-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. MY BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Reservations Yet</h3>
              <p className="text-xs text-slate-500">Book your first high-speed train journey now.</p>
              <button
                onClick={() => navigate('/search')}
                className="px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl"
              >
                Search Trains
              </button>
            </div>
          ) : (
            <div>
              {bookings.map(b => (
                <BookingCard
                  key={b.booking_id}
                  booking={b}
                  onCancel={handleCancelBooking}
                  onFeedback={(bk) => setSelectedBookingForFeedback(bk)}
                  onComplaint={(bk) => setSelectedBookingForComplaint(bk)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. BOOKING INTELLIGENCE & ML PREDICTION */}
      {activeTab === 'intelligence' && (
        <div className="space-y-6">
          <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">How Waitlist ML Prediction Works:</span> Our machine learning module continuously calculates historical cancellation probability distributions for your coach class, days until journey, and quota rush.
            Predictions are clearly classified as estimates to help passengers plan backups.
          </div>

          <PredictionCard />
        </div>
      )}

      {/* 3. TRAVEL HABITS & INTELLIGENCE */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frequent Corridors */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                Frequently Travelled Routes
              </h3>
              <div className="space-y-2 text-xs">
                {intelligence?.frequentRoutes?.map((r, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-800 font-mono">{r.route}</span>
                    <span className="text-slate-500">{r.count} journeys</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Class Preference */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Preferred Travel Class
              </h3>
              <div className="space-y-2 text-xs">
                {intelligence?.preferredClasses?.map((c, i) => (
                  <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-800">{c.travelClass}</span>
                    <span className="text-slate-500">{c.count} bookings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAYMENTS & REFUNDS */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-4">Payment & Refund Ledger</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-3 font-bold">Transaction Reference</th>
                    <th className="p-3 font-bold">PNR</th>
                    <th className="p-3 font-bold">Gateway</th>
                    <th className="p-3 font-bold">Amount</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Refund Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {payments.map(p => (
                    <tr key={p.payment_id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{p.transaction_reference}</td>
                      <td className="p-3 text-sky-700">{p.pnr || 'PNR-LOCKED'}</td>
                      <td className="p-3 font-sans font-semibold text-slate-600">{p.payment_gateway}</td>
                      <td className="p-3 font-bold text-slate-900">₹{p.amount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.payment_status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.payment_status === 'REFUNDED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-500 text-[11px]">
                        {p.refund ? `Refunded ₹${p.refund.refund_amount} (${p.refund.refund_reference})` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900">Your Registered Grievances</h3>
            <button
              onClick={() => setSelectedBookingForComplaint({})}
              className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              + File New Grievance
            </button>
          </div>

          {complaints.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No grievances filed.
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map(c => (
                <div key={c.complaint_id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-900">{c.subject}</span>
                    <Badge variant={c.status === 'RESOLVED' ? 'success' : 'warning'}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{c.description}</p>
                  {c.resolution_remarks && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-xs text-emerald-900">
                      <span className="font-bold">Staff Resolution:</span> {c.resolution_remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <FeedbackModal
        isOpen={Boolean(selectedBookingForFeedback)}
        booking={selectedBookingForFeedback}
        onClose={() => setSelectedBookingForFeedback(null)}
        onSuccess={() => {
          setSelectedBookingForFeedback(null);
          loadDashboardData();
        }}
      />

      <ComplaintModal
        isOpen={Boolean(selectedBookingForComplaint)}
        booking={selectedBookingForComplaint}
        onClose={() => setSelectedBookingForComplaint(null)}
        onSuccess={() => {
          setSelectedBookingForComplaint(null);
          loadDashboardData();
        }}
      />
    </div>
  );
}
