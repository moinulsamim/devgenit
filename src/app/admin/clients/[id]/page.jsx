"use client";

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import AdminShell from '../../../../components/admin/AdminShell';

const cycles = ['WEEKLY', 'MONTHLY', 'YEARLY', 'NO_RESTRICTION'];
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : 'No due date';

function Field({ label, name, value, onChange, type = 'text', hint }) {
  return <label className="text-sm">{label}<input name={name} type={type} value={value ?? ''} onChange={onChange} className="mt-1 w-full p-2 bg-white border border-[#d6e2df] rounded text-[var(--admin-ink)]" />{hint && <span className="block text-xs text-[var(--admin-muted)] mt-1">{hint}</span>}</label>;
}

export default function ClientProfile({ params }) {
  const { id } = use(params);
  const [client, setClient] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newService, setNewService] = useState({ name: '', amount: '', billingCycle: 'MONTHLY', billingAnchorDay: 1, billingAnchorMonth: 1, firstDueDate: '' });

  async function request(url, options = {}) { const response = await fetch(url, options); const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Request failed'); return data; }
  async function refresh() { setClient(await request(`/api/admin/clients/${id}`)); }
  useEffect(() => { request(`/api/admin/clients/${id}`).then(setClient).catch((reason) => setError(reason.message)).finally(() => setLoading(false)); }, [id]);
  async function saveClient(event) { event.preventDefault(); setSaving(true); setError(''); try { const updated = await request(`/api/admin/clients/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); setClient({ ...client, ...updated }); } catch (reason) { setError(reason.message); } finally { setSaving(false); } }
  async function deleteClient() { if (!window.confirm(`Delete ${client.name} and all of its services and payments? This cannot be undone.`)) return; setError(''); try { await request(`/api/admin/clients/${id}`, { method: 'DELETE' }); window.location.href = '/admin/clients'; } catch (reason) { setError(reason.message); } }
  async function addService(event) { event.preventDefault(); setError(''); try { const created = await request(`/api/admin/clients/${id}/services`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(newService) }); setClient({ ...client, services: [...client.services, created] }); setNewService({ name: '', amount: '', billingCycle: 'MONTHLY', billingAnchorDay: 1, billingAnchorMonth: 1, firstDueDate: '' }); } catch (reason) { setError(reason.message); } }
  async function serviceAction(service, action, body) { if (action === '/delete' && !window.confirm(`Delete ${service.name} and its payment history? This cannot be undone.`)) return; setError(''); try { await request(`/api/admin/services/${service.id}${action === '/delete' ? '' : action}`, { method: action === '' ? 'PATCH' : action === '/delete' ? 'DELETE' : 'POST', headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined }); await refresh(); } catch (reason) { setError(reason.message); } }
  async function claimAction(claim, action, body) { setError(''); try { await request(`/api/admin/payment-claims/${claim.id}${action}`, { method: 'POST', headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined }); await refresh(); } catch (reason) { setError(reason.message); } }
  if (loading) return <AdminShell breadcrumb="Clients"><main className="max-w-5xl mx-auto px-4 sm:px-8 py-10"><div className="animate-pulse h-40 bg-white rounded-xl" /></main></AdminShell>;
  if (!client) return <AdminShell breadcrumb="Clients"><main className="p-16 text-red-700">{error || 'Client not found'}</main></AdminShell>;

  const pendingClaims = client.services.flatMap((service) => (service.paymentClaims || []).map((claim) => ({ ...claim, service })));

  return <AdminShell breadcrumb={`Clients / ${client.name}`}><main className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
    <div className="flex items-center justify-between gap-4">
      <Link href="/admin/clients" className="text-sm text-[var(--admin-teal)]">← Back to clients</Link>
      <button type="button" onClick={deleteClient} className="text-sm text-red-600 hover:text-red-700">Delete client</button>
    </div>
    <h1 className="text-2xl sm:text-3xl font-semibold mt-5">{client.name}</h1>
    {error && <p className="my-5 text-red-700 bg-red-50 p-4 rounded-lg text-sm">{error}</p>}

    {pendingClaims.length > 0 && <div className="mt-6 space-y-3">{pendingClaims.map((claim) => <PendingClaimBanner key={claim.id} claim={claim} onAction={claimAction} />)}</div>}

    <form onSubmit={saveClient} className="admin-card grid sm:grid-cols-2 gap-4 mt-7 p-6"><Field label="Name" name="name" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} /><Field label="Company" name="company" value={client.company} onChange={(e) => setClient({ ...client, company: e.target.value })} /><Field label="Email" name="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} type="email" /><Field label="Phone" name="phone" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} /><button disabled={saving} className="sm:col-span-2 bg-[var(--admin-teal)] text-white px-4 py-2 rounded">{saving ? 'Saving...' : 'Save client details'}</button></form>

    <section className="mt-10">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Services</h2>
      {client.services.length === 0 && <p className="text-[var(--admin-muted)] border border-dashed border-[#cbd9d5] rounded-lg p-6">No services yet.</p>}
      {client.services.map((service) => <ServiceCard key={service.id} service={service} onAction={serviceAction} />)}
    </section>

    <form onSubmit={addService} className="admin-card mt-8 p-6 grid sm:grid-cols-2 gap-4"><h2 className="sm:col-span-2 text-xl font-semibold">Add service</h2><Field label="Service name" name="name" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} /><Field label="Amount" name="amount" type="number" value={newService.amount} onChange={(e) => setNewService({ ...newService, amount: e.target.value })} /><label className="text-sm">Billing cycle<select value={newService.billingCycle} onChange={(e) => setNewService({ ...newService, billingCycle: e.target.value })} className="mt-1 w-full p-2 bg-white border border-[#d6e2df] rounded">{cycles.map((cycle) => <option key={cycle}>{cycle}</option>)}</select></label>{newService.billingCycle !== 'NO_RESTRICTION' && <><Field label="Anchor day" name="billingAnchorDay" type="number" value={newService.billingAnchorDay} onChange={(e) => setNewService({ ...newService, billingAnchorDay: Number(e.target.value) })} /><Field label="Anchor month" name="billingAnchorMonth" type="number" value={newService.billingAnchorMonth} onChange={(e) => setNewService({ ...newService, billingAnchorMonth: Number(e.target.value) })} /><div className="sm:col-span-2"><Field label="First due date (optional)" name="firstDueDate" type="date" value={newService.firstDueDate} onChange={(e) => setNewService({ ...newService, firstDueDate: e.target.value })} hint="Leave blank for a brand-new service starting today. Set a past date only if this client already has an existing, unpaid balance from before they joined the portal." /></div></>}<button className="sm:col-span-2 bg-[var(--admin-teal)] text-white px-4 py-2 rounded">Add service</button></form>
  </main></AdminShell>;
}

function PendingClaimBanner({ claim, onAction }) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  async function confirm() { setBusy(true); await onAction(claim, '/confirm'); setBusy(false); }
  async function reject() { setBusy(true); await onAction(claim, '/reject', { reason }); setBusy(false); setRejecting(false); }

  return (
    <div className="admin-card border-amber-200 bg-amber-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[.14em] font-bold text-amber-700">Payment reported by client</p>
          <h3 className="font-semibold text-amber-900 mt-1">{claim.service.name} · ${Number(claim.claimedAmount).toFixed(2)}</h3>
          <p className="text-sm text-amber-900/80 mt-1">
            {claim.claimedForDate ? `For the cycle due ${formatDate(claim.claimedForDate)}` : 'No specific billing cycle on record'}
            {' · reported ' + formatDate(claim.createdAt)}
          </p>
          {claim.note && <p className="text-sm text-amber-900/70 mt-2 italic">"{claim.note}"</p>}
        </div>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button type="button" disabled={busy} onClick={confirm} className="flex-1 sm:flex-none bg-emerald-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-semibold">Confirm payment</button>
          <button type="button" disabled={busy} onClick={() => setRejecting((v) => !v)} className="flex-1 sm:flex-none border border-amber-300 text-amber-800 px-4 py-2 rounded text-sm">Reject</button>
        </div>
      </div>
      {rejecting && (
        <div className="mt-4 flex flex-wrap gap-2">
          <input type="text" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="flex-1 min-w-[200px] p-2 bg-white border border-amber-300 rounded text-sm" />
          <button type="button" disabled={busy} onClick={reject} className="bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm">Confirm rejection</button>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ service, onAction }) {
  const [edit, setEdit] = useState({ name: service.name, amount: String(service.amount), billingCycle: service.billingCycle, billingAnchorDay: service.billingAnchorDay || 1, billingAnchorMonth: service.billingAnchorMonth || 1 });

  return (
    <article className="border rounded-xl p-4 sm:p-5 mb-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h3 className="text-xl font-medium">{service.name}</h3>
          <p>${Number(service.amount).toFixed(2)} · {service.billingCycle} · due {formatDate(service.nextDueDate)}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-white/10 text-sm">{service.status}</span>
      </div>

      <div className="grid sm:grid-cols-4 gap-2 mt-5">
        <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} className="p-2 bg-white border rounded" />
        <input type="number" value={edit.amount} onChange={(e) => setEdit({ ...edit, amount: e.target.value })} className="p-2 bg-white border rounded" />
        <select value={edit.billingCycle} onChange={(e) => setEdit({ ...edit, billingCycle: e.target.value })} className="p-2 bg-white border rounded">{cycles.map((cycle) => <option key={cycle}>{cycle}</option>)}</select>
        <button type="button" onClick={() => onAction(service, '', edit)} className="bg-[var(--admin-teal)] text-white rounded px-3">Save service</button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {service.status === 'BLOCKED' && <button type="button" onClick={() => onAction(service, '/unblock')} className="bg-sky-600 text-white px-3 py-2 rounded">Unblock</button>}
        <button type="button" onClick={() => onAction(service, '/delete')} className="border border-red-300 text-red-600 px-3 py-2 rounded">Delete service</button>
      </div>

      <div className="mt-5 text-sm">
        <p className="mb-2 font-medium">Payment history</p>
        {(service.payments || []).length === 0 ? <p>No payments.</p> : <ul className="space-y-1">{service.payments.map((paymentRecord) => <li key={paymentRecord.id}>{paymentRecord.invoiceNumber} · ${Number(paymentRecord.amountPaid).toFixed(2)} · {formatDate(paymentRecord.paidOn)}{paymentRecord.receiptFileUrl && <> · <a className="text-[var(--admin-teal)] underline" href={paymentRecord.receiptFileUrl}>Receipt</a></>}</li>)}</ul>}
      </div>
    </article>
  );
}