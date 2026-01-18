import { Form, Link, usePage } from '@inertiajs/react'
import type { SharedProps, PageProps } from '@adonisjs/inertia/types'
import { PropsWithChildren } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '~/lib/components/ui/sidebar'
import { AppSidebar } from '~/components/app/sidebar'
import { Separator } from '~/lib/components/ui/separator'

type LayoutProps = PropsWithChildren<{}>

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="sticky top-0 z-50 bg-white block md:hidden">
          <div className="flex flex-row justify-between gap-2 px-3 py-2 place-content-center h-16 bg-white">
            <SidebarTrigger className="-ml-1 size-12" size="icon-lg" iconSize={32} />
            <Link
              href="/"
              className="mt-1 text-3xl font-semibold text-purple-800 hover:text-purple-600 focus:text-purple-600 outline-hidden"
            >
              Questionable
            </Link>
            <span className="block w-8"></span>
          </div>
          <Separator orientation="horizontal" />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="@container/main w-full md:w-2/3 flex flex-col self-center-safe gap-2 px-5">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 mt-2 md:mt-5">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
