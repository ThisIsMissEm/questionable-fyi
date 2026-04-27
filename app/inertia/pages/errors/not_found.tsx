import { Head, Link } from '@inertiajs/react'

export default function NotFound() {
  return (
    <>
      <Head title="Page not found" />
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-4xl font-semibold text-primary mb-4">Page not found</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          The page you're looking for doesn't exist, or it may have been moved.
        </p>
        <Link
          href="/"
          className="text-primary hover:text-primary/80 underline underline-offset-4"
        >
          Back to Questions
        </Link>
      </div>
    </>
  )
}
