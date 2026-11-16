import { RoleGuard } from '@/components/layout/RoleGuard';
import { AppShell } from '@/components/layout/AppShell';
import { PatientEffects } from '@/components/patient/PatientEffects';

export default function PatientLayout({ children }) {
  return (
    <RoleGuard roles={['patient']}>
      <AppShell role="patient">
        <PatientEffects />
        {children}
      </AppShell>
    </RoleGuard>
  );
}
