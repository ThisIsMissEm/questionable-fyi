import { Link, Form } from '@adonisjs/inertia/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Terms } from './terms'

type LoginFormProps = React.ComponentProps<'div'>

export function LoginForm({ className, ...props }: LoginFormProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your handle below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form route="oauth.login">
            {({ errors }) => (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="input">Your Internet handle</FieldLabel>
                  <Input
                    id="input"
                    name="input"
                    type="input"
                    placeholder="jerry.bsky.social"
                    defaultValue={errors.old_input ?? ''}
                    required
                    autoCapitalize="false"
                    autoCorrect="false"
                    autoComplete="true"
                  />
                  {errors?.input && <FieldError errors={[{ message: errors.input }]} />}
                </Field>
                <Field>
                  <Button type="submit">Login</Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            )}
          </Form>
        </CardContent>
      </Card>
      <Terms />
    </div>
  )
}
