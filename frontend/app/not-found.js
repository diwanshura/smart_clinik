import { SearchX } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <EmptyState
        icon={SearchX}
        title="We couldn’t find that page"
        text="The link may be old or mistyped. Let’s get you back on track."
        action={<ButtonLink href="/">Go to the home page</ButtonLink>}
      />
    </main>
  );
}
