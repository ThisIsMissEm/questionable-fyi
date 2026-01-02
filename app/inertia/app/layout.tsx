import { Form, Link, usePage } from '@inertiajs/react'
import { PropsWithChildren } from 'react'

type LayoutProps = PropsWithChildren<{}>

export default function Layout({ children }: LayoutProps) {
  const { url, props } = usePage()

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
            {props.authenticated ? (
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
