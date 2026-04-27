import type { Data } from '@generated/data'
import { cn } from '@/lib/utils'

type AccountDisplayNameProps = React.ComponentProps<'span'> & {
  account: Data.Profile
}

export function AccountDisplayName({ account, className, ...props }: AccountDisplayNameProps) {
  return (
    <span className={cn('text-sm font-medium', className)} {...props}>
      {account.displayName ?? account.handle}
    </span>
  )
}
