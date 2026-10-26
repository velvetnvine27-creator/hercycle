import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Phone, Lock, AlertTriangle, CheckCircle2, Loader2, ChevronRight, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

type AuthView = 'login' | 'register';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [view, setView] = useState<AuthView>('login');
  const [isCheckingRegistered, setIsCheckingRegistered] = useState(true);

  // Form fields
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockInfo, setLockInfo] = useState<{ locked: boolean; lockedUntil?: Date }>({ locked: false });
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    authService.isRegistered().then(reg => {
      setView(reg ? 'login' : 'register');
      setIsCheckingRegistered(false);
    });
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockInfo.lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockInfo.lockedUntil!.getTime() - Date.now()) / 1000);
      if (remaining <= 0) {
        setCountdown(0);
        setLockInfo({ locked: false });
        setError('');
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockInfo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone.trim() || !pin) return;
    setIsLoading(true);
    const result = await authService.login(phone.trim(), pin);
    setIsLoading(false);
    if (result.success) {
      onAuthenticated();
    } else {
      setError(result.error || 'Login failed.');
      if (result.lockedUntil) setLockInfo({ locked: true, lockedUntil: result.lockedUntil });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await authService.register(phone.trim(), pin, confirmPin);
    setIsLoading(false);
    if (result.success) {
      onAuthenticated();
    } else {
      setError(result.error || 'Registration failed.');
    }
  };

  if (isCheckingRegistered) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-burgundy-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <img
          src="/hercycle-logo.png"
          alt="HER CYCLE logo"
          className="w-28 h-28 object-contain mb-4"
        />
        <h1 className="font-serif text-3xl font-bold text-burgundy-900 tracking-tight">HER CYCLE</h1>
        <p className="text-sm text-burgundy-900/60 mt-1">Private Women's Health Tracker</p>
      </div>

      <div className="w-full max-w-sm">
        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-rosepink-100 p-1 mb-6 border border-rosepink-200">
          <button
            onClick={() => { setView('login'); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${view === 'login' ? 'bg-white text-burgundy-900 shadow-sm' : 'text-burgundy-900/60'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setView('register'); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${view === 'register' ? 'bg-white text-burgundy-900 shadow-sm' : 'text-burgundy-900/60'}`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {/* Phone number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-burgundy-900/40" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-rosepink-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-800/30 focus:border-burgundy-800"
                autoComplete="tel"
                required
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Include country code. India: +91</p>
          </div>

          {/* PIN */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-1.5">
              6-Digit PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-burgundy-900/40" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                inputMode="numeric"
                maxLength={6}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-rosepink-200 bg-white text-gray-800 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-burgundy-800/30 focus:border-burgundy-800"
                autoComplete={view === 'register' ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-burgundy-900/40 hover:text-burgundy-900"
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pin.length > 0 && pin.length < 6 && (
              <p className="text-[11px] text-cherry-600 mt-1">{6 - pin.length} more digit{6 - pin.length !== 1 ? 's' : ''} needed</p>
            )}
          </div>

          {/* Confirm PIN (register only) */}
          {view === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-1.5">
                Confirm PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-burgundy-900/40" />
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  inputMode="numeric"
                  maxLength={6}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-white text-gray-800 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-burgundy-800/30 ${
                    confirmPin && pin !== confirmPin ? 'border-cherry-400' : 'border-rosepink-200 focus:border-burgundy-800'
                  }`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-burgundy-900/40 hover:text-burgundy-900"
                  aria-label={showConfirmPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPin && pin === confirmPin && (
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-[11px] text-green-600">PINs match</span>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-cherry-50 border border-cherry-200">
              <AlertTriangle className="w-4 h-4 text-cherry-600 shrink-0 mt-0.5" />
              <p className="text-xs text-cherry-700">{error}{countdown > 0 ? ` (${countdown}s)` : ''}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || lockInfo.locked || pin.length !== 6}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{view === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security disclosure */}
        <div className="mt-6 p-4 rounded-2xl bg-rosepink-50 border border-rosepink-200">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-burgundy-800" />
            <span className="text-xs font-bold text-burgundy-900">Privacy &amp; Security</span>
          </div>
          <ul className="text-[11px] text-burgundy-900/70 space-y-1">
            <li>• All health data stays on your device (IndexedDB)</li>
            <li>• Your PIN is hashed with SHA-256 — never stored as plain text</li>
            <li>• Phone number is a local identifier only — not verified via SMS</li>
            <li>• No data is sent to any server</li>
            <li>• This is a local access gate, not a server-backed account</li>
          </ul>
        </div>

        {/* Forgot PIN notice */}
        {view === 'login' && (
          <p className="text-center text-[11px] text-gray-400 mt-4">
            Forgot your PIN? Go to Profile &rarr; Settings &rarr; Reset Account (erases all local data).
          </p>
        )}
      </div>
    </div>
  );
};
