'use client';

import { CalendarClock, CheckCircle2, ClipboardList, Stethoscope, Timer, Users, XCircle } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { adminService } from '@/services/adminService';
import { doctorService } from '@/services/doctorService';
import { ButtonLink } from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import { ErrorState } from '@/components/common/EmptyState';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Table, Td } from '@/components/common/Table';
import { doctorDisplayName, formatLongDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [dash, docs] = await Promise.all([adminService.dashboard(), doctorService.listAll()]);
    return { dash, doctors: docs.doctors || [] };
  }, []);

  if (loading && !data) return <LoadingBlock label="Loading dashboard…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { stats, today, byDoctor = [] } = data.dash;
  const nameOf = (id) => {
    const d = data.doctors.find((x) => x._id === id);
    return d ? doctorDisplayName(d) : 'Unknown doctor';
  };

  return (
    <>
      <PageHeader title="Clinic overview" subtitle={`Today · ${formatLongDate(today)}`} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={ClipboardList} label="Appointments today" value={stats.totalToday} tone="navy" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tone="teal" />
        <StatCard icon={XCircle} label="Missed" value={stats.missed} tone="red" />
        <StatCard icon={Timer} label="Avg consultation (min)" value={stats.avgWaitMinutes} tone="blue" />
        <StatCard icon={CalendarClock} label="Still waiting" value={stats.booked + stats.inProgress} tone="gold" />
        <StatCard icon={Users} label="Registered patients" value={stats.totalPatients} tone="teal" />
        <StatCard icon={Stethoscope} label="Doctors" value={stats.totalDoctors} tone="blue" />
      </div>

      <Card className="mt-8">
        <CardHeader
          title="Today by doctor"
          action={
            <ButtonLink href="/admin/appointments" variant="secondary" size="sm">
              All appointments
            </ButtonLink>
          }
        />
        {byDoctor.length === 0 ? (
          <p className="py-6 text-center text-slate-600">No appointments have been booked for today yet.</p>
        ) : (
          <Table columns={['Doctor', 'Total', 'Completed', 'Pending']} caption="Appointments per doctor today">
            {byDoctor.map((row) => (
              <tr key={row._id}>
                <Td className="font-semibold">{nameOf(row._id)}</Td>
                <Td>{row.total}</Td>
                <Td>{row.completed}</Td>
                <Td>{row.pending}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}
