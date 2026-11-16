export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Appointment status -> label + colour tone used by <StatusBadge />.
export const STATUS_META = {
  booked: { label: 'Booked', tone: 'info' },
  'in-progress': { label: 'With doctor', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
  missed: { label: 'Missed', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const APPOINTMENT_FILTERS = [
  { value: '', label: 'All' },
  { value: 'booked', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
  { value: 'missed', label: 'Missed' },
  { value: 'cancelled', label: 'Cancelled' },
];
