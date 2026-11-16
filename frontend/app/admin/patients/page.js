'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useToast } from '@/context/ToastContext';
import { adminService } from '@/services/adminService';
import { errorMessage } from '@/services/api';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { TextField } from '@/components/common/FormFields';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { Table, Td } from '@/components/common/Table';
import { formatDate } from '@/lib/utils';

export default function AdminPatientsPage() {
  const toast = useToast();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);

  // Wait for a pause in typing before querying.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [input]);

  const { data, loading, error, reload } = useAsyncData(
    () => adminService.patients({ search, page, limit: 15 }),
    [search, page]
  );

  async function toggleActive(patient) {
    setBusyId(patient._id);
    try {
      await adminService.setUserActive(patient._id, !patient.isActive);
      toast.success(`${patient.name}’s account ${patient.isActive ? 'deactivated' : 'activated'}.`);
      await reload({ silent: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change the account.'));
    } finally {
      setBusyId(null);
    }
  }

  const patients = data?.patients || [];

  return (
    <>
      <PageHeader title="Patients" subtitle="Everyone registered at the clinic" />

      <Card className="mb-6">
        <TextField
          label="Search patients"
          type="search"
          placeholder="Name, email or phone"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </Card>

      {loading && !data ? (
        <LoadingBlock label="Loading patients…" />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : patients.length === 0 ? (
        <EmptyState icon={Users} title="No patients found" text={search ? 'Try a different search.' : 'No one has registered yet.'} />
      ) : (
        <>
          <p className="mb-3 text-slate-600" aria-live="polite">
            {data.total} patient{data.total === 1 ? '' : 's'}
          </p>
          <Table columns={['Name', 'Contact', 'Details', 'Joined', 'Account']} caption="Registered patients">
            {patients.map((p) => (
              <tr key={p._id}>
                <Td className="font-semibold">{p.name}</Td>
                <Td>
                  <span className="block">{p.phone}</span>
                  <span className="text-sm text-slate-600">{p.email}</span>
                </Td>
                <Td className="text-sm">
                  {[p.gender, p.bloodGroup].filter(Boolean).join(' · ') || '—'}
                </Td>
                <Td>{formatDate(p.createdAt)}</Td>
                <Td>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge tone={p.isActive ? 'success' : 'neutral'}>{p.isActive ? 'Active' : 'Deactivated'}</Badge>
                    <Button size="sm" variant="secondary" loading={busyId === p._id} onClick={() => toggleActive(p)}>
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
