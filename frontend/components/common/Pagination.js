import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/Button';

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-4">
      <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <p className="text-base font-medium text-slate-700" aria-live="polite">
        Page {page} of {totalPages}
      </p>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex-row-reverse"
        icon={ChevronRight}
      >
        Next
      </Button>
    </nav>
  );
}
