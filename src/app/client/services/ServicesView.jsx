"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const cycleLabels = { WEEKLY: 'Weekly', MONTHLY: 'Monthly', YEARLY: 'Yearly', NO_RESTRICTION: 'No fixed schedule' };
const statusStyles = { ACTIVE: 'client-status-active', DUE_SOON: 'client-status-due', OVERDUE: 'client-status-overdue', BLOCKED: 'client-status-blocked' };
const statusLabels = { ACTIVE: 'Active', DUE_SOON: 'Due soon', OVERDUE: 'Overdue', BLOCKED: 'Blocked' };
const date = (value) => value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No fixed due date';

const filters = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'DUE_SOON', label: 'Due soon' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'BLOCKED', label: 'Blocked' },
];

function ReportPayment({ service }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(service.amount));
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // 'success' | error string

  async function submit() {
    setSubmitting(true);
    setResult(null);
    try {
      const response = await fetch(`/api/client/services/${service.id}/report-payment`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount, note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to submit');
      setResult('success');
    } catch (reason) {
      setResult(reason.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result === 'success') {
    return (
      <div className="mt-4 border border-[#c7e6dd] bg-[#eefaf5] rounded-lg p-3 text-[10px] text-[#2c7a63]">
        Thanks — we've received your report and will confirm it shortly.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 bg-[#202a3d] text-white text-[11px] font-semibold px-4 py-2 rounded-lg w-full sm:w-auto"
      >
       Complete the Payment 
      </button>
    );
  }

  return (
    <div className="mt-4 border border-[#e5e1d8] rounded-lg p-3">
      <p className="client-label mb-2">Report your payment</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <label className="text-[10px]">
          Amount paid
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full p-2 rounded-lg border border-[#d6e2df] text-xs"
          />
        </label>
        <label className="text-[10px]">
          Note (optional)
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. paid via bank transfer"
            className="mt-1 w-full p-2 rounded-lg border border-[#d6e2df] text-xs"
          />
        </label>
      </div>
      {result && result !== 'success' && (
        <p className="text-[10px] text-red-600 mt-2">{result}</p>
      )}
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="flex-1 sm:flex-none bg-[#202a3d] disabled:opacity-50 text-white text-[11px] font-semibold px-4 py-2 rounded-lg"
        >
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] text-slate-500 px-3"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ServicesView({ services }) {
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = filter === 'ALL' ? services : services.filter((s) => s.status === filter);

  const counts = filters.reduce((acc, f) => {
    acc[f.key] = f.key === 'ALL' ? services.length : services.filter((s) => s.status === f.key).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <p className="client-label">Your services</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-3">
          Everything running under your account.
        </h1>
        <p className="client-muted text-xs mt-2">
          Track billing cycles, due dates, and payment history for each service.
        </p>
      </div>

      {/* Filter tabs — horizontally scrollable on mobile so they never wrap awkwardly */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-semibold border transition-colors ${
              filter === f.key
                ? 'bg-[#202a3d] text-white border-[#202a3d]'
                : 'bg-white/70 text-slate-600 border-[#ddd9ce] hover:bg-white'
            }`}
          >
            {f.label}
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                filter === f.key ? 'bg-white/20' : 'bg-[#efece2]'
              }`}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="client-card p-10 sm:p-12 text-center client-muted text-sm">
          {filter === 'ALL'
            ? 'No services have been assigned to your account yet.'
            : `No services in "${filters.find((f) => f.key === filter)?.label}" right now.`}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((service) => {
            const expanded = expandedId === service.id;
            const payments = service.payments || [];
            const needsAttention = ['DUE_SOON', 'OVERDUE', 'BLOCKED'].includes(service.status);
            const canReportPayment = service.billingCycle !== 'NO_RESTRICTION';

            return (
              <div key={service.id} className="client-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : service.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center gap-3"
                >
                  <span
                    className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-sm font-semibold ${statusStyles[service.status]}`}
                  >
                    {service.name.slice(0, 1).toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold truncate">{service.name}</h2>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${statusStyles[service.status]}`}>
                        {statusLabels[service.status]}
                      </span>
                    </div>
                    <p className="client-muted text-[10px] mt-1">
                      {cycleLabels[service.billingCycle]} · Next due {date(service.nextDueDate)}
                    </p>
                  </div>

                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-sm font-semibold">৳ {Number(service.amount).toFixed(2)}</p>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {expanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-[#ebe8df]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-[10px]">
                      <div>
                        <p className="client-muted uppercase tracking-[.1em] text-[8px]">Amount</p>
                        <p className="font-semibold text-sm mt-1">৳ {Number(service.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="client-muted uppercase tracking-[.1em] text-[8px]">Billing cycle</p>
                        <p className="font-semibold text-sm mt-1">{cycleLabels[service.billingCycle]}</p>
                      </div>
                      <div>
                        <p className="client-muted uppercase tracking-[.1em] text-[8px]">Next due</p>
                        <p className="font-semibold text-sm mt-1">{date(service.nextDueDate)}</p>
                      </div>
                      <div>
                        <p className="client-muted uppercase tracking-[.1em] text-[8px]">Payments made</p>
                        <p className="font-semibold text-sm mt-1">{payments.length}</p>
                      </div>
                    </div>

                    {needsAttention && (
                      <div className="mt-4 border border-[#f0d9c9] bg-[#fff7ee] rounded-lg p-3 text-[10px] text-[#85583d]">
                        This service needs attention. Contact{' '}
                        <a href="mailto:connect@devgenit.com" className="underline">connect@devgenit.com</a> for help.
                      </div>
                    )}

                    {canReportPayment && <ReportPayment service={service} />}

                    <div className="mt-5">
                      <p className="client-label mb-2">Payment history</p>
                      {payments.length === 0 ? (
                        <p className="client-muted text-[10px]">No payments recorded for this service yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {payments.slice(0, 5).map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between text-[10px] py-1.5">
                              <span className="client-muted">{payment.invoiceNumber} · {date(payment.paidOn)}</span>
                              <span className="font-semibold">৳ {Number(payment.amountPaid).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <a
                        href="/client/payments"
                        className="inline-block mt-3 text-[10px] font-semibold text-[#3d9d91]"
                      >
                        View all invoices ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}