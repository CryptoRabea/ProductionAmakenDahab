import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import Services from './pages/Services';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import BookingPage from './pages/BookingPage';
import Profile from './pages/Profile';
import SocialHub from './pages/SocialHub';
import More from './pages/More';
import ProviderDashboard from './pages/ProviderDashboard';
import AIChat from './components/AIChat';
import IOSInstallPrompt from './components/IOSInstallPrompt';
import { User, UserRole } from './types';
import { db } from './services/mockDatabase';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ShieldAlert, Edit3, Eye } from 'lucide-react';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const { settings, isEditing, toggleEditing } = useSettings();
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Detect dark background to switch text color
  // Deep Ocean preset uses #0f172a
  const isDarkBackground = settings.backgroundStyle.includes('#0f172a') || settings.backgroundStyle.includes('#000000');
  const textColorClass = isDarkBackground ? 'text-gray-100' : 'text-gray-800';

  // Check for session in localstorage on load
  useEffect(() => {
    const savedUser = localStorage.getItem('dahab_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle PWA Install Prompt (Android/Desktop)
  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setInstallPrompt(null);
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
          // Only update if status has actually changed to avoid loop
          if (updatedUser && updatedUser.providerStatus !== user?.providerStatus) {
            setUser(updatedUser);
            localStorage.setItem('dahab_user', JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 5000); // Check every 5 seconds
      
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
    
    // Optimistic update
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

        {/* Pending Verification Banner */}
        {user?.role === UserRole.PROVIDER && user?.providerStatus === 'pending' && (
          <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-bold shadow-md flex items-center justify-center gap-2">
            <ShieldAlert size={16} />
            <span>Your provider account is pending admin verification.</span>
          </div>
        )}
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        </main>

        <AIChat />
        <IOSInstallPrompt />

        {/* Admin Edit Mode Toggle */}
        {user?.role === UserRole.ADMIN && (
          <button 
            onClick={toggleEditing}
            className={`fixed bottom-24 right-4 md:right-10 p-4 rounded-full shadow-xl z-50 transition-all transform hover:scale-105 ${isEditing ? 'bg-orange-500 text-white' : 'bg-gray-900 text-white'}`}
            title={isEditing ? "Exit Edit Mode" : "Enter Edit Mode"}
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
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
