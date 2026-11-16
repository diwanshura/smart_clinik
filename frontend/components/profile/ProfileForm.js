'use client';

import { useState } from 'react';
import { Mail, Phone, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services/authService';
import { ApiError, errorMessage } from '@/services/api';
import { BLOOD_GROUPS, GENDERS } from '@/lib/constants';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Card, CardHeader } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { SelectField, TextField } from '@/components/common/FormFields';
import { toDateInputValue } from '@/lib/utils';

const PHONE_RE = /^\+?[\d\s-]{10,15}$/;
const ROLE_LABEL = { patient: 'Patient', doctor: 'Doctor', admin: 'Administrator' };

function toForm(user) {
  return {
    name: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).split('T')[0] : '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
  };
}

/** Account profile used by all three roles (the same API: PUT /auth/profile). */
export function ProfileForm() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(() => toForm(user));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const found = {};
    if (form.name.trim().length < 2 || form.name.trim().length > 50) found.name = 'Name must be 2–50 characters.';
    if (!PHONE_RE.test(form.phone.trim())) found.phone = 'Enter a phone number with 10–15 digits.';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const data = await authService.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        dateOfBirth: form.dateOfBirth, // '' clears the value on the server
        gender: form.gender,
        bloodGroup: form.bloodGroup,
      });
      updateUser(data.user);
      setForm(toForm(data.user));
      toast.success('Your profile has been saved.');
    } catch (err) {
      if (err instanceof ApiError && Array.isArray(err.data?.errors)) {
        const mapped = {};
        err.data.errors.forEach((item) => {
          const field = item.path || item.param;
          if (field && !mapped[field]) mapped[field] = item.msg;
        });
        setErrors(mapped);
      }
      toast.error(errorMessage(err, 'We could not save your profile.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="My profile" subtitle="Keep your personal details up to date" />

      <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
        <Card className="text-center">
          <Avatar name={user?.name} size="lg" className="mx-auto" />
          <h2 className="mt-4 text-2xl text-ink-900">{user?.name}</h2>
          <p className="mt-1 text-sm font-bold uppercase tracking-wider text-brand-700">{ROLE_LABEL[user?.role]}</p>
          <dl className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-left text-slate-700">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
              <div className="min-w-0">
                <dt className="sr-only">Email</dt>
                <dd className="break-words">{user?.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
              <div>
                <dt className="sr-only">Phone</dt>
                <dd>{user?.phone || 'No phone number'}</dd>
              </div>
            </div>
          </dl>
        </Card>

        <Card>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
            <section className="flex flex-col gap-5">
              <CardHeader title="Basic information" className="mb-0" />
              <TextField label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} required />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Email address"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  hint="Your email is linked to your account and can’t be changed here."
                />
                <TextField
                  label="Phone number"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  error={errors.phone}
                  required
                />
              </div>
            </section>

            <section className="flex flex-col gap-5">
              <CardHeader title="Personal & medical" className="mb-0" />
              <div className="grid gap-5 sm:grid-cols-3">
                <TextField label="Date of birth" type="date" max={toDateInputValue()} value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                <SelectField label="Gender" value={form.gender} onChange={set('gender')}>
                  <option value="">Prefer not to say</option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </SelectField>
                <SelectField label="Blood group" value={form.bloodGroup} onChange={set('bloodGroup')}>
                  <option value="">Not sure</option>
                  {BLOOD_GROUPS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </SelectField>
              </div>
            </section>

            <div className="flex justify-end border-t border-slate-200 pt-6">
              <Button type="submit" size="lg" icon={Save} loading={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
