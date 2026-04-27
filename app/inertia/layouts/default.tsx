import { TopNav } from '~/components/app/topnav'
import { PropsWithChildren } from 'react'
import { AuthContext } from '~/components/context/authContext'
import type { Data } from '@generated/data'
import { Toaster } from '~/lib/components/ui/sonner'

export default function Layout({
  children,
  viewer,
}: PropsWithChildren<{
  viewer?: Data.Profile
}>) {
  return (
    <AuthContext.Provider value={{ user: viewer, isLoggedIn: !!viewer }}>
      <div className="flex min-h-svh flex-col">
        <TopNav />
        <main className="flex flex-1 flex-col">
          <div className="@container/main w-full md:w-2/3 flex flex-col self-center-safe px-4 md:px-0">
            <div className="flex flex-col gap-6 mt-2 md:mt-6">{children}</div>
            <Toaster />
          </div>
        </main>
      </div>
    </AuthContext.Provider>
  )
}
