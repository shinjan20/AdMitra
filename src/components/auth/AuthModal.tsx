import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthService, DEMO_PHONE_NUMBER, DEMO_PHONE_OTP } from '../../services/auth';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import {
  Compass,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setUser, setActiveBusiness, showToast, t, tr } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('phone');

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(DEMO_PHONE_NUMBER);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Debug logging
  React.useEffect(() => {
    console.log('[AuthModal] isOpen:', isOpen);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNoticeMessage(null);
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
            title: tr('Welcome Back'),
            message: tr('Signed in as {name} ({email})', { name: res.user.name, email: res.user.email }),
          });
          onClose();
        }
      } else {
        const res = await AuthService.register({
          name,
          email: usernameOrEmail,
          password,
        });
        if (res.error) {
          if (res.error.startsWith('Account created.')) {
            setNoticeMessage(res.error);
          } else {
            setErrorMessage(res.error);
          }
        } else if (res.user && res.business) {
          setUser(res.user);
          setActiveBusiness(res.business);
          showToast({
            type: 'success',
            title: tr('Account Created'),
            message: tr('Welcome to AdMitra, {name}!', { name: res.user.name }),
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

  const normalizeIndianPhone = (value: string): string | null => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('0091')) digits = digits.slice(4);
    else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
    else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
    return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
  };

  const requestPhoneOtp = async () => {
    setErrorMessage(null);
    setNoticeMessage(null);
    const phone = normalizeIndianPhone(phoneNumber);
    if (!phone) {
      setErrorMessage(t('phoneFormatError'));
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setErrorMessage(t('fullName'));
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.sendPhoneOtp(phone, name, mode === 'register');
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setPhoneNumber(phone.slice(3));
        setOtpSent(true);
        setNoticeMessage(
          result.demo
            ? `${tr('Demo mode: no SMS is sent. Use code')} ${DEMO_PHONE_OTP}.`
            : t('otpSent')
        );
      }
    } catch (error) {
      console.error('Could not send mobile verification code:', error);
      setErrorMessage(error instanceof Error ? error.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    await requestPhoneOtp();
  };

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    const phone = normalizeIndianPhone(phoneNumber);
    if (!phone) {
      setErrorMessage(t('phoneFormatError'));
      return;
    }
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setErrorMessage(t('otpCode'));
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.verifyPhoneOtp(phone, otpCode.trim());
      if (result.error) {
        setErrorMessage(result.error);
      } else if (result.user) {
        setUser(result.user);
        showToast({
          type: 'success',
          title: tr('You are in'),
          message: tr('Next, tell us about your shop.'),
        });
        onClose();
      }
    } catch (error) {
      console.error('Could not verify mobile code:', error);
      setErrorMessage(error instanceof Error ? error.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setErrorMessage(null);
    setNoticeMessage(null);
    setGoogleLoading(true);
    try {
      const res = await AuthService.loginWithGoogle();
      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        setUser(res.user);
        showToast({
          type: 'success',
          title: tr('Google Sign-In Successful'),
          message: tr('Signed in as {name} via Google.', { name: res.user.name }),
        });
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google OAuth failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const changeAuthMethod = (method: 'email' | 'phone') => {
    setAuthMethod(method);
    setErrorMessage(null);
    setNoticeMessage(null);
    setOtpSent(false);
    setOtpCode('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      style={{ display: isOpen ? 'flex' : 'none' }}
      role="dialog"
      aria-modal="true"
      aria-label="Authentication modal"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md p-6 sm:p-8 z-10 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label={tr('Close')}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-2xs">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight pt-1">
            {mode === 'login' ? tr('Sign in to AdMitra') : t('createAccount')}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? tr('Use your mobile number. It takes about a minute.')
              : t('shopIntro')}
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
            <span>{googleLoading ? '…' : t('googleSignIn')}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200/80 w-full" />
            <span className="bg-white px-2.5 text-[11px] text-slate-400 uppercase font-medium">
              {t('or')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2" aria-label={tr('Sign-in method')}>
            <button
              type="button"
              onClick={() => changeAuthMethod('email')}
              aria-pressed={authMethod === 'email'}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                authMethod === 'email'
                  ? 'border-slate-900 bg-slate-50 text-slate-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {authMethod === 'phone' ? t('useEmail') : t('email')}
            </button>
            <button
              type="button"
              onClick={() => changeAuthMethod('phone')}
              aria-pressed={authMethod === 'phone'}
              className={`min-h-11 rounded-lg border px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                authMethod === 'phone'
                  ? 'border-slate-900 bg-slate-50 text-slate-900'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {authMethod === 'email' ? t('usePhone') : t('mobileNumber')}
            </button>
          </div>

          {/* Credentials Form */}
          {authMethod === 'phone' ? (
            <form
              onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
              className="space-y-3.5"
            >
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-950">
                <p className="font-semibold">{tr('Demo access')}</p>
                <p className="mt-0.5">
                  {tr('Mobile {phone} · Code {code}. No SMS is sent and nothing is charged.', {
                    phone: DEMO_PHONE_NUMBER,
                    code: DEMO_PHONE_OTP,
                  })}
                </p>
              </div>
              {mode === 'register' && !otpSent && (
                <div>
                  <label htmlFor="phone-signup-name" className="mb-1 block text-sm font-medium text-slate-700">
                    {t('fullName')}
                  </label>
                  <input
                    id="phone-signup-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              )}
              <div>
                <label htmlFor="signup-phone" className="mb-1 block text-sm font-medium text-slate-700">
                  {t('mobileNumber')}
                </label>
                <div className="flex min-h-11 overflow-hidden rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-slate-900">
                  <span className="inline-flex items-center border-r border-slate-200 bg-slate-50 px-3 text-base text-slate-600">
                    +91
                  </span>
                  <input
                    id="signup-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={phoneNumber}
                    onChange={(event) => {
                      setPhoneNumber(event.target.value);
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    maxLength={14}
                    placeholder="98765 43210"
                    required
                    className="min-w-0 flex-1 px-3 text-base focus:outline-none"
                  />
                </div>
              </div>
              {otpSent && (
                <div>
                  <label htmlFor="phone-otp" className="mb-1 block text-sm font-medium text-slate-700">
                    {t('otpCode')}
                  </label>
                  <input
                    id="phone-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="min-h-12 w-full rounded-lg border border-slate-300 px-3 text-lg tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <p className="mt-1 text-sm text-slate-600">{t('otpSent')}</p>
                </div>
              )}

              {errorMessage && (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
                  {tr(errorMessage)}
                </p>
              )}
              {noticeMessage && (
                <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-800">
                  {noticeMessage}
                </p>
              )}

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-11 w-full rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-50"
                >
                  {loading
                    ? '…'
                    : otpSent
                      ? t('verifyOtp')
                      : t('sendOtp')}
                </button>
                {otpSent && (
                  <button
                    type="button"
                    onClick={requestPhoneOtp}
                    disabled={loading}
                    className="min-h-11 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    {t('resendOtp')}
                  </button>
                )}
              </div>
            </form>
          ) : (
          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="account-name" className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('fullName')}
                  </label>
                  <input
                    id="account-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={isSupabaseConfigured() ? 'email' : 'text'}
                  autoComplete="email"
                  placeholder={
                    mode === 'login' && !isSupabaseConfigured()
                      ? 'pooja_aura or owner@aurabridal.in'
                      : 'owner@business.com'
                  }
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="min-h-11 w-full rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700">{t('password')}</label>
                {mode === 'login' && !isSupabaseConfigured() && (
                  <span className="text-[10px] text-slate-400">
                    Hint: <code className="font-mono text-slate-600">password123</code>
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-11 w-full rounded-lg border border-slate-300 py-2 pl-8 pr-9 text-base focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                {tr(errorMessage)}
              </div>
            )}
            {noticeMessage && (
              <div role="status" className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {noticeMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="min-h-11 w-full rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-50"
            >
              {loading ? (
                '…'
              ) : mode === 'login' ? (
                <>
                  {t('signIn')} <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  {t('createAccount')} <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
          )}

          {/* Switch Mode Toggle */}
          <div className="text-center pt-2 text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                {t('noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setOtpSent(false);
                  }}
                  className="text-slate-900 font-semibold hover:underline"
                >
                  {t('createOne')}
                </button>
              </p>
            ) : (
              <p>
                {t('alreadyAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setOtpSent(false);
                  }}
                  className="text-slate-900 font-semibold hover:underline"
                >
                  {t('signIn')}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
