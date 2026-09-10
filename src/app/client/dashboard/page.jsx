import { redirect } from 'next/navigation';
import { getCurrentClient } from '../../../lib/getCurrentClient';
import ClientNav, { ClientTopbar, MobileNavProvider } from '../ClientNav';

const cycleLabels = { WEEKLY: 'Weekly', MONTHLY: 'Monthly', YEARLY: 'Yearly', NO_RESTRICTION: 'No fixed schedule' };
const statusStyles = { ACTIVE: 'client-status-active', DUE_SOON: 'client-status-due', OVERDUE: 'client-status-overdue', BLOCKED: 'client-status-blocked' };
const statusLabels = { ACTIVE: 'Active', DUE_SOON: 'Due soon', OVERDUE: 'Overdue', BLOCKED: 'Blocked' };
const date = (value) => value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No fixed due date';
const currentHour = new Date().getHours();

const greeting =
  currentHour >= 5 && currentHour < 12
    ? 'Good morning'
    : currentHour >= 12 && currentHour < 17
      ? 'Good afternoon'
      : currentHour >= 17 && currentHour < 21
        ? 'Good evening'
        : 'Good night';

// Computed directly from nextDueDate rather than the stored status field,
// since status only updates once a day via the cron job — this way a
// client sees the alert the moment their due date actually arrives,
// not hours later once the next cron run catches up.
function isPastDue(service) {
  if (!service.nextDueDate || service.billingCycle === 'NO_RESTRICTION') return false;
  const due = new Date(service.nextDueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due <= today;
}

// Same live computation for the 7-day warning window, matching the
// notification bell in ClientNav so every banner/card on this page
// agrees with each other instead of waiting for the daily cron run.
function isDueSoon(service) {
  if (!service.nextDueDate || service.billingCycle === 'NO_RESTRICTION') return false;
  const due = new Date(service.nextDueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  return days > 0 && days <= 7;
}

function ServiceCard({ service, index }) {
  const accents = ['#e777dc', '#13d7d4', '#354052'];
  return <article className="client-card p-5"><div className="flex items-start justify-between gap-3"><span className="text-sm font-semibold" style={{ color: accents[index % accents.length] }}>{service.name.slice(0, 1).toUpperCase()}</span><span className={`px-2.5 py-1 rounded-full text-[9px] font-semibold ${statusStyles[service.status]}`}>• {statusLabels[service.status]}</span></div><h2 className="text-sm font-semibold mt-5">{service.name}</h2><p className="client-muted text-[10px] mt-2">{cycleLabels[service.billingCycle]} billing and service access.</p><div className="mt-7"><div className="flex justify-between text-[9px] client-muted"><span>Next due date</span><strong className="text-slate-700">{date(service.nextDueDate)}</strong></div><div className="h-1.5 bg-[#e9e7df] rounded-full mt-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: service.status === 'ACTIVE' ? '76%' : '100%', backgroundColor: accents[index % accents.length] }} /></div></div><div className="flex justify-between items-center mt-5"><span className="text-[10px] client-muted">Current amount</span><strong className="text-sm">৳ {Number(service.amount).toFixed(2)}</strong></div></article>;
}

export default async function ClientDashboard() {
  const client = await getCurrentClient();
  if (!client) redirect('/client/login');
  const services = client.services || [];
  const overdue = services.filter(isPastDue);
  // Live 7-day window (matches the notification bell), excluding anything
  // already past due so the two banners never overlap.
  const dueSoonOnly = services.filter((service) => isDueSoon(service) && !isPastDue(service));
  // Synced with the overdue banner above: a service needs attention when its
  // due date has actually passed OR when its stored status says so. Relying
  // on stored status alone showed "$0.00 / on track" on this card while the
  // overdue banner was visible, because status only updates once a day via
  // the cron job.
  const attention = services.filter((service) => isPastDue(service) || ['DUE_SOON', 'OVERDUE', 'BLOCKED'].includes(service.status));
  const totalDue = attention.reduce((sum, service) => sum + Number(service.amount), 0);
  const active = services.filter((service) => service.status === 'ACTIVE').length;
  return <MobileNavProvider><div className="client-page"><ClientNav client={client} /><div className="client-content lg:ml-44"><ClientTopbar client={client} /><main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-9">

    {overdue.length > 0 && (
      <div className="mb-6 border-2 border-red-300 bg-red-50 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 shrink-0 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-lg font-bold">!</span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[.14em] font-bold text-red-700">Payment overdue</p>
            <h2 className="text-sm sm:text-base font-semibold text-red-900 mt-1">
              {overdue.length === 1 ? overdue[0].name : `${overdue.length} services`} need{overdue.length === 1 ? 's' : ''} immediate attention
            </h2>
            <p className="text-xs text-red-800/80 mt-1">
              {overdue.map((service) => service.name).join(', ')} — payment {overdue.length === 1 ? 'was' : 'were'} due on {date(overdue[0].nextDueDate)} and hasn't been completed yet.
            </p>
            <a href="/client/services" className="inline-block mt-3 bg-red-700 text-white text-[11px] font-semibold px-4 py-2 rounded-lg">
              Resolve now
            </a>
          </div>
        </div>
      </div>
    )}

    <div className="flex justify-between items-end mb-7"><div><p className="client-label">{greeting}, {client.name.split(' ')[0]}.</p><h1 className="text-3xl font-semibold tracking-tight mt-3">Your account, at a glance.</h1><p className="client-muted text-xs mt-2">Everything important about your digital services, in one calm place.</p></div><span className="hidden sm:block text-xs border border-[#ddd9ce] bg-white/70 rounded-lg px-4 py-2">Manage account ↗</span></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5"><Summary title="Current due" value={`৳ ${totalDue.toFixed(2)}`} hint={attention.length ? 'Needs your attention' : 'You are on track'} tone={attention.length ? 'warning' : undefined} /><Summary title="Subscription" value={services[0]?.name || 'None yet'} hint={services[0] ? `Renews ${date(services[0].nextDueDate)}` : 'No services assigned'} /><Summary title="Active services" value={active.toString().padStart(2, '0')} hint="Purchased services in motion" /><Summary title="Invoices" value={services.reduce((sum, service) => sum + (service.payments?.length || 0), 0).toString().padStart(2, '0')} hint="Statements in your history" /></div>

    {dueSoonOnly.length > 0 && <div className="mb-5 border border-[#f0d9c9] bg-[#fff7ee] rounded-xl p-4 text-xs text-[#85583d]">{dueSoonOnly.map((service) => <p key={service.id}><strong>{service.name}</strong> is coming due on {date(service.nextDueDate)}.</p>)}</div>}

    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4 mb-8"><section className="client-card p-5 min-h-[190px]"><div className="flex justify-between"><div><p className="client-label">Subscription pulse</p><h2 className="text-lg font-semibold mt-3">{services[0] ? 'Your service cycle is active' : 'Your service overview'}</h2></div><span className="text-[#3d9d91]">▦</span></div><p className="client-muted text-[10px] mt-4">{services[0] ? `Next payment is scheduled for ${date(services[0].nextDueDate)}.` : 'Services assigned by your DevGenit team will appear here.'}</p><div className="h-1.5 bg-[#e9e7df] rounded-full mt-7"><div className="h-full w-2/3 bg-[#3d9d91] rounded-full" /></div><div className="flex justify-between text-[10px] mt-4"><span className="client-muted">Monthly investment</span><strong>৳ {totalDue.toFixed(2)}</strong></div></section><section className="client-card p-5"><p className="client-label">Recent activity</p><h2 className="text-lg font-semibold mt-3">The paper trail</h2>{services.flatMap((service) => service.payments || []).slice(0, 3).map((payment) => <div key={payment.id} className="flex gap-3 mt-4 text-[10px]"><span className="w-6 h-6 rounded-full bg-[#e8f0eb] text-[#3d9d91] flex items-center justify-center">✓</span><div><p className="font-semibold">Payment received</p><p className="client-muted">{payment.invoiceNumber} · {date(payment.paidOn)}</p></div></div>)}{services.every((service) => !service.payments?.length) && <p className="client-muted text-xs mt-5">No recent activity yet.</p>}</section></div><div className="flex justify-between items-end mb-4"><div><p className="client-label">Your services</p><h2 className="text-xl font-semibold mt-2">What DevGenit is running for you</h2></div><a href="/client/payments" className="text-[10px] text-[#3d9d91]">All invoices ↗</a></div>{services.length === 0 ? <div className="client-card p-12 text-center client-muted text-sm">No services have been assigned to your account yet.</div> : <div className="grid md:grid-cols-3 gap-3">{services.map((service, index) => <ServiceCard key={service.id} service={service} index={index} />)}</div>}</main></div></div></MobileNavProvider>;
}

function Summary({ title, value, hint, tone }) { return <div className={`client-card p-4 ${tone ? `client-card-${tone}` : ''}`}><p className="client-label">{title}</p><p className="text-2xl font-semibold mt-4 truncate">{value}</p><p className={`text-[9px] mt-2 ${tone ? 'text-orange-50' : 'client-muted'}`}>{hint}</p></div>; }