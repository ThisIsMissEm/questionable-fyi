import { Form } from '@inertiajs/react'
import Layout from '~/app/layout'

export default function Login() {
  return (
    <Layout>
      <h2>Login</h2>
      <Form method="POST" action="/oauth/login">
        <input type="text" name="input" />
        <button type="submit">Login</button>
      </Form>
    </Layout>
  )
}
