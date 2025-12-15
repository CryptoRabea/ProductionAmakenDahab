import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, UserRole } from '../types';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginWithFacebook,
  validatePassword,
  resendVerificationEmail
} from '../services/auth';
import { Mail, Lock, User as UserIcon, ArrowRight, Check, Facebook, Loader2, Briefcase, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface LoginProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isProviderSignup, setIsProviderSignup] = useState(false);
  const [error, setError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    const modeParam = searchParams.get('mode');

    if (roleParam === 'provider') {
      setMode('signup');
      setIsProviderSignup(true);
    } else if (modeParam === 'signup') {
      setMode('signup');
      setIsProviderSignup(false);
    }
  }, [searchParams]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    setShowVerificationMessage(false);
    try {
      const user = provider === 'google'
        ? await loginWithGoogle()
        : await loginWithFacebook();

      onLogin(user);

      if (user.role === UserRole.ADMIN) navigate('/admin');
      else if (user.role === UserRole.PROVIDER) navigate('/provider-dashboard');
      else navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Social authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowVerificationMessage(false);
    setNeedsVerification(false);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        // Signup mode
        if (!formData.name) {
          setError('Name is required for signup');
          setLoading(false);
          return;
        }

        // Validate password before submitting
        const validation = validatePassword(formData.password);
        if (!validation.valid) {
          setError(validation.errors[0]); // Show first error
          setPasswordErrors(validation.errors);
          setLoading(false);
          return;
        }

        const result = await registerWithEmail(
          formData.name,
          formData.email,
          formData.password,
          isProviderSignup
        );

        // Show verification message
        setShowVerificationMessage(true);
        setFormData({ name: '', email: '', password: '' });
        setMode('login');

        // Don't login yet - user needs to verify email
      } else {
        // Login mode
        const user = await loginWithEmail(formData.email, formData.password);

        onLogin(user);

        // Routing based on Role
        if (user.role === UserRole.ADMIN) navigate('/admin');
        else if (user.role === UserRole.PROVIDER) navigate('/provider-dashboard');
        else navigate('/');
      }
    } catch (err: any) {
      console.error("Auth Error", err);

      // Check if it's an email verification error
      if (err.message?.includes('verify your email')) {
        setNeedsVerification(true);
        setError(err.message);
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');
    try {
      await resendVerificationEmail();
      setShowVerificationMessage(true);
      setNeedsVerification(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  // Validate password in real-time during signup
  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });

    if (mode === 'signup' && password.length > 0) {
      const validation = validatePassword(password);
      setPasswordErrors(validation.errors);
    } else {
      setPasswordErrors([]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Explicitly set text-gray-900 to ensure content is visible on white background even if global text is white */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden text-gray-900">
        
        {/* Header Image/Color */}
        <div className="bg-gradient-to-r from-dahab-teal to-blue-500 p-8 text-center text-white flex flex-col items-center">
          {settings.logoUrl && (
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              className="w-16 h-16 object-contain mb-3 drop-shadow-md"
              onError={(e) => {
                // Hide if error
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <h1 className="text-3xl font-bold mb-2">{settings.appName}</h1>
          <p className="opacity-90 text-sm">
            {isProviderSignup ? 'Become a Partner' : 'Your Gateway to Dahab'}
          </p>
        </div>

        <div className="p-8">
          {/* Tabs for Login / Signup */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button 
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button 
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${mode === 'signup' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button 
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button 
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1877F2] text-white rounded-xl hover:bg-[#1864D9] transition font-medium text-sm"
            >
              <Facebook size={20} fill="currentColor" className="text-white" />
              Facebook
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-gray-400 uppercase">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative animate-fade-in">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Full Name / Business Name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/50 transition text-gray-900"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email" 
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/50 transition text-gray-900"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder={mode === 'signup' ? 'Strong Password (8+ chars)' : 'Password'}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dahab-teal/50 transition text-gray-900"
                value={formData.password}
                onChange={e => handlePasswordChange(e.target.value)}
                required
                minLength={mode === 'signup' ? 8 : 6}
              />
            </div>

            {/* Password Strength Indicator (Signup Only) */}
            {mode === 'signup' && formData.password && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className={passwordErrors.length === 0 ? 'text-green-500' : 'text-gray-400'} />
                  <span className={`text-xs font-medium ${passwordErrors.length === 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    Password Strength
                  </span>
                </div>
                {passwordErrors.length > 0 ? (
                  <ul className="space-y-1">
                    {passwordErrors.map((err, idx) => (
                      <li key={idx} className="text-xs text-red-600 flex items-start gap-1.5">
                        <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-green-600">
                    <CheckCircle size={12} />
                    <span>Password meets all requirements</span>
                  </div>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition animate-fade-in ${isProviderSignup ? 'bg-teal-50 border-dahab-teal' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${isProviderSignup ? 'bg-dahab-teal border-dahab-teal' : 'border-gray-300'}`}>
                  {isProviderSignup && <Check size={14} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  checked={isProviderSignup}
                  onChange={e => setIsProviderSignup(e.target.checked)}
                  className="hidden"
                />
                <div className="flex-1">
                   <div className="font-bold text-gray-900 flex items-center gap-2">
                     <Briefcase size={16} className={isProviderSignup ? "text-dahab-teal" : "text-gray-400"} />
                     Register as Service Provider
                   </div>
                   <p className="text-xs text-gray-500 mt-1">Create events, offer driving services, or list your business. Requires admin approval.</p>
                </div>
              </label>
            )}

            {/* Success Message - Email Verification Sent */}
            {showVerificationMessage && (
              <div className="flex flex-col gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-sm animate-fade-in">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <CheckCircle size={18} />
                  <span>Verification Email Sent!</span>
                </div>
                <p className="text-green-600 text-xs">
                  Please check your inbox and click the verification link to activate your account. Then you can log in.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex flex-col gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
                {needsVerification && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="mt-2 w-full bg-white border border-red-300 text-red-600 py-2 px-4 rounded-lg text-xs font-medium hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex justify-center items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;