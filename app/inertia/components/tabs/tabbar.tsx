import { InertiaLinkProps } from '@inertiajs/react'
import { cn } from '~/lib/lib/utils'
import { Tab } from './tab'

export type TabbarProps = {
  tabs: {
    id: string
    title: string
    isActive: boolean
    link: InertiaLinkProps
  }[]
}

export function Tabbar({ tabs }: TabbarProps) {
  return (
    <nav className="tabbar">
      <ul>
        {tabs.map((tab) => (
          <li key={tab.id}>
            <Tab {...tab.link} className={cn({ active: tab.isActive })}>
              {tab.title}
            </Tab>
          </li>
        ))}
      </ul>
    </nav>
  )
}
