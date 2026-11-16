// Small, framework-free helpers shared across the app.

export function cn(...parts) {
  return parts.filter(Boolean).join(' ');
}

const pad = (n) => String(n).padStart(2, '0');

/** Date -> "YYYY-MM-DD" in the user's LOCAL time zone (toISOString would use UTC). */
export function toDateInputValue(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "YYYY-MM-DD" -> Date at local midnight. */
export function parseDateString(value) {
  if (!value) return null;
  const [y, m, d] = String(value).split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** "2026-03-14" -> "14 Mar 2026" */
export function formatDate(value) {
  const d = parseDateString(value);
  if (!d) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "2026-03-14" -> "Saturday, 14 March 2026" */
export function formatLongDate(value) {
  const d = value instanceof Date ? value : parseDateString(value);
  if (!d) return '—';
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function weekdayName(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/** "14:30" -> "2:30 PM" */
export function formatTime(value) {
  if (!value) return '—';
  if (value === 'EMERGENCY') return 'Emergency';
  const [h, m] = String(value).split(':');
  const hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return value;
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

/** True when "HH:MM" on the given local date is already in the past. */
export function isPastSlot(dateStr, timeStr, now = new Date()) {
  if (dateStr !== toDateInputValue(now)) return dateStr < toDateInputValue(now);
  const [h, m] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(h)) return false;
  return h * 60 + (m || 0) <= now.getHours() * 60 + now.getMinutes();
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function firstName(name = '') {
  return String(name).trim().split(/\s+/)[0] || '';
}

export function initials(name = '') {
  const parts = String(name).replace(/^dr\.?\s+/i, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** Always renders "Dr. Name" exactly once (seed data already stores "Dr. Sharma"). */
export function doctorName(name) {
  const clean = String(name || '').replace(/^dr\.?\s+/i, '').trim();
  return clean ? `Dr. ${clean}` : 'Doctor';
}

/** Pulls the doctor's display name out of a populated doctor document. */
export function doctorDisplayName(doctor) {
  return doctorName(doctor?.userId?.name);
}

export function homePathForRole(role) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'doctor') return '/doctor/dashboard';
  return '/patient/dashboard';
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Only follow same-site relative redirects (prevents open-redirect via ?next=). */
export function safeNextPath(next) {
  if (typeof next !== 'string') return null;
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return null;
  return next;
}
