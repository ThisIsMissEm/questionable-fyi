import { LinkProps, Link } from '@adonisjs/inertia/react'
import { cn } from '~/lib/lib/utils'

export type TabbarProps = React.ComponentPropsWithoutRef<'div'> & {
  tabs: {
    id: string
    title: string
    isActive: boolean
    link: LinkProps
  }[]
}

export function Tabbar({ tabs, ...props }: TabbarProps) {
  return (
    <nav {...props}>
      <ul className="flex flex-row items-stretch border-b border-border list-none">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <Link
              href={tab.link.href}
              className={cn(
                'relative flex px-3.5 py-2 no-underline hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                tab.isActive &&
                  'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.75 after:w-full after:min-w-11.25 after:bg-primary'
              )}
            >
              {tab.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
