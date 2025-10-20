
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Always redirect from the root to the dashboard.
  // The dashboard itself will handle signed-in vs. signed-out state.
  redirect('/dashboard');
}
