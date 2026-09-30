import React, { useState } from 'react';
import { Train, User, Database, LogOut, Menu, X, ChevronDown, Activity, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Navbar({ currentRoute, navigate, onOpenDBMS }) {
  const { user, isAdmin, isStaff, logout, quickDemoLogin } = useAuth();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleRoleSwitch = async (role) => {
    setRoleDropdownOpen(false);
    const switchedUser = await quickDemoLogin(role);
    toast.success(`Switched active view to: ${switchedUser.fullName} (${role})`);
    if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const navLinks = [
    { label: 'Find Trains', route: '/search' },
    { label: 'Live Train Status', route: '/live-status', isLive: true },
    { label: 'My Bookings', route: '/dashboard' },
    { label: 'Fleet & Operations', route: '/admin', adminOnly: true }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-teal-600 to-sky-700 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform">
            <Train className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                RAILCONNECT
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                SYSTEMS
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 tracking-wide">
              High-Speed Passenger Rail Network
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            if (item.adminOnly && !isAdmin && !isStaff) return null;
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => navigate(item.route)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.isLive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side Controls */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Direct MySQL Tables & DBMS Inspector Button */}
          <button
            onClick={onOpenDBMS}
            title="Inspect MySQL Tables, Views, Triggers, & SQL Query Console"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-teal-700" />
            <span>MySQL Tables & DB</span>
          </button>

          {/* Executive Portal Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Portal: <strong className="text-slate-900">{user?.roleName || 'PASSENGER'}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs animate-fade-in">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Portal
                </div>
                <button
                  onClick={() => handleRoleSwitch('PASSENGER')}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800">Passenger Portal</span>
                  {user?.roleName === 'PASSENGER' && (
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </button>
                <button
                  onClick={() => handleRoleSwitch('ADMIN')}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800">Fleet Operations Admin</span>
                  {user?.roleName === 'ADMIN' && (
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </button>
                <button
                  onClick={() => handleRoleSwitch('STAFF')}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800">Station Superintendent</span>
                  {user?.roleName === 'STAFF' && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span className="max-w-[120px] truncate">{user.fullName}</span>
              </button>
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-sky-600 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={onOpenDBMS}
            className="p-2 text-teal-700 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold"
          >
            DB
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3">
          <button
            onClick={() => { navigate('/search'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-bold text-slate-800"
          >
            Find Express Trains
          </button>
          <button
            onClick={() => { navigate('/live-status'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-bold text-emerald-700 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Train Status</span>
          </button>
          <button
            onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-bold text-slate-800"
          >
            My Bookings & Journeys
          </button>
          <button
            onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-bold text-slate-800"
          >
            Fleet Operations Hub
          </button>
          <button
            onClick={() => { onOpenDBMS(); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-sm font-bold text-teal-700"
          >
            Open MySQL Database & Tables
          </button>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">{user?.fullName}</span>
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); }}
              className="text-xs font-bold text-rose-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
