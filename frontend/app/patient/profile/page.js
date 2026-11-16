'use client';

import { ProfileForm } from '@/components/profile/ProfileForm';
import { NotificationPrompt } from '@/components/patient/NotificationPrompt';

export default function PatientProfilePage() {
  return (
    <>
      <ProfileForm />
      <div className="mt-8">
        <NotificationPrompt />
      </div>
    </>
  );
}
