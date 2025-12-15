import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AIChat from './components/AIChat';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import ErrorBoundary from './components/ErrorBoundary';
import { User, UserRole } from './types';
import { BeforeInstallPromptEvent } from './types/events';
import { db } from './services/database';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ShieldAlert, Edit3, Eye, Loader2 } from 'lucide-react';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Events = lazy(() => import('./pages/Events'));
const Services = lazy(() => import('./pages/Services'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const Profile = lazy(() => import('./pages/Profile'));
const SocialHub = lazy(() => import('./pages/SocialHub'));
const More = lazy(() => import('./pages/More'));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-dahab-teal animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const { settings, isEditing, toggleEditing } = useSettings();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Detect dark background to switch text color
  const isDarkBackground = settings.backgroundStyle.includes('#0f172a') || settings.backgroundStyle.includes('#000000');
  const textColorClass = isDarkBackground ? 'text-gray-100' : 'text-gray-800';

  // Check for session in localstorage on load
  useEffect(() => {
    const savedUser = localStorage.getItem('dahab_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('dahab_user');
      }
    }
  }, []);

  // Handle PWA Install Prompt (Android/Desktop)
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setInstallPrompt(null);
      }
    } catch (error) {
      console.error('Install prompt error:', error);
    }
  };

  // Poll for user status updates (for verification)
  useEffect(() => {
    const userId = user?.id;
    const isPendingProvider = user?.role === UserRole.PROVIDER && (user?.providerStatus === 'pending' || user?.providerStatus === 'payment_review');

    if (userId && isPendingProvider) {
      const interval = setInterval(async () => {
        try {
          const updatedUser = await db.getUser(userId);
          if (updatedUser && updatedUser.providerStatus !== user?.providerStatus) {
            setUser(updatedUser);
            localStorage.setItem('dahab_user', JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user?.id, user?.role, user?.providerStatus]);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('dahab_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('dahab_user');
  };

  const handleToggleSave = async (eventId: string) => {
    if (!user) {
      alert("Please login to save events.");
      return;
    }

    const isSaved = user.savedEventIds?.includes(eventId);
    const newSavedIds = isSaved
      ? user.savedEventIds.filter(id => id !== eventId)
      : [...(user.savedEventIds || []), eventId];

    const updatedUser = { ...user, savedEventIds: newSavedIds };
    setUser(updatedUser);
    localStorage.setItem('dahab_user', JSON.stringify(updatedUser));

    await db.toggleSavedEvent(user.id, eventId);
  };

  return (
    <HashRouter>
      <div
        className={`min-h-screen pb-20 pt-20 pt-safe ${textColorClass} transition-all duration-500 ease-in-out`}
        style={{
          backgroundImage: settings.backgroundStyle,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <Navbar
          userRole={user?.role || null}
          onLogout={handleLogout}
          installPrompt={installPrompt}
          onInstall={handleInstallClick}
        />

        {user?.role === UserRole.PROVIDER && user?.providerStatus === 'pending' && (
          <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-bold shadow-md flex items-center justify-center gap-2">
            <ShieldAlert size={16} />
            <span>Your provider account is pending admin verification.</span>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<Events user={user} onToggleSave={handleToggleSave} />} />
                <Route path="/services" element={<Services user={user} />} />
                <Route path="/community" element={<SocialHub user={user} />} />
                <Route path="/more" element={<More />} />

                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/book/:type/:id" element={user ? <BookingPage user={user} /> : <Navigate to="/login" />} />

                <Route path="/profile" element={user ? <Profile user={user} onToggleSave={handleToggleSave} onLogout={handleLogout} /> : <Navigate to="/login" />} />

                <Route
                  path="/provider-dashboard"
                  element={
                    user?.role === UserRole.PROVIDER
                      ? <ProviderDashboard onLogout={handleLogout} />
                      : <Navigate to="/login" />
                  }
                />

                <Route
                  path="/admin"
                  element={
                    user?.role === UserRole.ADMIN
                      ? <AdminDashboard onLogout={handleLogout} />
                      : <Navigate to="/login" />
                  }
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>

        <AIChat />
        <IOSInstallPrompt />

        {user?.role === UserRole.ADMIN && (
          <button
            onClick={toggleEditing}
            className={`fixed bottom-24 right-4 md:right-10 p-4 rounded-full shadow-xl z-50 transition-all transform hover:scale-105 ${isEditing ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white'}`}
            title={isEditing ? "Exit Edit Mode" : "Enter Edit Mode"}
            aria-label={isEditing ? "Exit Edit Mode" : "Enter Edit Mode"}
          >
            {isEditing ? <Eye size={24} /> : <Edit3 size={24} />}
          </button>
        )}
      </div>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </ErrorBoundary>
  );
};

export default App;
