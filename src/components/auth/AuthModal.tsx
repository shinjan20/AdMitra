import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthService } from '../../services/auth';
import {
  Compass,
  Lock,
  Mail,
  User as UserIcon,
  Store,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  X,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setUser, setActiveBusiness, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await AuthService.loginWithCredentials(usernameOrEmail, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          setUser(res.user);
          showToast({
            type: 'success',
            title: 'Welcome Back',
            message: `Signed in as ${res.user.name} (${res.user.email})`,
          });
          onClose();
        }
      } else {
        const res = await AuthService.register({
          name,
          username,
          email: usernameOrEmail,
          password,
          businessName,
        });
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          setUser(res.user);
          setActiveBusiness(res.business);
          showToast({
            type: 'success',
            title: 'Account Created',
            message: `Welcome to CampaignPilot, ${res.user.name}!`,
          });
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      const res = await AuthService.loginWithGoogle();
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        setUser(res.user);
        showToast({
          type: 'success',
          title: 'Google Sign-In Successful',
          message: `Signed in as ${res.user.name} via Google.`,
        });
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google OAuth failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickDemoSignIn = async () => {
    setUsernameOrEmail('pooja_aura');
    setPassword('password123');
    setLoading(true);
    const res = await AuthService.loginWithCredentials('pooja_aura', 'password123');
    setLoading(false);
    if (res.user) {
      setUser(res.user);
      showToast({
        type: 'success',
        title: 'Demo Account Loaded',
        message: 'Signed in as Pooja Sharma (Aura Bridal Studio).',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-2xs">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight pt-1">
            {mode === 'login' ? 'Sign in to CampaignPilot' : 'Create your business account'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Launch and track your local advertising campaigns'
              : 'Start reaching nearby customers in under 5 minutes'}
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleOAuth}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50"
          >
            {/* Google G SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200/80 w-full" />
            <span className="bg-white px-2.5 text-[11px] text-slate-400 uppercase font-medium">
              or
            </span>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Pooja Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Business Name
                  </label>
                  <div className="relative">
                    <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Aura Bridal Studio"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. pooja_aura"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {mode === 'login' ? 'Username or Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={mode === 'login' ? 'pooja_aura or owner@aurabridal.in' : 'owner@business.com'}
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">Password</label>
                {mode === 'login' && (
                  <span className="text-[10px] text-slate-400">
                    Hint: <code className="font-mono text-slate-600">password123</code>
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-9 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                'Processing...'
              ) : mode === 'login' ? (
                <>
                  Sign In <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset */}
          {mode === 'login' && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleQuickDemoSignIn}
                className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                1-Click Demo Login (Pooja Sharma)
              </button>
            </div>
          )}

          {/* Switch Mode Toggle */}
          <div className="text-center pt-2 text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-slate-900 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
