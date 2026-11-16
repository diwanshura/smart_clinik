'use client';

import { useState } from 'react';
import { CalendarCheck, CalendarPlus } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { appointmentService } from '@/services/appointmentService';
import { APPOINTMENT_FILTERS } from '@/lib/constants';
import { ButtonLink } from '@/components/common/Button';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { FilterTabs } from '@/components/common/FilterTabs';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { AppointmentCard } from '@/components/patient/AppointmentCard';
import { AppointmentDetailModal } from '@/components/patient/AppointmentDetailModal';
import { CancelAppointmentDialog } from '@/components/patient/CancelAppointmentDialog';

const PAGE_SIZE = 8;

export default function PatientAppointmentsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const { data, loading, error, reload } = useAsyncData(
    () => appointmentService.mine({ status, page, limit: PAGE_SIZE }),
    [status, page]
  );

  const appointments = data?.appointments || [];

  function changeFilter(value) {
    setStatus(value);
    setPage(1);
  }

  return (
    <>
      <PageHeader
        title="My appointments"
        subtitle="Your full history of clinic visits"
        actions={
          <ButtonLink href="/patient/book" icon={CalendarPlus}>
            Book a visit
          </ButtonLink>
        }
      />

      <div className="mb-6">
        <FilterTabs label="Filter appointments by status" options={APPOINTMENT_FILTERS} value={status} onChange={changeFilter} />
      </div>

      {loading ? (
        <LoadingBlock label="Loading appointments…" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No appointments found"
          text={status ? 'Nothing matches this filter. Try “All”.' : 'Book your first appointment to get started.'}
          action={<ButtonLink href="/patient/book">Book now</ButtonLink>}
        />
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {appointments.map((a) => (
              <li key={a._id}>
                <AppointmentCard appointment={a} onOpen={setSelected} onCancel={setCancelTarget} />
              </li>
            ))}
          </ul>
          <Pagination page={data.page || page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}

      <AppointmentDetailModal
        appointment={selected}
        onClose={() => setSelected(null)}
        onCancel={(a) => {
          setSelected(null);
          setCancelTarget(a);
        }}
      />
      <CancelAppointmentDialog
        appointment={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCancelled={() => reload({ silent: true })}
      />
    </>
  );
}
