'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ApiError, errorMessage } from '@/services/api';
import { BLOOD_GROUPS, GENDERS } from '@/lib/constants';
import { Button } from '@/components/common/Button';
import { ChoiceGroup, SelectField, TextField } from '@/components/common/FormFields';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { toDateInputValue } from '@/lib/utils';

const PHONE_RE = /^\+?[\d\s-]{10,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};
  const name = form.name.trim();
  if (name.length < 2 || name.length > 50) errors.name = 'Please enter your full name (2–50 characters).';
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!PHONE_RE.test(form.phone.trim())) errors.phone = 'Enter a valid phone number (10–15 digits).';
  if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (form.confirm !== form.password) errors.confirm = 'The two passwords do not match.';
  return errors;
}

export function RegisterForm() {
  const { register, user } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    role: 'patient',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const created = await register({
        role: form.role,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        bloodGroup: form.bloodGroup || undefined,
      });
      toast.success(`Welcome to Smart Clinic, ${created.name.split(' ')[0]}!`);
    } catch (err) {
      if (err instanceof ApiError && Array.isArray(err.data?.errors)) {
        const mapped = {};
        err.data.errors.forEach((item) => {
          const field = item.path || item.param;
          if (field && !mapped[field]) mapped[field] = item.msg;
        });
        setErrors(mapped);
      }
      setFormError(errorMessage(err, 'We could not create your account. Please try again.'));
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join Smart Clinic in under a minute"
      footer={
        <p className="text-slate-600">
          Already registered?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4">
            Sign in
          </Link>
        </p>
      }
    >
      {/* Quick Google Sign up */}
      <div className="mb-5">
        <GoogleAuthButton label="Sign up with Google" disabled={submitting || !!user} />
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 font-semibold text-slate-400">Or register with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <ChoiceGroup
          legend="I am joining as"
          value={form.role}
          onChange={(role) => setForm((f) => ({ ...f, role }))}
          options={[
            { value: 'patient', label: 'Patient' },
            { value: 'doctor', label: 'Doctor' },
          ]}
        />

        <TextField
          label="Full name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
          placeholder="e.g. Alex Rivera"
          required
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Phone number"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={form.phone}
            onChange={set('phone')}
            error={errors.phone}
            placeholder="+91 98765 43210"
            required
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            hint="Min. 6 characters"
            required
          />
          <TextField
            label="Confirm password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={set('confirm')}
            error={errors.confirm}
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <TextField
            label="Date of birth"
            name="dateOfBirth"
            type="date"
            max={toDateInputValue()}
            value={form.dateOfBirth}
            onChange={set('dateOfBirth')}
          />
          <SelectField label="Gender" name="gender" value={form.gender} onChange={set('gender')}>
            <option value="">Select</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </SelectField>
          <SelectField label="Blood group" name="bloodGroup" value={form.bloodGroup} onChange={set('bloodGroup')}>
            <option value="">Optional</option>
            {BLOOD_GROUPS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </SelectField>
        </div>

        {formError ? (
          <div role="alert" className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-semibold text-rose-800">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        ) : null}

        <Button type="submit" size="lg" full loading={submitting || !!user} icon={UserPlus} className="mt-2">
          {submitting || user ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
