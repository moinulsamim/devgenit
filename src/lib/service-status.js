// Pure frontend helpers for live service/client status in the admin console.
// The stored `status` field on a Service only updates once a day via the
// daily-billing-check cron, so the admin UI derives urgency directly from
// `nextDueDate` — the same way the client portal does — making warnings
// appear the moment they become true, not on the next cron run.

export function isPastDue(service) {
  if (!service.nextDueDate || service.billingCycle === 'NO_RESTRICTION') return false;
  const due = new Date(service.nextDueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due <= today;
}

export function isDueSoon(service) {
  if (!service.nextDueDate || service.billingCycle === 'NO_RESTRICTION') return false;
  const due = new Date(service.nextDueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  return days > 0 && days <= 7;
}

// Live status for a single service. BLOCKED stays BLOCKED — blocking is a
// deliberate admin action that time cannot derive. Overdue (past due date,
// unpaid) renders red; due soon (paid not yet confirmed, including the
// one-day-left case) renders orange warning.
export function liveStatus(service) {
  if (service.status === 'BLOCKED') return 'BLOCKED';
  if (isPastDue(service) || service.status === 'OVERDUE') return 'OVERDUE';
  if (isDueSoon(service) || service.status === 'DUE_SOON') return 'DUE_SOON';
  return 'ACTIVE';
}

const severity = { ACTIVE: 1, DUE_SOON: 2, OVERDUE: 3, BLOCKED: 4 };

// Worst live status across a client's services — what the admin sees for
// the client as a whole.
export function clientLiveStatus(services = []) {
  return (services || []).reduce(
    (worst, service) => (severity[liveStatus(service)] > severity[worst] ? liveStatus(service) : worst),
    'ACTIVE'
  );
}

// Colors per effective status. ACTIVE → mint, DUE_SOON (incl. 1 day left)
// → orange warning, OVERDUE / BLOCKED → red.
export const statusTones = {
  ACTIVE: { badge: 'bg-emerald-50 text-emerald-700', avatar: 'bg-[#d9eee9] text-[var(--admin-teal)]', row: 'hover:bg-[#f8fbfa]', text: '' },
  DUE_SOON: { badge: 'bg-orange-100 text-orange-700', avatar: 'bg-orange-100 text-orange-700', row: 'bg-orange-50/70 hover:bg-orange-100/70', text: 'text-orange-700' },
  OVERDUE: { badge: 'bg-red-100 text-red-700', avatar: 'bg-red-100 text-red-700', row: 'bg-red-50/70 hover:bg-red-100/70', text: 'text-red-700' },
  BLOCKED: { badge: 'bg-red-100 text-red-700', avatar: 'bg-red-100 text-red-700', row: 'bg-red-50/70 hover:bg-red-100/70', text: 'text-red-700' },
};