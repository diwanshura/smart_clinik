'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/common/Spinner';
import { homePathForRole } from '@/lib/utils';

/**
 * Client-side route protection.
 * - Signed out            -> /login?next=<current page>
 * - Signed in, wrong role -> that role's own dashboard
 *
 * This only controls what the UI shows. Real authorisation is enforced by the Express API
 * (JWT + role middleware), so a tampered localStorage value can't read or change protected data.
 */
export function RoleGuard({ roles, children }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (!roles.includes(user.role)) {
      router.replace(homePathForRole(user.role));
    }
  }, [ready, user, roles, router, pathname]);

  if (!ready || !allowed) return <PageLoader label="Checking your account…" />;
  return children;
}
