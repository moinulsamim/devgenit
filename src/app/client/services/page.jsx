import { redirect } from 'next/navigation';
import { getCurrentClient } from '../../../lib/getCurrentClient';
import ClientNav, { ClientTopbar, MobileNavProvider } from '../ClientNav';
import ServicesView from './ServicesView';

export default async function ClientServicesPage() {
  const client = await getCurrentClient();
  if (!client) redirect('/client/login');

  return (
    <MobileNavProvider>
      <div className="client-page">
        <ClientNav client={client} />
        <div className="client-content lg:ml-44">
          <ClientTopbar client={client} />
          <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-9">
            <ServicesView services={client.services || []} />
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}