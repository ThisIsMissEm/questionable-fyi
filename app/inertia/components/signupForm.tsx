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
import { Form, Link, usePage } from '@inertiajs/react'
import { Terms } from './terms'

type SignupFormProps = React.ComponentProps<'div'>

export function SignupForm({ className, ...props }: SignupFormProps) {
  const page = usePage()
  const isAccountCreationError = page.props.errors?.input.includes('account creation')

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
          <Form method="POST" action="/oauth/signup">
            {isAccountCreationError ? (
              <>
                <Field className="mb-3">
                  <Input
                    type="hidden"
                    name="input"
                    value={page.props.errors.old_input}
                    autoCapitalize="false"
                    autoCorrect="false"
                    autoComplete="true"
                  />
                  <Input type="hidden" name="force" value="true" />
                  <FieldError errors={[{ message: page.props.errors.input }]} />
                </Field>
                <Field>
                  <Button type="submit">Try to sign up anyway</Button>
                  <FieldSeparator className="my-3">Or</FieldSeparator>
                  <FieldDescription className="text-center">
                    Use a <Link href="/signup">different service</Link>?
                  </FieldDescription>
                </Field>
              </>
            ) : (
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
                    {page.props.errors?.input && (
                      <FieldError errors={[{ message: page.props.errors.input }]} />
                    )}
                  </Field>
                  <Field>
                    <Button type="submit">Sign up</Button>
                    <FieldDescription className="text-center">
                      Already have an account? <Link href="/login">Login</Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </>
            )}
          </Form>
        </CardContent>
      </Card>
      <Terms />
    </div>
  )
}
