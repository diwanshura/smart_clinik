'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { homePathForRole, safeNextPath } from '@/lib/utils';

/** Drop into login / register / landing pages: signed-in users are sent to their dashboard. */
export function AuthRedirect() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (!ready || !user) return;
    const next = safeNextPath(params.get('next'));
    router.replace(next && next.startsWith(`/${user.role}`) ? next : homePathForRole(user.role));
  }, [ready, user, router, params]);

  return null;
}
