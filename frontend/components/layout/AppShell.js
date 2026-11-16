'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS } from '@/lib/navigation';
import { homePathForRole, cn } from '@/lib/utils';
import { Avatar } from '@/components/common/Avatar';
import { Logo } from '@/components/layout/Logo';

const ROLE_META = {
  patient: { label: 'Patient', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  doctor: { label: 'Doctor', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  admin: { label: 'Administrator', badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
};

function NavLink({ item, active, onNavigate, variant }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-10 items-center gap-2.5 rounded-xl px-3.5 text-sm font-semibold tracking-tight transition-all duration-150',
        variant === 'dark'
          ? active
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
            : 'text-slate-300 hover:bg-white/10 hover:text-white'
          : active
            ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-blue-500' : 'text-slate-400')} aria-hidden="true" />
      {item.label}
    </Link>
  );
}

/**
 * Modern page chrome shared by every dashboard.
 * Features frosted glass top bar, role-based pill tags, and clean navigation.
 */
export function AppShell({ role, children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = NAV_ITEMS[role] || [];
  const sidebar = role === 'admin';
  const roleMeta = ROLE_META[role] || ROLE_META.patient;

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50/70 text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none fixed -top-40 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-500/10 blur-[130px]" />
      <div className="pointer-events-none fixed top-1/2 left-[-15rem] h-[36rem] w-[36rem] rounded-full bg-indigo-500/10 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-[-10rem] right-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="pointer-events-none fixed inset-0 bg-grid-slate opacity-35" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-pop"
      >
        Skip to main content
      </a>

      {/* Modern Frosted Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo href={homePathForRole(role)} light />

          {!sidebar ? (
            <nav aria-label="Main" className="hidden items-center gap-1.5 lg:flex">
              {items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item.href)} variant="dark" />
              ))}
            </nav>
          ) : null}

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 text-white sm:flex rounded-2xl border border-white/10 bg-white/5 py-1.5 pl-2 pr-3.5 backdrop-blur-sm">
              <Avatar name={user?.name} size="sm" />
              <div className="leading-tight">
                <p className="max-w-[10rem] truncate text-xs font-bold text-white">{user?.name}</p>
                <span
                  className={cn(
                    'inline-block mt-0.5 rounded-full border px-1.5 py-0.2 text-[10px] font-semibold',
                    roleMeta.badge
                  )}
                >
                  {roleMeta.label}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="hidden min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-slate-200 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300 sm:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={cn(
                'inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-semibold text-white hover:bg-white/10',
                'lg:hidden'
              )}
            >
              {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
              Menu
            </button>
          </div>
        </div>

        {/* Mobile / tablet drawer */}
        {menuOpen ? (
          <div id="mobile-menu" className="border-t border-slate-800 bg-slate-900/95 px-4 pb-4 pt-3 backdrop-blur-xl lg:hidden">
            <nav aria-label="Main" className="flex flex-col gap-1">
              {items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  variant="dark"
                  onNavigate={() => setMenuOpen(false)}
                />
              ))}
            </nav>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-white">
              <div className="flex items-center gap-3">
                <Avatar name={user?.name} size="sm" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <span
                    className={cn(
                      'inline-block mt-0.5 rounded-full border px-1.5 py-0.2 text-[10px] font-semibold',
                      roleMeta.badge
                    )}
                  >
                    {roleMeta.label}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-slate-200 hover:bg-rose-500/20 hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <div className={cn('mx-auto flex max-w-7xl', sidebar && 'lg:gap-6 lg:px-6')}>
        {sidebar ? (
          <aside className="hidden w-64 shrink-0 py-8 lg:block">
            <nav aria-label="Admin sections" className="sticky top-24 flex flex-col gap-1 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-card">
              {items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item.href)} />
              ))}
            </nav>
          </aside>
        ) : null}

        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-8 outline-none sm:px-6 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
