"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, ChevronRight, CircleHelp, LayoutDashboard, LogOut, Menu, Settings, Users, X, Zap } from 'lucide-react';

const links = [{ href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard }, { href: '/admin/clients', label: 'Clients', icon: Users }, { href: '/admin/settings', label: 'Settings', icon: Settings }];

export default function AdminShell({ children, breadcrumb = 'Overview' }) {
  const pathname = usePathname(); const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/payment-claims/pending-count')
      .then((response) => response.ok ? response.json() : { count: 0 })
      .then((data) => { if (!cancelled) setPendingCount(data.count || 0); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pathname]);

  // Close the mobile drawer automatically on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function logout() { await fetch('/api/admin/logout', { method: 'POST' }); router.push('/admin/login'); router.refresh(); }

  return <div className="admin-page min-h-screen flex">
    {mobileOpen && (
      <div
        className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
    )}

    <aside className={`admin-rail w-52 shrink-0 bg-[var(--admin-sidebar)] text-white min-h-screen p-4 flex flex-col ${mobileOpen ? 'admin-rail-open' : ''}`}>
      <div className="flex items-center justify-between mb-9">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-[var(--admin-mint)] text-[var(--admin-ink)] flex items-center justify-center font-bold">D</span>
          <span><strong className="block text-sm">devgenit</strong><small className="block text-[7px] tracking-[.25em] text-teal-200">ADMIN CONSOLE</small></span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-teal-50/70 hover:bg-white/10"
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-[8px] uppercase tracking-[.2em] text-teal-200/60 mb-3">Workspace</p>
      <nav className="space-y-1">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] ${pathname === href || (label === 'Clients' && pathname.startsWith('/admin/clients')) ? 'bg-[var(--admin-sidebar-soft)] text-white' : 'text-teal-50/70 hover:bg-white/5 hover:text-white'}`}><Icon size={14} /><span className="flex-1">{label}</span>{label === 'Clients' && pendingCount > 0 && <span className="min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">{pendingCount > 9 ? '9+' : pendingCount}</span>}</Link>)}</nav>

      <div className="mt-auto"><div className="rounded-lg border border-white/10 p-3 mb-5 text-[10px] text-teal-50/80"><CircleHelp size={13} className="mb-2" /><p>Need a hand?</p><a href="mailto:connect@devgenit.com" className="text-teal-200">Contact support <ChevronRight size={11} className="inline" /></a></div><div className="border-t border-white/10 pt-4 flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[var(--admin-mint)] text-[var(--admin-ink)] text-[9px] font-bold flex items-center justify-center">MA</span><div className="flex-1"><p className="text-[10px] font-semibold">Admin user</p><p className="text-[8px] text-teal-100/60">Administrator</p></div><button title="Log out" onClick={logout} className="text-teal-100/60 hover:text-white"><LogOut size={13} /></button></div></div>
    </aside>

    <section className="flex-1 min-w-0">
      <header className="h-11 border-b border-[#e2ebea] bg-white/80 flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="lg:hidden w-7 h-7 -ml-1 rounded-lg flex items-center justify-center text-[var(--admin-muted)] hover:bg-slate-100"
          >
            <Menu size={16} />
          </button>
          <div className="flex items-center gap-2 text-[9px] text-[var(--admin-muted)]">
            <span className="hidden sm:inline">Admin console</span>
            <ChevronRight size={11} className="hidden sm:inline" />
            <strong className="text-[var(--admin-ink)]">{breadcrumb}</strong>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[var(--admin-muted)]"><Bell size={13} /><span className="w-7 h-7 rounded-full bg-[var(--admin-mint)] text-[var(--admin-teal)] text-[9px] font-bold flex items-center justify-center">MA</span></div>
      </header>
      {children}
    </section>
  </div>;
}