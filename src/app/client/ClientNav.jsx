"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  UserRound,
  AlertTriangle,
  Clock3,
  X,
  Menu,
} from 'lucide-react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const links = [
  { href: '/client/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/client/payments', label: 'Invoices', icon: FileText },
  { href: '/client/dashboard', label: 'Services', icon: Package },
  { href: '/client/dashboard', label: 'Account', icon: UserRound },
];

// --- Shared mobile-drawer state ---------------------------------------
// ClientNav and ClientTopbar are rendered as siblings (not nested) in
// page.jsx, so they need a shared source of truth for whether the
// mobile drawer is open. A small context is the cleanest way to do
// that without turning page.jsx into a client component.
const MobileNavContext = createContext(null);

export function MobileNavProvider({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <MobileNavContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileNavContext.Provider>
  );
}

function useMobileNav() {
  // Fallback keeps things from crashing if a page forgets the provider —
  // sidebar just behaves as always-closed-on-mobile in that case.
  return useContext(MobileNavContext) ?? { open: false, setOpen: () => {} };
}

function getDaysUntilDue(nextDueDate) {
  if (!nextDueDate) return null;

  const now = new Date();
  const due = new Date(nextDueDate);

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  return Math.ceil((dueDay.getTime() - today.getTime()) / 86400000);
}

