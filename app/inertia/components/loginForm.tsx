import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Form, Link, usePage } from '@inertiajs/react'
import { Terms } from './terms'

type LoginFormProps = React.ComponentProps<'div'>

export function LoginForm({ className, ...props }: LoginFormProps) {
  const page = usePage()
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your handle below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="POST" action="/oauth/login">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="input">Your Internet handle</FieldLabel>
                <Input
                  id="input"
                  name="input"
                  type="input"
                  placeholder="jerry.bsky.social"
                  required
                  autoCapitalize="false"
                  autoCorrect="false"
                  autoComplete="true"
                />
                {page.props.errors?.input && (
                  <FieldError errors={[{ message: page.props.errors.input }]} />
                )}
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </Form>
        </CardContent>
      </Card>
      <Terms />
    </div>
  )
}
