'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { errorMessage } from '@/services/api';

export function GoogleAuthButton({ label = 'Continue with Google', disabled = false, onSuccessRedirect }) {
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const scriptId = 'google-gsi-client';
    const initializeGsi = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
        });
      } catch (err) {
        console.warn('Google GSI initialization error:', err);
      }
    };

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      if (window.google?.accounts?.id) initializeGsi();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGsi;
    document.head.appendChild(script);
  }, [clientId]);

  async function handleCredentialResponse(response) {
    if (!response?.credential) return;
    setLoading(true);
    try {
      const user = await loginWithGoogle({ credential: response.credential });
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      if (onSuccessRedirect) onSuccessRedirect(user);
    } catch (err) {
      toast.error(errorMessage(err, 'Google sign-in failed. Please try again.'));
      setLoading(false);
    }
  }

  function handleClick() {
    const nativeButton = googleBtnRef.current?.querySelector('div[role="button"]');
    if (nativeButton) {
      nativeButton.click();
      return;
    }
    toast.error(
      clientId
        ? 'Google sign-in is still loading. Please try again.'
        : 'Google sign-in is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to frontend/.env.local.'
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="group relative flex min-h-12 w-full select-none items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        ) : (
          <span className="text-lg font-bold" aria-hidden="true">G</span>
        )}
        <span>{loading ? 'Connecting with Google...' : label}</span>
      </button>
      <div
        ref={googleBtnRef}
        aria-hidden="true"
        style={{ position: 'fixed', top: -9999, left: -9999, opacity: 0.01 }}
      />
    </>
  );
}
