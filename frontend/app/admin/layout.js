import { RoleGuard } from '@/components/layout/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminLayout({ children }) {
  return (
    <RoleGuard roles={['admin']}>
      <AppShell role="admin">{children}</AppShell>
    </RoleGuard>
  );
}
