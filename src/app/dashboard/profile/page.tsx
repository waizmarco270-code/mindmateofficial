// This page's content has been moved to the Settings > Account tab.
// This file is no longer needed and can be removed in the future.
import { redirect } from 'next/navigation';

export default function ProfileRedirectPage() {
  redirect('/dashboard/settings?tab=account');
  return null;
}
