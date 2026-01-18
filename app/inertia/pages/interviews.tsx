import type InterviewsController from '#controllers/interviews_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import Layout from '~/app/layout'

export default function Interviews(_props: InferPageProps<InterviewsController, 'index'>) {
  return (
    <Layout>
      <p>There'll be a feed of interviews here at some point.</p>
    </Layout>
  )
}
