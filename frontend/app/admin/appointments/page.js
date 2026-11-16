'use client';

import { useState } from 'react';
import { CheckCircle2, ClipboardList, SkipForward, XCircle } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/context/ToastContext';
import { adminService } from '@/services/adminService';
import { appointmentService } from '@/services/appointmentService';
import { doctorService } from '@/services/doctorService';
import { errorMessage } from '@/services/api';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { SelectField, TextField } from '@/components/common/FormFields';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { Table, Td } from '@/components/common/Table';
import { doctorDisplayName, formatDate, formatTime, toDateInputValue } from '@/lib/utils';

const LIMIT = 15;

export default function AdminAppointmentsPage() {
  const toast = useToast();
  const [date, setDate] = useState(() => toDateInputValue());
  const [status, setStatus] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);

  const doctors = useAsyncData(() => doctorService.listAll(), []);
  const { data, loading, error, reload } = useAsyncData(
    () => adminService.appointments({ date, status, doctorId, page, limit: LIMIT }),
    [date, status, doctorId, page]
  );

  const filterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  async function act(appointment, action) {
    setBusyId(appointment._id);
    try {
      if (action === 'cancelled') await appointmentService.cancel(appointment._id);
      else await appointmentService.updateStatus(appointment._id, action);
      toast.success(`Token #${appointment.tokenNumber} updated.`);
      await reload({ silent: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the appointment.'));
    } finally {
      setBusyId(null);
    }
  }

  const appointments = data?.appointments || [];
  const totalPages = Math.ceil((data?.total || 0) / LIMIT);

  return (
    <>
      <PageHeader title="Appointments" subtitle="Every booking across all doctors" />

      <Card className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField label="Date (clear to see all)" type="date" value={date} onChange={filterChange(setDate)} />
          <SelectField label="Status" value={status} onChange={filterChange(setStatus)}>
            <option value="">All statuses</option>
            <option value="booked">Booked</option>
            <option value="in-progress">With doctor</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
            <option value="cancelled">Cancelled</option>
          </SelectField>
          <SelectField label="Doctor" value={doctorId} onChange={filterChange(setDoctorId)}>
            <option value="">All doctors</option>
            {(doctors.data?.doctors || []).map((d) => (
              <option key={d._id} value={d._id}>
                {doctorDisplayName(d)}
              </option>
            ))}
          </SelectField>
        </div>
      </Card>

      {loading && !data ? (
        <LoadingBlock label="Loading appointments…" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : appointments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No appointments found" text="Try a different date or filter." />
      ) : (
        <>
          <p className="mb-3 text-slate-600" aria-live="polite">
            {data.total} appointment{data.total === 1 ? '' : 's'}
          </p>
          <Table columns={['Token', 'Patient', 'Doctor', 'Date', 'Time', 'Status', 'Actions']} caption="Appointments">
            {appointments.map((a) => {
              const open = ['booked', 'in-progress'].includes(a.status);
              const busy = busyId === a._id;
              return (
                <tr key={a._id}>
                  <Td className="font-bold">
                    #{a.tokenNumber}
                    {a.isEmergency ? <Badge tone="danger" className="ml-2">Emergency</Badge> : null}
                  </Td>
                  <Td>
                    <span className="block font-semibold">{a.userId?.name || '—'}</span>
                    <span className="text-sm text-slate-600">{a.userId?.phone}</span>
                  </Td>
                  <Td>{doctorDisplayName(a.doctorId)}</Td>
                  <Td>{formatDate(a.date)}</Td>
                  <Td>{formatTime(a.slotTime)}</Td>
                  <Td>
                    <StatusBadge status={a.status} />
                  </Td>
                  <Td>
                    {open ? (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" icon={CheckCircle2} disabled={busy} onClick={() => act(a, 'completed')}>
                          Done
                        </Button>
                        <Button size="sm" variant="secondary" icon={SkipForward} disabled={busy} onClick={() => act(a, 'missed')}>
                          Absent
                        </Button>
                        <Button size="sm" variant="danger" icon={XCircle} disabled={busy} onClick={() => act(a, 'cancelled')}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </Table>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
