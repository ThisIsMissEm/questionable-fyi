import { cn } from '~/lib/lib/utils'
import { Tab } from './tab'

export type TabbarProps = {
  tabs: {
    id: string
    title: string
    href: string
    isActive: boolean
  }[]
}

export function Tabbar({ tabs }: TabbarProps) {
  return (
    <nav className="tabbar">
      <ul>
        {tabs.map((tab) => (
          <li key={tab.id}>
            <Tab href={tab.href} className={cn({ active: tab.isActive })}>
              {tab.title}
            </Tab>
          </li>
        ))}
      </ul>
    </nav>
  )
}
