
import { LandingPage } from '@/components/landing/landing-page';

export default function RootPage() {
  // Now showing the professional landing page at the root instead of redirecting.
  // This is what Razorpay will see during review.
  return <LandingPage />;
}
