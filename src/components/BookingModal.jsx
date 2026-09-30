import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Building, CheckCircle2, Zap, AlertTriangle } from 'lucide-react';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function BookingModal({ train, classInfo, isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const [passengerName, setPassengerName] = useState('Rahul Sharma');
  const [passengerAge, setPassengerAge] = useState('28');
  const [passengerGender, setPassengerGender] = useState('MALE');
  const [berthPreference, setBerthPreference] = useState('LOWER');
  const [paymentGateway, setPaymentGateway] = useState('UPI');
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  if (!isOpen || !train || !classInfo) return null;

  const baseFare = Number(classInfo.base_fare) || 1500;
  const gst = Math.round(baseFare * 0.05);
  const totalAmount = baseFare + gst;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passengerName || !passengerAge) {
      toast.error('Please enter passenger name and age');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        scheduleId: train.schedule_id,
        sourceStationId: train.source_station_id,
        destinationStationId: train.destination_station_id,
        travelClass: classInfo.travel_class,
        passengerName,
        passengerAge: Number(passengerAge),
        passengerGender,
        berthPreference,
        paymentGateway
      });

      if (res.success) {
        setBookingResult(res.data);
        toast.success(`Booking completed! PNR: ${res.data.pnr}`);
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to complete booking transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {bookingResult ? 'Reservation Confirmed' : 'Confirm Railway Reservation'}
            </h2>
            <div className="text-xs text-slate-500">
              {train.train_name} (#{train.train_number}) • Class: <span className="font-bold text-sky-600">{classInfo.travel_class}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {bookingResult ? (
            /* Booking Confirmation Success Card */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Confirmed & Active Itinerary
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  PNR: {bookingResult.pnr}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Ticket has been issued and confirmed across our express network.
                </p>
              </div>

              {/* Status & Berth Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Booking Status</div>
                  <div className={`text-base font-extrabold ${
                    bookingResult.bookingStatus === 'CONFIRMED' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {bookingResult.bookingStatus}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Coach & Berth</div>
                  <div className="text-base font-extrabold text-slate-800">
                    {bookingResult.coachNumber ? `${bookingResult.coachNumber} / Seat ${bookingResult.seatNumber}` : 'Waitlisted (Chart Pending)'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Passenger</div>
                  <div className="text-sm font-bold text-slate-800">{passengerName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Total Paid</div>
                  <div className="text-sm font-bold text-slate-800">₹{bookingResult.totalAmount}</div>
                </div>
              </div>

              {/* ML Waitlist Confirmation Probability if Waitlisted */}
              {bookingResult.bookingStatus !== 'CONFIRMED' && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-left">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <Zap className="w-4 h-4 text-amber-600" />
                    ML Confirmation Predictor
                  </div>
                  <div className="text-sm font-extrabold text-teal-800 mt-1">
                    Estimated confirmation probability: {bookingResult.estimatedProbability || 72}%
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">Notice:</span> Probabilistic estimate based on historical cancellation rates for {classInfo.travel_class}. Not a legal guarantee.
                  </p>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition"
              >
                Done
              </button>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Journey Route Summary */}
              <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-3.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                <div>
                  <span className="text-slate-400">Route:</span> {train.source_code} → {train.dest_code}
                </div>
                <div>
                  <span className="text-slate-400">Date:</span> {train.journey_date || '2026-09-25'}
                </div>
                <div>
                  <span className="text-slate-400">Status:</span>{' '}
                  <span className={classInfo.available_seats > 0 ? 'text-emerald-600' : 'text-amber-600'}>
                    {classInfo.available_seats > 0 ? `AVL ${classInfo.available_seats}` : `WL ${classInfo.waiting_seats || 14}`}
                  </span>
                </div>
              </div>

              {/* Passenger Inputs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Passenger Information
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (As per Govt. Photo ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      required
                      value={passengerAge}
                      onChange={(e) => setPassengerAge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={passengerGender}
                      onChange={(e) => setPassengerGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Berth Preference</label>
                  <select
                    value={berthPreference}
                    onChange={(e) => setBerthPreference(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="LOWER">Lower Berth</option>
                    <option value="MIDDLE">Middle Berth</option>
                    <option value="UPPER">Upper Berth</option>
                    <option value="SIDE_LOWER">Side Lower</option>
                    <option value="SIDE_UPPER">Side Upper</option>
                    <option value="WINDOW">Window Seat</option>
                    <option value="NO_PREF">No Preference</option>
                  </select>
                </div>
              </div>

              {/* Payment Gateway Options */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Payment Mode
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                    { id: 'CARD', label: 'Debit/Credit Card', icon: CreditCard },
                    { id: 'NET_BANKING', label: 'Net Banking', icon: Building }
                  ].map(method => {
                    const Icon = method.icon;
                    const isSelected = paymentGateway === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentGateway(method.id)}
                        className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/70 text-sky-900 ring-2 ring-sky-500/20'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Base Ticket Fare ({classInfo.travel_class}):</span>
                  <span className="font-semibold text-slate-800">₹{baseFare}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Service Charge (5%):</span>
                  <span className="font-semibold text-slate-800">₹{gst}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-sky-700">₹{totalAmount}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md shadow-sky-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{submitting ? 'Confirming Reservation & Allocation...' : `Pay ₹${totalAmount} & Confirm Seat`}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
