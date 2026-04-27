import type { Data } from '@generated/data'
import { cn } from '@/lib/utils'

type AccountHandleProps = React.ComponentProps<'span'> & {
  account: Data.Profile
}

export function AccountHandle({ account, className, ...props }: AccountHandleProps) {
  return (
    <span className={cn('text-xs', className)} {...props}>
      @{account.handle}
    </span>
  )
}
