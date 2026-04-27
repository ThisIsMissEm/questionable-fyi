import { Head, Link } from '@inertiajs/react'

export default function ServerError() {
  return (
    <>
      <Head title="Something went wrong" />
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-4xl font-semibold text-primary mb-4">Something went wrong</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          We ran into a problem loading this page. Try refreshing, or head back to the home page.
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
