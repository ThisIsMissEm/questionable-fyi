import { Link, usePage } from '@inertiajs/react'
import { PropsWithChildren } from 'react'

type LayoutProps = PropsWithChildren<{}>

export default function Layout({ children }: LayoutProps) {
  const { url } = usePage()

  return (
    <div id="wrapper">
      <aside>
        <nav>
          <h1>Questionable</h1>
          <ul>
            <li>
              <Link href="/" className={url === '/' ? 'active' : ''}>
                Questions
              </Link>
            </li>
            <li>
              <Link href="#">Interviews</Link>
            </li>
            <li>
              <Link href="#">Topics</Link>
            </li>
            <li>
              <Link href="#">Login</Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  )
}
