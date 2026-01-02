import type HomeController from '#controllers/home_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Link } from '@inertiajs/react'
import Layout from '~/app/layout'

export default function Home(props: InferPageProps<HomeController, 'index'>) {
  return (
    <Layout>
      <p>There'll be a feed of questions here at some point.</p>
      <Link href="/p/test.thisismissem.social">Emelia's Test Profile</Link>
      {props.debug ? (
        <pre>
          <code>{props.debug}</code>
        </pre>
      ) : null}
    </Layout>
  )
}
