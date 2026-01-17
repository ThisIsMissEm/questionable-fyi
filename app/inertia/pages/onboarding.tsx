import type OnboardingController from '#controllers/onboarding_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Form } from '@inertiajs/react'

export default function Onboarding(props: InferPageProps<OnboardingController, 'show'>) {
  return (
    <div>
      <h1 className="logomark">Questionable</h1>
      <h2>Welcome {props.handle}!</h2>

      <Form method="POST" action="/onboarding">
        <input type="text" name="displayName" />
        <button type="submit">Save</button>
      </Form>
    </div>
  )
}
