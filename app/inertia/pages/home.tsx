import type HomeController from '#controllers/home_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Link } from '@inertiajs/react'
import Layout from '~/app/layout'
import AskForm from '~/components/ask'

export default function Home(props: InferPageProps<HomeController, 'index'>) {
  return (
    <Layout>
      {props.isAuthenticated ? <AskForm /> : null}
      <p>There'll be a feed of questions here at some point.</p>
      <ul>
        <li>
          <Link href="/p/test.thisismissem.social">Emelia's Test Profile</Link>
        </li>
        <li>
          <Link href="/p/thisismissem.social">Emelia's Main Profile</Link>
        </li>
      </ul>
    </Layout>
  )
}
