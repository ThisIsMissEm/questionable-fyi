import { Form, usePage } from '@inertiajs/react'
import Layout from '~/app/layout'

export default function Login() {
  const { props } = usePage()
  const { errors } = props

  return (
    <Layout>
      <h2>Login</h2>
      <Form method="POST" action="/oauth/login">
        <div>
          <input type="text" name="input" />
        </div>

        {errors?.input && <div className="notification-error">{errors.input}</div>}

        <button type="submit">Login</button>
      </Form>
    </Layout>
  )
}