function buildNotifications(services = []) {
  return services
    .map((service) => {
      const daysLeft = getDaysUntilDue(service.nextDueDate);

      if (daysLeft === null || daysLeft > 7) return null;

      if (daysLeft >= 4) {
        return {
          id: `${service.id}-due-${daysLeft}`,
          serviceId: service.id,
          serviceName: service.name,
          daysLeft,
          severity: 'warning',
          icon: Clock3,
          title: `${daysLeft} days left`,
          message:
            daysLeft === 7
              ? `Your ${service.name} payment is due in 7 days.`
              : `Your ${service.name} payment is due in ${daysLeft} days.`,
        };
      }

      if (daysLeft >= 1) {
        return {
          id: `${service.id}-due-${daysLeft}`,
          serviceId: service.id,
          serviceName: service.name,
          daysLeft,
          severity: 'critical',
          icon: AlertTriangle,
          title: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
          message:
            daysLeft === 1
              ? `Your ${service.name} payment is due tomorrow. Please take action.`
              : `Your ${service.name} payment is due in ${daysLeft} days. Please take action.`,
        };
      }

      return {
        id: `${service.id}-overdue`,
        serviceId: service.id,
        serviceName: service.name,
        daysLeft: 0,
        severity: 'critical',
        icon: AlertTriangle,
        title: 'Payment due',
        message: `Your ${service.name} payment is due now. Please make the payment as soon as possible.`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

export default function ClientNav({ client }) {
  const pathname = usePathname();
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const panelRef = useRef(null);
  const { open, setOpen } = useMobileNav();

  const notifications = buildNotifications(client?.services || []);
  const notificationCount = notifications.length;

  useEffect(() => {
    function handleOutsideClick(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function logout() {
    await fetch('/api/client/logout', { method: 'POST' });
    router.push('/client/login');
    router.refresh();
  }

  return (
    <>
      {/* Backdrop — mobile only, closes drawer on tap outside */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`client-rail fixed inset-y-0 left-0 z-40 w-64 lg:w-44 p-4 text-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-12">
          <Link href="/client/dashboard" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#c9f15e] text-[#17243a] font-bold flex items-center justify-center">
              D.
            </span>

            <span className="client-brand-text font-semibold text-sm">
              devgenit.
            </span>
          </Link>

          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <p className="client-nav-label text-[8px] tracking-[.18em] uppercase text-slate-400 mb-4">
          Workspace
        </p>

        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon }, index) => {
            const active =
              index === 0
                ? pathname === '/client/dashboard'
                : index === 1
                  ? pathname === '/client/payments'
                  : false;

            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  active
                    ? 'bg-slate-500/30 text-white'
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon size={14} />

                <span className="client-nav-text">
                  {label}
                </span>

                {active && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-[#c9f15e]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="client-support mt-auto">
          <div className="border border-white/10 bg-white/[.04] rounded-xl p-3 mb-4 text-[10px] text-slate-300">
            <p className="tracking-[.15em] uppercase text-[7px] text-slate-400 mb-3">
              Need a hand?
            </p>

            <p className="leading-4">
              Your DevGenit team is close when you need context.
            </p>

            <a
              href="mailto:connect@devgenit.com"
              className="text-[#c9f15e] inline-block mt-3"
            >
              Contact support ↗
            </a>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-2"
          >
            <LogOut size={13} />
            <span className="client-nav-text">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function ClientTopbar({ client }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const panelRef = useRef(null);
  const { setOpen } = useMobileNav();

  const notifications = buildNotifications(client?.services || []);
  const notificationCount = notifications.length;

  useEffect(() => {
    function handleOutsideClick(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <header className="h-14 border-b border-[#e8e4da] bg-[#fbfaf6]/90 flex items-center justify-between px-5 lg:px-7 relative">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="lg:hidden w-8 h-8 -ml-1 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100"
        >
          <Menu size={18} />
        </button>

        <div className="text-[10px] text-slate-500">
          Client portal
          <span className="mx-2 hidden sm:inline">/</span>
          <strong className="text-slate-700 hidden sm:inline">{client.name}</strong>
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-500">
        <div ref={panelRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
          >
            <Bell
              size={15}
              className={
                notificationCount > 0
                  ? 'text-[#17243a]'
                  : 'text-slate-500'
              }
            />

            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#d94b43] text-white text-[8px] font-bold flex items-center justify-center border-2 border-[#fbfaf6]">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-11 w-[350px] max-w-[calc(100vw-2rem)] bg-white border border-[#e5e1d8] rounded-2xl shadow-[0_20px_55px_rgba(36,40,45,.14)] overflow-hidden z-50">
              <div className="px-5 py-4 border-b border-[#eeeae2] flex items-center justify-between">
                <div>
                  <p className="text-[8px] uppercase tracking-[.18em] font-bold text-[#72908c]">
                    Notifications
                  </p>

                  <h3 className="text-sm font-semibold text-[#1d293b] mt-1">
                    Payment reminders
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Close notifications"
                  className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center"
                >
                  <X size={13} />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#e8f0eb] text-[#32796e] flex items-center justify-center">
                    <Bell size={16} />
                  </div>

                  <p className="text-sm font-semibold text-[#1d293b] mt-4">
                    You're all caught up
                  </p>

                  <p className="text-[10px] text-slate-500 mt-2 leading-4">
                    There are no upcoming payment reminders right now.
                  </p>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto">
                  {notifications.map((notification) => {
                    const critical =
                      notification.severity === 'critical';

                    const Icon = notification.icon;

                    return (
                      <div
                        key={notification.id}
                        className={`px-5 py-4 border-b border-[#eeeae2] last:border-b-0 ${
                          critical
                            ? 'bg-[#fff4f2]'
                            : 'bg-[#fffbea]'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${
                              critical
                                ? 'bg-[#fde1dd] text-[#c4473e]'
                                : 'bg-[#fff0bf] text-[#a36c00]'
                            }`}
                          >
                            <Icon size={16} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p
                                  className={`text-[11px] font-bold ${
                                    critical
                                      ? 'text-[#a93630]'
                                      : 'text-[#8a6200]'
                                  }`}
                                >
                                  {notification.title}
                                </p>

                                <p className="text-[9px] font-semibold text-[#1d293b] mt-1">
                                  {notification.serviceName}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 px-2 py-1 rounded-full text-[7px] uppercase tracking-[.12em] font-bold ${
                                  critical
                                    ? 'bg-[#f8d8d5] text-[#a63838]'
                                    : 'bg-[#f8e9bb] text-[#8a6200]'
                                }`}
                              >
                                {critical ? 'Urgent' : 'Reminder'}
                              </span>
                            </div>

                            <p className="text-[9px] text-slate-600 leading-4 mt-2">
                              {notification.message}
                            </p>

                            <Link
                              href="/client/payments"
                              onClick={() => setNotificationsOpen(false)}
                              className={`inline-flex mt-3 text-[8px] font-bold uppercase tracking-[.12em] ${
                                critical
                                  ? 'text-[#b43d36]'
                                  : 'text-[#8a6200]'
                              }`}
                            >
                              View invoices →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <span className="w-7 h-7 rounded-full bg-[#dceee8] text-[#32796e] text-[9px] font-bold flex items-center justify-center">
          {client.name.slice(0, 2).toUpperCase()}
        </span>

        <div className="hidden sm:block text-[10px]">
          <strong className="block text-slate-700">
            Client account
          </strong>

          <span className="text-[8px]">
            DevGenit workspace
          </span>
        </div>

        <ChevronDown size={12} />
      </div>
    </header>
  );
}