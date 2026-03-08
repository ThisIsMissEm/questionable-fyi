import { Link, Form } from '@adonisjs/inertia/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Terms } from './terms'

type SignupFormProps = React.ComponentProps<'div'>

export function SignupForm({ className, ...props }: SignupFormProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Your account is hosted with a Personal Data Server (PDS), such as those run by Bluesky.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form route="oauth.signup">
            {({ errors }) => {
              if (errors?.input?.includes('account creation')) {
                return (
                  <SignupWarningForm
                    warningMessage={errors.input}
                    previousInput={errors.old_input}
                  />
                )
              }

              return <SignupFormInner inputError={errors.input} />
            }}
          </Form>
        </CardContent>
      </Card>
      <Terms />
    </div>
  )
}

function SignupFormInner({ inputError }: { inputError: string }) {
  return (
    <>
      <FieldGroup>
        <Field>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-500">
            Sign up with Bluesky
          </Button>
        </Field>
      </FieldGroup>
      <FieldSeparator className="my-3">Or continue with</FieldSeparator>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="input">Personal Data Server</FieldLabel>
          <Input
            id="input"
            name="input"
            type="text"
            placeholder="https://bsky.social"
            autoCapitalize="false"
            autoCorrect="false"
            autoComplete="true"
          />
          {inputError && <FieldError errors={[{ message: inputError }]} />}
        </Field>
        <Field>
          <Button type="submit">Sign up</Button>
          <FieldDescription className="text-center">
            Already have an account? <Link href="/login">Login</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </>
  )
}

type SignupWarningFormProps = {
  warningMessage: string
  previousInput: string
}

function SignupWarningForm({ warningMessage, previousInput }: SignupWarningFormProps) {
  return (
    <>
      <Field className="mb-3">
        <Input
          type="hidden"
          name="input"
          value={previousInput}
          autoCapitalize="false"
          autoCorrect="false"
          autoComplete="true"
        />
        <Input type="hidden" name="force" value="true" />
        <FieldError errors={[{ message: warningMessage }]} />
      </Field>
      <Field>
        <Button type="submit">Try to sign up anyway</Button>
        <FieldSeparator className="my-3">Or</FieldSeparator>
        <FieldDescription className="text-center">
          Use a <Link href="/signup">different service</Link>?
        </FieldDescription>
      </Field>
    </>
  )
}
