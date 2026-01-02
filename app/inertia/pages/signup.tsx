import { Form } from '@inertiajs/react'
import Layout from '~/app/layout'

export default function Login() {
  return (
    <Layout>
      <h2>Create an account</h2>
      <Form method="POST" action="/oauth/signup">
        <input type="text" name="input" />
        <button type="submit">Signup</button>
      </Form>
    </Layout>
  )
}
