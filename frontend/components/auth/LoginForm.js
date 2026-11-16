'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { errorMessage } from '@/services/api';
import { DEMO_ACCOUNTS, SHOW_DEMO_LOGINS } from '@/lib/config';
import { Button } from '@/components/common/Button';
import { TextField } from '@/components/common/FormFields';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

export function LoginForm() {
  const { login, user } = useAuth();
  const toast = useToast();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const expired = params.get('reason') === 'expired';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }
    setSubmitting(true);
    try {
      const loggedIn = await login(email.trim(), password);
      toast.success(`Welcome back, ${loggedIn.name.split(' ')[0]}!`);
    } catch (err) {
      setError(errorMessage(err, 'Sign in failed. Please check your credentials.'));
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Smart Clinic account"
      showVisualPanel
      footer={
        <p className="text-slate-600">
          New to Smart Clinic?{' '}
          <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4">
            Create an account
          </Link>
        </p>
      }
    >
      {expired ? (
        <div role="alert" className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs font-semibold text-amber-900">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Your session has expired. Please sign in again.</span>
        </div>
      ) : null}

      {/* Google OAuth Section */}
      <div className="mb-5">
        <GoogleAuthButton label="Continue with Google" disabled={submitting || !!user} />
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 font-semibold text-slate-400">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="relative">
          <TextField
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="relative">
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-pressed={showPassword}
            className="inline-flex items-center gap-1.5 self-end pt-1 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600"
          >
            {showPassword ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
        </div>

        {error ? (
          <div role="alert" className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-semibold text-rose-800">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          full
          loading={submitting || !!user}
          icon={LogIn}
          className="mt-2"
        >
          {submitting || user ? 'Signing in…' : 'Sign in to account'}
        </Button>
      </form>

      {SHOW_DEMO_LOGINS ? (
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Quick Demo Logins
            </span>
            <span className="text-[11px] text-slate-400">1-click autofill</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                  setError('');
                }}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-2 px-2 text-xs font-bold capitalize text-slate-700 shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 active:scale-95"
              >
                <span>{acc.role}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </AuthLayout>
  );
}
