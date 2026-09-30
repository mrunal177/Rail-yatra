import React, { useState } from 'react';
import { X, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ComplaintModal({ booking, isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const [category, setCategory] = useState('CLEANLINESS');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [subject, setSubject] = useState('Bio-toilet hygiene required');
  const [description, setDescription] = useState('Bio-toilet in coach requires prompt sanitation and water check.');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !description) {
      toast.error('Please enter subject and description');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/complaints', {
        bookingId: booking?.booking_id || null,
        trainId: booking?.train_id || null,
        complaintCategory: category,
        urgencyLevel: urgency,
        subject,
        description
      });

      if (res.success) {
        setSubmitted(true);
        toast.success('Complaint logged into railway grievance database');
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-lg font-black text-slate-900">Passenger Grievance Redressal</h3>
            <p className="text-xs text-slate-500">
              {booking ? `Linked to PNR: ${booking.pnr}` : 'Railway Operations Issue'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Grievance Registered</h4>
              <p className="text-xs text-slate-500">
                Your ticket has been assigned to railway operations staff for rapid resolution.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="CLEANLINESS">Cleanliness & Hygiene</option>
                  <option value="DELAY">Train Delay & Punctuality</option>
                  <option value="FOOD_QUALITY">Food Quality & Pantry</option>
                  <option value="AC_ELECTRICAL">AC / Electrical / Charging Sockets</option>
                  <option value="STAFF_BEHAVIOR">Staff & TTE Conduct</option>
                  <option value="TICKETING_REFUND">Ticketing & Refund Queries</option>
                  <option value="SECURITY">Passenger Security</option>
                  <option value="OTHER">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="LOW">Low - General query</option>
                  <option value="MEDIUM">Medium - Inconvenience</option>
                  <option value="HIGH">High - Urgent attention needed</option>
                  <option value="CRITICAL">Critical - Medical / Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Details</label>
                <textarea
                  rows="3"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Registering Grievance...' : 'Submit Grievance'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
