import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import RailBot from './components/RailBot.jsx';
import DBMSViewerModal from './components/DBMSViewerModal.jsx';
import LandingPage from './pages/LandingPage.jsx';
import TrainSearchPage from './pages/TrainSearchPage.jsx';
import LiveStatusPage from './pages/LiveStatusPage.jsx';
import PassengerDashboard from './pages/PassengerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

function MainRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState({});
  const [dbmsModalOpen, setDbmsModalOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      parseUrlParams();
    };

    // Hidden shortcut for examiners/developers: Ctrl+Shift+D opens schema viewer
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDbmsModalOpen(prev => !prev);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    parseUrlParams();

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const parseUrlParams = () => {
    const query = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of query.entries()) {
      params[key] = value;
    }
    setSearchParams(params);
  };

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path.split('?')[0]);
    parseUrlParams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/search':
        return <TrainSearchPage initialParams={searchParams} navigate={navigate} />;
      case '/live-status':
        return <LiveStatusPage navigate={navigate} />;
      case '/dashboard':
        return <PassengerDashboard navigate={navigate} />;
      case '/admin':
        return <AdminDashboard onOpenDBMS={() => setDbmsModalOpen(true)} />;
      case '/login':
        return <LoginPage navigate={navigate} />;
      case '/register':
        return <RegisterPage navigate={navigate} />;
      case '/':
      default:
        return (
          <LandingPage
            navigate={navigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentRoute={currentPath}
        navigate={navigate}
        onOpenDBMS={() => setDbmsModalOpen(true)}
      />

      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      <Footer
        navigate={navigate}
      />

      {/* Intelligent AI Railway Operations Assistant */}
      <RailBot onNavigate={navigate} />

      {/* Hidden Technical Schema Inspector (Ctrl+Shift+D or Internal Admin) */}
      <DBMSViewerModal
        isOpen={dbmsModalOpen}
        onClose={() => setDbmsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ToastProvider>
  );
}
