import { RoleGuard } from '@/components/layout/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';

export default function DoctorLayout({ children }) {
  return (
    <RoleGuard roles={['doctor']}>
      <AppShell role="doctor">{children}</AppShell>
    </RoleGuard>
  );
}
