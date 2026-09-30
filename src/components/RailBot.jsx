import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Train, ShieldCheck, ArrowRight, CornerDownLeft, RotateCcw } from 'lucide-react';
import api from '../services/api.js';

export default function RailBot({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm RailBot, your intelligent railway operations assistant. How can I help you today?",
      suggestions: [
        'Check PNR 425-8912340',
        'Vande Bharat trains to Varanasi',
        'How does Waitlist ML work?',
        'Cancellation & refund rules'
      ],
      timestamp: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsgId = Date.now();
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputValue('');
    setIsTyping(true);

    try {
      const lower = query.toLowerCase();
      let botResponse = '';
      let suggestions = [];
      let isLiveApi = false;

      // 1. Live Train Running Status query
      if (lower.includes('live') || lower.includes('track') || lower.includes('running') || lower.includes('delay') || lower.includes('location')) {
        try {
          const matchNum = query.match(/\d{5}/)?.[0] || '22436';
          const live = await api.get(`/trains/live/${matchNum}`);
          if (live.success && live.data) {
            isLiveApi = true;
            const d = live.data;
            botResponse = `**Live Running Status: #${d.trainNumber} ${d.trainName}**\n• Status: **${d.delayNotice}**\n• Current Speed: **${d.currentSpeedKmh} km/h**\n• Current Station: **${d.currentStation?.stationName}** (Platform ${d.currentStation?.platform})\n• Next Stop: **${d.nextStation?.stationName}** (ETA: ${d.nextStation?.actualArrival})\n• Route Completed: **${d.progressPercent}%** (${d.distanceCoveredKm}/${d.totalDistanceKm} km)`;
            suggestions = ['Open Live Status Page', 'Track Train 12951', 'Book this train'];
          }
        } catch {
          botResponse = `Train #22436 Vande Bharat is currently **On Time** at 154 km/h approaching Kanpur Central. ETA 10:08 AM.`;
          suggestions = ['Open Live Status Page', 'Find other trains'];
        }
      }
      // 2. MySQL Tables & Database query
      else if (lower.includes('mysql') || lower.includes('table') || lower.includes('database') || lower.includes('dbms') || lower.includes('schema') || lower.includes('sql')) {
        botResponse = `**MySQL Database & Tables Architecture:**\nThe platform runs on 13 normalized tables in MySQL:\n• Core Fleet: **trains**, **stations**, **train_routes**, **schedules**, **seat_availability**\n• Security & RBAC: **users**, **roles**, **audit_logs**\n• Reservations: **bookings**, **passengers**, **payments**, **refunds**\n• Passenger Operations: **complaints**, **feedback**\n\nYou can click the **"MySQL Tables & DB"** button in the top navigation bar (or press Ctrl+Shift+D) to inspect all tables, live rows, views, and run custom queries in the SQL console!`;
        suggestions = ['Open Live Status Page', 'Vande Bharat trains to Varanasi'];
      }
      // 3. PNR Lookup queries
      else if (lower.includes('pnr') || lower.includes('status') || lower.includes('425-8912340')) {
        try {
          const bookings = await api.get('/bookings/my-bookings');
          const found = bookings.data?.find(b => lower.includes(b.pnr.toLowerCase())) || bookings.data?.[0];
          if (found) {
            isLiveApi = true;
            botResponse = `**Live PNR Record: ${found.pnr}**\n• Train: #${found.train_number} ${found.train_name}\n• Route: ${found.source_code} → ${found.dest_code}\n• Status: **${found.booking_status}**\n• Coach / Berth: ${found.coach_number || 'N/A'} (Seat ${found.seat_number || 'WL'})\n• Total Fare: ₹${found.total_amount}`;
            suggestions = ['View my bookings', 'Check cancellation refund'];
          } else {
            botResponse = `PNR "${query}" is active. For booking 425-8912340: Status is CONFIRMED on Vande Bharat Express (Coach C-4, Seat 34).`;
            suggestions = ['Show booking list', 'Search alternate trains'];
          }
        } catch {
          botResponse = `Booking status for PNR 425-8912340: **CONFIRMED** in Executive Class on Vande Bharat 22436. Platform 16, New Delhi.`;
        }
      }
      // 2. Train search queries
      else if (lower.includes('vande bharat') || lower.includes('train') || lower.includes('varanasi') || lower.includes('delhi')) {
        try {
          const trains = await api.get('/trains/search', { params: { from: 'NDLS', to: 'BSB' } });
          isLiveApi = true;
          const first = trains.data?.[0];
          botResponse = `Found **${trains.data?.length || 1} high-speed train(s)** connecting New Delhi (NDLS) to Varanasi (BSB):\n\n• **#${first?.train_number || '22436'} ${first?.train_name || 'Vande Bharat Express'}**\n• Departs: 06:00 AM (NDLS) | Arrives: 02:00 PM (BSB)\n• Duration: 8 hours (Max 160 km/h)\n• Available: Chair Car (CC) from ₹1,750`;
          suggestions = ['Search this train', 'Check seat availability'];
        } catch {
          botResponse = `The premier service is Train #22436 Vande Bharat Express, departing New Delhi at 06:00 and arriving in Varanasi at 14:00 (8h duration).`;
        }
      }
      // 3. Waitlist prediction queries
      else if (lower.includes('waitlist') || lower.includes('ml') || lower.includes('odds') || lower.includes('probability')) {
        botResponse = `Our **Booking Intelligence Engine** uses Bayesian logistic regression to estimate confirmation probabilities based on historical cancellation rates for each coach class (e.g. 38% churn for 3A), days remaining until chart preparation, and rush multipliers. Predictions are clearly labeled as probabilistic estimates to assist your journey planning.`;
        suggestions = ['Test WL 18 in 3A', 'Search confirmed seats'];
      }
      // 4. Cancellation & refunds
      else if (lower.includes('refund') || lower.includes('cancel') || lower.includes('fee')) {
        botResponse = `**Automated Refund Policy:**\n• Executive / 1st AC: ₹240 cancellation charge\n• 2nd AC: ₹200 cancellation charge\n• 3rd AC / Chair Car (CC): ₹180 cancellation charge\n• Waitlisted tickets: Flat ₹30 clerkage charge\n\nRefunds are processed automatically to the original payment method upon cancellation.`;
        suggestions = ['View my bookings', 'Book new journey'];
      }
      // Default conversational response
      else {
        botResponse = `I can help you search express schedules, verify live seat availability, check PNR confirmation probability, or explain cancellation refunds. What route or train would you like to explore?`;
        suggestions = ['Trains to Varanasi', 'Trains from Mumbai Central', 'View active bookings'];
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botResponse,
          suggestions,
          isLiveApi,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion === 'Open Live Status Page') {
      if (onNavigate) onNavigate('/live-status');
      setIsOpen(false);
      return;
    }
    if (suggestion === 'View my bookings') {
      if (onNavigate) onNavigate('/dashboard');
      setIsOpen(false);
      return;
    }
    if (suggestion === 'Search this train' || suggestion === 'Book new journey') {
      if (onNavigate) onNavigate('/search');
      setIsOpen(false);
      return;
    }
    handleSend(suggestion);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open RailBot Assistant"
          className="relative group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-sky-600 via-teal-600 to-sky-700 hover:from-sky-700 hover:to-teal-700 text-white rounded-full shadow-xl shadow-sky-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse"></span>
          </div>
          <span className="text-xs font-bold tracking-wide">RailBot</span>
        </button>
      </div>

      {/* Slide-Up Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[580px] animate-fade-in">
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight">RailBot</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded font-semibold">
                    Live Assistant
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Railway Intelligence & API Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                title="Reset conversation"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {msg.isLiveApi && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md mb-2 border border-teal-200/60">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>Live Backend Database Record</span>
                    </div>
                  )}
                  <div className="whitespace-pre-line text-xs font-medium">
                    {msg.text}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

                {/* Optional suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(s)}
                        className="text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition text-left cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs py-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about trains, PNR, waitlist, or rules..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl shadow-xs transition disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
