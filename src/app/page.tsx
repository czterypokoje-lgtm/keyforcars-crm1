import { redirect } from 'next/navigation';

/* The CRM has no public site: the root goes to the dashboard (src/proxy.ts does the same before this renders). */
export default function Home() {
  redirect('/admin/overzicht');
}
