import { Link } from '@inertiajs/react'
import { FieldDescription } from '~/lib/components/ui/field'

export function Terms() {
  return (
    <FieldDescription className="px-6 text-center text-purple-300">
      By clicking continue, you agree to our{' '}
      <Link href="#" className="hover:text-white! focus:text-white!">
        Terms of Service
      </Link>{' '}
      and{' '}
      <Link href="#" className="hover:text-white! focus:text-white!">
        Privacy Policy
      </Link>
      .
    </FieldDescription>
  )
}
