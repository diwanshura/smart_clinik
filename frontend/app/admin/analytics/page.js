'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3 } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/common/Card';
import { EmptyState, ErrorState } from '@/components/common/EmptyState';
import { SelectField } from '@/components/common/FormFields';
import { LoadingBlock } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';

// Chart.js touches <canvas>, so it is only loaded in the browser.
const AnalyticsCharts = dynamic(
  () => import('@/components/admin/AnalyticsCharts').then((m) => m.AnalyticsCharts),
  { ssr: false, loading: () => <LoadingBlock label="Preparing charts…" /> }
);

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState('7');
  const { data, loading, error, reload } = useAsyncData(() => adminService.analytics(days), [days]);
  const stats = data?.dailyStats || [];

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Patient trends over time"
        actions={
          <SelectField label="Period" value={days} onChange={(e) => setDays(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
            <option value="30">Last 30 days</option>
          </SelectField>
        }
      />
      <Card>
        {loading && !data ? (
          <LoadingBlock label="Loading analytics…" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : stats.length === 0 ? (
          <EmptyState icon={BarChart3} title="No data for this period" text="Charts appear once appointments are booked." />
        ) : (
          <AnalyticsCharts stats={stats} />
        )}
      </Card>
    </>
  );
}
