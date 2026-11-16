import { Suspense } from 'react';
import { AuthRedirect } from '@/components/layout/AuthRedirect';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthRedirect />
      <RegisterForm />
    </Suspense>
  );
}
