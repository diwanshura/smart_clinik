'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/common/EmptyState';

// Catches unexpected rendering errors anywhere below the root layout.
export default function GlobalRouteError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <ErrorState
        title="Something went wrong"
        error={{ message: 'An unexpected problem occurred. Your data is safe — please try again.' }}
        onRetry={reset}
      />
    </main>
  );
}
