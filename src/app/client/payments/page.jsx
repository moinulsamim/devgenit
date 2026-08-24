import { redirect } from 'next/navigation';
import { getCurrentClient } from '../../../lib/getCurrentClient';
import ClientNav, { ClientTopbar, MobileNavProvider } from '../ClientNav';

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default async function ClientPaymentsPage() {
  const client = await getCurrentClient();
  if (!client) redirect('/client/login');

  const payments = (client.services || [])
    .flatMap((service) =>
      (service.payments || []).map((payment) => ({
        ...payment,
        serviceName: service.name,
      }))
    )
    .sort((a, b) => new Date(b.paidOn) - new Date(a.paidOn));

  const total = payments.reduce((sum, payment) => sum + Number(payment.amountPaid), 0);

  return (
    <MobileNavProvider>
      <div className="client-page">
        <ClientNav client={client} />
        <div className="client-content lg:ml-44">
          <ClientTopbar client={client} />
          <main className="max-w-5xl mx-auto px-8 py-9">
            <div className="flex justify-between items-end mb-7">
              <div>
                <p className="client-label">Billing center</p>
                <h1 className="text-3xl font-semibold tracking-tight mt-3">
                  Invoices, without the chase.
                </h1>
                <p className="client-muted text-xs mt-2">
                  A clear record of every statement, payment, and due date.
                </p>
              </div>
              <span className="hidden sm:block bg-[#202a3d] text-white text-xs rounded-lg px-4 py-2">
                Download latest ↓
              </span>
            </div>

            <div className="client-card overflow-hidden">
              {payments.length === 0 ? (
                <div className="p-12 text-center client-muted text-sm">
                  No payments have been recorded yet.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="border-b border-[#ebe8df] text-[9px] client-muted uppercase tracking-[.16em]">
                    <tr>
                      <th className="p-4">Invoice</th>
                      <th className="p-4">Service</th>
                      <th className="p-4">Issued</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b last:border-0 border-[#ebe8df] text-xs"
                      >
                        <td className="p-4 font-semibold">{payment.invoiceNumber}</td>
                        <td className="p-4 client-muted">{payment.serviceName}</td>
                        <td className="p-4 client-muted">{formatDate(payment.paidOn)}</td>
                        <td className="p-4 font-semibold">
                          ${Number(payment.amountPaid).toFixed(2)}
                        </td>
                        <td className="p-4">
                          {payment.receiptFileUrl ? (
                            <a
                              href={payment.receiptFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#3d9d91] underline"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="client-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-3 mt-4">
              <Summary title="Total on record" value={`$${total.toFixed(2)}`} />
              <Summary title="Paid invoices" value={`${payments.length}`} />
              <Summary title="Payment rhythm" value="Active" />
            </div>
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}

function Summary({ title, value }) {
  return (
    <div className="client-card p-4">
      <p className="client-label">{title}</p>
      <p className="text-xl font-semibold mt-3">{value}</p>
    </div>
  );
}