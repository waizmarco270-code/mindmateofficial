
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard" className="mt-6">
        <Button>Go Back to Dashboard</Button>
      </Link>
    </div>
  )
}
