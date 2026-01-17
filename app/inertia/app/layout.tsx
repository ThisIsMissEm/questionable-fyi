import { Form, Link, usePage } from '@inertiajs/react'
import type { SharedProps, PageProps } from '@adonisjs/inertia/types'
import { PropsWithChildren } from 'react'

type LayoutProps = PropsWithChildren<{}>

export default function Layout({ children }: LayoutProps) {
  const { url, props } = usePage<SharedProps & PageProps>()

  return (
    <div id="wrapper">
      <aside>
        <nav>
          <h1 className="logomark">Questionable</h1>
          {props.isAuthenticated && props.user ? (
            <div className="account">
              Logged in as{' '}
              <Link href={`/p/${props.user.handle ?? props.user.did}`}>
                {props.user.handle ?? props.user.did}
              </Link>
            </div>
          ) : null}
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
            {props.isAuthenticated ? (
              <li>
                <Form method="post" action="/oauth/logout">
                  <button type="submit">Logout</button>
                </Form>
              </li>
            ) : (
              <>
                <li>
                  <Link href="/login">Login</Link>
                </li>
                <li>
                  <Link href="/signup">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  )
}
