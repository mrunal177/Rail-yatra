import React, { useState } from 'react';
import { X, Star, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function FeedbackModal({ booking, isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const [cleanliness, setCleanliness] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [food, setFood] = useState(4);
  const [overall, setOverall] = useState(5);
  const [comment, setComment] = useState('Outstanding journey! The Vande Bharat ride was exceptionally smooth, punctual, and the onboard crew was courteous.');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment) {
      toast.error('Please share your journey experience');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/feedback', {
        trainId: booking.train_id || 1,
        bookingId: booking.booking_id,
        cleanlinessRating: cleanliness,
        punctualityRating: punctuality,
        foodRating: food,
        overallRating: overall,
        comment
      });

      if (res.success) {
        setResult(res.data);
        toast.success('Feedback analyzed by ML Sentiment Engine!');
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (value, onChange) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition cursor-pointer"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-lg font-black text-slate-900">Passenger Trip Feedback</h3>
            <p className="text-xs text-slate-500">
              PNR: {booking.pnr} • Train #{booking.train_number}
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
        <div className="p-6 overflow-y-auto space-y-5">
          {result ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Thank you for your feedback!</h4>
              
              {/* ML Sentiment Analysis Output */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-700">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>ML Sentiment Analysis Result</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-600">Sentiment:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    result.sentiment_label === 'POSITIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : result.sentiment_label === 'NEGATIVE'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {result.sentiment_label} (Score: {result.sentiment_score})
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-600">Category Detected:</span>
                  <span className="text-slate-900 font-bold">{result.detected_category}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl transition"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cleanliness</label>
                  {renderStars(cleanliness, setCleanliness)}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Punctuality</label>
                  {renderStars(punctuality, setPunctuality)}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Food Quality</label>
                  {renderStars(food, setFood)}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Overall Trip</label>
                  {renderStars(overall, setOverall)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Experience (Analyzed with Sentiment Engine)
                </label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details regarding coach hygiene, staff behavior, food quality..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Analyzing Sentiment...' : 'Submit Feedback'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
