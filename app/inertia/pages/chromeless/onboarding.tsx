import { Form } from '@adonisjs/inertia/react'
import FormLayout from '~/layouts/fullPageForm'
import { useAuth } from '~/hooks/use-auth'

export default function Onboarding() {
  const viewer = useAuth()

  return (
    <FormLayout closable={false}>
      <h1 className="logomark">Questionable</h1>
      <h2>Welcome {viewer.user!.handle}!</h2>

      <Form route="onboarding.store" formMethod="POST">
        <label htmlFor="dispalyName">Display Name:</label>
        <input type="text" name="displayName" />
        <button type="submit">Save</button>
      </Form>
    </FormLayout>
  )
}
