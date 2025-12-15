import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Car, User, LayoutDashboard, LogOut, Users, Menu, Briefcase, Download, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';
import { useSettings } from '../contexts/SettingsContext';

interface NavbarProps {
  userRole: UserRole | null;
  onLogout: () => void;
  installPrompt: any;
  onInstall: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userRole, onLogout, installPrompt, onInstall }) => {
  const location = useLocation();
  const { settings } = useSettings();
  const [logoError, setLogoError] = useState(false);

  const isActive = (path: string) => location.pathname === path ? "text-dahab-teal font-bold" : "text-gray-500 hover:text-dahab-teal";

  // Brand Logo Logic
  const BrandLogo = ({ className = "h-10" }: { className?: string }) => {
    if (settings.logoUrl && !logoError) {
      return (
        <img 
          src={settings.logoUrl} 
          alt={settings.appName} 
          className={`${className} w-auto object-contain`} 
          onError={() => setLogoError(true)}
        />
      );
    }
    return (
      <span className="font-bold text-xl text-dahab-teal tracking-tight">
        {settings.appName}
      </span>
    );
  };

  // Mobile Top Bar
  const MobileTopBar = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 px-4 py-3 flex justify-between items-center pt-safe transition-all">
       <Link to="/" className="flex items-center gap-2">
          <BrandLogo className="h-8" />
       </Link>
       
       <div className="flex items-center gap-2">
         {/* Install Button */}
         {installPrompt && (
            <button onClick={onInstall} className="text-gray-900 bg-gray-100 p-2 rounded-full mr-1">
              <Download size={16} />
            </button>
         )}

         {/* Auth Actions */}
         {!userRole ? (
           <div className="flex gap-2">
             <Link to="/login" className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50">Login</Link>
             <Link to="/login?mode=signup" className="px-3 py-1.5 text-xs font-bold bg-dahab-teal text-white rounded-full hover:bg-teal-700 shadow-sm">Sign Up</Link>
           </div>
         ) : (
           <div className="flex gap-2 items-center">
             <Link to="/profile" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-dahab-teal border border-gray-200">
               <User size={16} />
             </Link>
             <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition">
               <LogOut size={20} />
             </button>
           </div>
         )}
       </div>
    </div>
  );

  // Bottom Nav for Mobile - Standardized Layout
  const MobileBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3 px-6 flex justify-between items-center z-50 md:hidden pb-safe transition-all">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/')}`}>
        <Home size={24} />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      
      <Link to="/events" className={`flex flex-col items-center gap-1 ${isActive('/events')}`}>
        <Calendar size={24} />
        <span className="text-[10px] font-medium">Events</span>
      </Link>
      
      <Link to="/services" className={`flex flex-col items-center gap-1 ${isActive('/services')}`}>
        <Car size={24} />
        <span className="text-[10px] font-medium">Services</span>
      </Link>

      {/* Dynamic Profile/Dashboard Tab */}
      <Link 
        to={
          userRole === UserRole.ADMIN ? "/admin" : 
          userRole === UserRole.PROVIDER ? "/provider-dashboard" : 
          userRole ? "/profile" : "/login"
        } 
        className={`flex flex-col items-center gap-1 ${isActive(
          userRole === UserRole.ADMIN ? "/admin" : 
          userRole === UserRole.PROVIDER ? "/provider-dashboard" : 
          userRole ? "/profile" : "/login"
        )}`}
      >
        {userRole === UserRole.ADMIN ? <ShieldCheck size={24} /> :
         userRole === UserRole.PROVIDER ? <Briefcase size={24} /> :
         <User size={24} />
        }
        <span className="text-[10px] font-medium">
          {userRole === UserRole.ADMIN ? 'Admin' : 
           userRole === UserRole.PROVIDER ? 'Dash' : 
           userRole ? 'Profile' : 'Login'}
        </span>
      </Link>
      
      <Link to="/more" className={`flex flex-col items-center gap-1 ${isActive('/more')}`}>
        <Menu size={24} />
        <span className="text-[10px] font-medium">More</span>
      </Link>
    </div>
  );

  // Top Nav for Desktop
  const DesktopNav = () => (
    <div className="hidden md:flex fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50 px-8 py-4 justify-between items-center pt-safe">
      <Link to="/" className="text-2xl font-bold text-dahab-teal tracking-tight flex items-center gap-3">
        <BrandLogo />
      </Link>
      
      <div className="flex gap-8 items-center">
        <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>Home</Link>
        <Link to="/events" className={`text-sm font-medium transition-colors ${isActive('/events')}`}>Events</Link>
        <Link to="/community" className={`text-sm font-medium transition-colors ${isActive('/community')}`}>Community Hub</Link>
        <Link to="/services" className={`text-sm font-medium transition-colors ${isActive('/services')}`}>Drivers & Services</Link>
        <Link to="/more" className={`text-sm font-medium transition-colors ${isActive('/more')}`}>More</Link>
        
        {userRole === UserRole.PROVIDER && (
           <Link to="/provider-dashboard" className={`text-sm font-medium transition-colors ${isActive('/provider-dashboard')}`}>Provider Dashboard</Link>
        )}
        {userRole === UserRole.ADMIN && (
          <Link to="/admin" className={`text-sm font-medium transition-colors ${isActive('/admin')}`}>Admin Dashboard</Link>
        )}
      </div>

      <div className="flex gap-4 items-center">
        {installPrompt && (
          <button 
            onClick={onInstall} 
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition text-sm font-bold shadow-md"
          >
            <Download size={16} /> Install App
          </button>
        )}

        {userRole ? (
          <>
             <Link to="/profile" className={`flex items-center gap-2 font-medium ${isActive('/profile')}`}>
               <User size={18} /> Profile
             </Link>
            <button onClick={onLogout} className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium ml-4">
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-gray-600 hover:text-dahab-teal px-4 py-2 rounded-full font-bold transition">
              Login
            </Link>
            <Link to="/login?mode=signup" className="bg-dahab-teal text-white px-5 py-2 rounded-full hover:bg-teal-700 transition shadow-md font-bold">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <DesktopNav />
      <MobileTopBar />
      <MobileBottomNav />
    </>
  );
};

export default Navbar;