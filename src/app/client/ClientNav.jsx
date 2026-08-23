"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronDown, FileText, LayoutDashboard, LogOut, Package, UserRound } from 'lucide-react';

const links = [
  { href: '/client/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/client/payments', label: 'Invoices', icon: FileText },
  { href: '/client/dashboard', label: 'Services', icon: Package },
  { href: '/client/dashboard', label: 'Account', icon: UserRound },
];

export default function ClientNav({ client }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch('/api/client/logout', { method: 'POST' });
    router.push('/client/login');
    router.refresh();
  }
  return <aside className="client-rail fixed inset-y-0 left-0 z-20 w-44 p-4 text-white flex flex-col"><Link href="/client/dashboard" className="flex items-center gap-2 mb-12"><span className="w-8 h-8 rounded-lg bg-[#c9f15e] text-[#17243a] font-bold flex items-center justify-center">D.</span><span className="client-brand-text font-semibold text-sm">devgenit.</span></Link><p className="client-nav-label text-[8px] tracking-[.18em] uppercase text-slate-400 mb-4">Workspace</p><nav className="space-y-1">{links.map(({ href, label, icon: Icon }, index) => { const active = index === 0 ? pathname === '/client/dashboard' : index === 1 ? pathname === '/client/payments' : false; return <Link key={label} href={href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${active ? 'bg-slate-500/30 text-white' : 'text-slate-300 hover:bg-white/10'}`}><Icon size={14} /><span className="client-nav-text">{label}</span>{active && <span className="ml-auto w-1 h-1 rounded-full bg-[#c9f15e]" />}</Link>; })}</nav><div className="client-support mt-auto"><div className="border border-white/10 bg-white/[.04] rounded-xl p-3 mb-4 text-[10px] text-slate-300"><p className="tracking-[.15em] uppercase text-[7px] text-slate-400 mb-3">Need a hand?</p><p className="leading-4">Your DevGenit team is close when you need context.</p><a href="mailto:connect@devgenit.com" className="text-[#c9f15e] inline-block mt-3">Contact support ↗</a></div><button type="button" onClick={logout} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-2"><LogOut size={13} /> <span className="client-nav-text">Sign out</span></button></div></aside>;
}

export function ClientTopbar({ client }) {
  return <header className="h-14 border-b border-[#e8e4da] bg-[#fbfaf6]/90 flex items-center justify-between px-7"><div className="text-[10px] text-slate-500">Client portal <span className="mx-2">/</span> <strong className="text-slate-700">{client.name}</strong></div><div className="flex items-center gap-4 text-slate-500"><Bell size={14} /><span className="w-7 h-7 rounded-full bg-[#dceee8] text-[#32796e] text-[9px] font-bold flex items-center justify-center">{client.name.slice(0, 2).toUpperCase()}</span><div className="hidden sm:block text-[10px]"><strong className="block text-slate-700">Client account</strong><span className="text-[8px]">DevGenit workspace</span></div><ChevronDown size={12} /></div></header>;
}
