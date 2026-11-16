import {
  BarChart3,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  Home,
  LayoutDashboard,
  ListOrdered,
  Settings,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';

// Navigation per role. Each role has its own dashboard area (/patient, /doctor, /admin).
export const NAV_ITEMS = {
  patient: [
    { href: '/patient/dashboard', label: 'Home', icon: Home },
    { href: '/patient/book', label: 'Book a Visit', icon: CalendarPlus },
    { href: '/patient/queue', label: 'Live Queue', icon: ListOrdered },
    { href: '/patient/appointments', label: 'My Appointments', icon: CalendarCheck },
    { href: '/patient/profile', label: 'My Profile', icon: UserRound },
  ],
  doctor: [
    { href: '/doctor/dashboard', label: 'Today', icon: LayoutDashboard },
    { href: '/doctor/queue', label: 'Patient Queue', icon: ListOrdered },
    { href: '/doctor/settings', label: 'Clinic Settings', icon: Settings },
    { href: '/doctor/profile', label: 'My Profile', icon: UserRound },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/appointments', label: 'Appointments', icon: ClipboardList },
    { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { href: '/admin/patients', label: 'Patients', icon: Users },
    { href: '/admin/slots', label: 'Time Slots', icon: CalendarClock },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/profile', label: 'My Profile', icon: UserRound },
  ],
};
