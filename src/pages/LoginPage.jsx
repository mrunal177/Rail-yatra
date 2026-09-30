import React, { useState } from 'react';
import { Train, LogIn, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function LoginPage({ navigate }) {
  const { login, quickDemoLogin } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('rahul.sharma@example.com');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user.fullName}!`);
      if (res.user.roleName === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    const user = await quickDemoLogin(role);
    toast.success(`Demo sign-in as: ${user.fullName} (${role})`);
    if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Train className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to RailConnect
          </h2>
          <p className="text-xs text-slate-500">
            Access bookings, PNR status, and ML waitlist estimates.
          </p>
        </div>

        {/* 1-Click Evaluation Shortcuts */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
          <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
            Quick Demo Shortcuts (No typing needed)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('PASSENGER')}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition"
            >
              👤 Passenger
              <div className="text-[10px] text-slate-400 font-normal">Rahul Sharma</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition"
            >
              🛡️ Admin
              <div className="text-[10px] text-slate-400 font-normal">Chief Controller</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-bold text-sky-600 hover:underline"
          >
            Create one now
          </button>
        </div>
      </div>
    </div>
  );
}
