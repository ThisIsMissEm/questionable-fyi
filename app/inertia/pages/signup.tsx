import { Link } from '@inertiajs/react'
import { CircleX } from 'lucide-react'
import { SignupForm } from '~/components/signupForm'
import { Button } from '@/components/ui/button'

export default function Login() {
  return (
    <div className="relative flex flex-col min-h-svh w-full p-6 md:p-10 gap-y-4 bg-violet-950">
      <div className="self-end mb-3">
        <Link href="/" className="text-white hover:text-purple-100 focus:text-purple-100">
          <CircleX size="40" />
        </Link>
      </div>
      <div className="flex min-h-100 md:mx-6 md:my-8 items-center justify-center">
        <div className="w-full max-w-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
