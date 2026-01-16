import { Form, usePage } from '@inertiajs/react'
import Layout from '~/app/layout'

export default function Login() {
  const { props } = usePage()
  const { errors } = props

  const isAccountCreationError = errors?.input.includes('account creation')

  return (
    <Layout>
      <h2>Create an account</h2>
      <Form method="POST" action="/oauth/signup">
        <div>
          <input type="text" name="input" placeholder="bsky.social" />
        </div>
        {isAccountCreationError ? (
          <>
            <input type="hidden" name="force" value="true" />
            <div className="notification-error">{errors.input}</div>
            <button type="submit">Attempt to signup anyway</button>
          </>
        ) : (
          <>
            {errors?.input && <div className="notification-error">{errors.input}</div>}
            <button type="submit">Signup</button>
          </>
        )}
      </Form>
    </Layout>
  )
}
