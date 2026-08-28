"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, Search, Users } from 'lucide-react';
import AdminShell from '../../../components/admin/AdminShell';

const order = { ACTIVE: 1, DUE_SOON: 2, OVERDUE: 3, BLOCKED: 4 };
const labels = { ACTIVE: 'Healthy', DUE_SOON: 'Attention', OVERDUE: 'Overdue', BLOCKED: 'Overdue' };
const tones = { ACTIVE: 'bg-emerald-50 text-emerald-700', DUE_SOON: 'bg-amber-50 text-amber-700', OVERDUE: 'bg-red-50 text-red-700', BLOCKED: 'bg-red-50 text-red-700' };
function status(services) { return (services || []).reduce((worst, item) => order[item.status] > order[worst] ? item.status : worst, 'ACTIVE'); }
function initials(name) { return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); }
function pendingClaimsCount(services) { return (services || []).reduce((sum, service) => sum + (service.paymentClaims?.length || 0), 0); }

export default function ClientsPage() {
  const [clients, setClients] = useState([]); const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All'); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/admin/clients').then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Unable to load clients'); setClients(data); }).catch((reason) => setError(reason.message)).finally(() => setLoading(false)); }, []);
  const visible = clients.filter((client) => { const current = status(client.services); const matchesFilter = filter === 'All' || labels[current] === filter; const term = query.toLowerCase(); return matchesFilter && (!term || `${client.name} ${client.company || ''} ${client.email}`.toLowerCase().includes(term)); });
  const totalPending = clients.reduce((sum, client) => sum + pendingClaimsCount(client.services), 0);
  return <AdminShell breadcrumb="Clients"><main className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-7">
      <div>
        <p className="admin-label">Portfolio directory</p>
        <h1 className="text-2xl sm:text-3xl font-semibold mt-2">Clients</h1>
        <p className="text-sm text-[var(--admin-muted)] mt-1">
          Monitor every relationship, subscription, and open balance.
          {totalPending > 0 && <span className="block sm:inline text-red-600 font-semibold sm:before:content-['·_']"> {totalPending} payment report{totalPending === 1 ? '' : 's'} awaiting confirmation</span>}
        </p>
      </div>
      <Link href="/admin/clients/new" className="bg-[var(--admin-teal)] text-white text-xs font-semibold px-4 py-3 rounded-md text-center shrink-0">+ &nbsp; Add client</Link>
    </div>
    {error && <p className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</p>}
    <section className="admin-card overflow-hidden">
      <div className="p-4 border-b border-[#edf2f0] flex flex-col sm:flex-row flex-wrap gap-3 sm:justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-[#94a7a2]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients or companies..." className="h-9 w-full sm:w-64 max-w-full rounded-md border border-[#dce7e3] pl-9 pr-3 text-xs outline-none focus:border-[var(--admin-teal)]" />
        </div>
        <div className="flex gap-1 rounded-md bg-[#f2f7f5] p-1 overflow-x-auto">
          {['All', 'Healthy', 'Attention', 'Overdue'].map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 px-3 py-1.5 rounded text-[10px] ${filter === item ? 'bg-white text-[var(--admin-teal)] shadow-sm font-semibold' : 'text-[#80918e]'}`}>{item}</button>)}
        </div>
      </div>
      {loading ? <div className="animate-pulse h-56 bg-white" /> : visible.length === 0 ? <div className="p-12 text-center text-sm text-[var(--admin-muted)]"><Users className="mx-auto mb-2" size={20} />No matching clients.</div> : <div>{visible.map((client) => {
        const current = status(client.services); const services = client.services || []; const amount = services.reduce((sum, service) => sum + Number(service.amount), 0); const pending = pendingClaimsCount(services);
        return <Link href={`/admin/clients/${client.id}`} key={client.id} className="flex items-center gap-3 px-4 py-4 border-b last:border-0 border-[#edf2f0] hover:bg-[#f8fbfa]">
          <span className="relative w-9 h-9 shrink-0 rounded-full bg-[#d9eee9] text-[var(--admin-teal)] text-[10px] font-semibold flex items-center justify-center">
            {initials(client.name)}
            {pending > 0 && <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">{pending > 9 ? '9+' : pending}</span>}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-semibold truncate">{client.name}</p>
              {pending > 0 && <span className="shrink-0 text-[8px] font-bold uppercase tracking-[.08em] text-red-600">Payment reported</span>}
            </div>
            <p className="text-[10px] text-[var(--admin-muted)] truncate">{client.company || client.email}</p>
          </div>
          <div className="w-24 hidden sm:block">
            <span className={`px-2 py-1 rounded-full text-[9px] font-semibold ${tones[current]}`}>{labels[current]}</span>
            <p className="text-[9px] text-[var(--admin-muted)] mt-1">{services.length} active services</p>
          </div>
          <div className="text-right w-20"><p className="text-xs font-semibold">${amount.toLocaleString()}</p><p className="text-[9px] text-[var(--admin-muted)]">monthly</p></div>
          <ChevronRight size={14} className="text-[#a9b8b4] shrink-0" />
        </Link>;
      })}</div>}
    </section>
  </main>
  </AdminShell>;
}