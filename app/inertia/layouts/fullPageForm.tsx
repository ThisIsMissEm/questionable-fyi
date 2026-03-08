import { MouseEventHandler, PropsWithChildren } from 'react'
import { CircleX } from 'lucide-react'
import { useRouter } from '@adonisjs/inertia/react'

type FullPageFormLayoutProps = PropsWithChildren<{
  closable?: boolean
}>

export default function FullPageFormLayout({ children, closable }: FullPageFormLayoutProps) {
  const router = useRouter()
  const handleBack: MouseEventHandler<HTMLButtonElement> = (ev) => {
    ev.preventDefault()

    // This prevents going back cross-domain:
    if (window.navigation.canGoBack) {
      window.navigation.back()
    } else {
      router.visit({ route: 'home.index' }, { replace: true })
    }
  }

  return (
    <div className="relative flex flex-col min-h-svh w-full p-6 md:p-10 gap-y-4 bg-violet-950">
      {closable !== false && (
        <div className="self-end mb-3">
          <button
            onClick={handleBack}
            className="text-white hover:text-purple-100 focus:text-purple-100"
          >
            <CircleX size="40" />
          </button>
        </div>
      )}
      <div className="flex min-h-100 md:mx-6 md:my-8 items-center justify-center">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
