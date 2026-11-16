import { Suspense } from 'react';
import { AuthRedirect } from '@/components/layout/AuthRedirect';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = { title: 'Sign in' };

export default function LoginPage() {
  // useSearchParams() inside these client components needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <AuthRedirect />
      <LoginForm />
    </Suspense>
  );
}
