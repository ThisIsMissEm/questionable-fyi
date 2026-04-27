import { Link, Form } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import { Menu, MoreHorizontal } from 'lucide-react'
import { Button } from '~/lib/components/ui/button'
import { Badge } from '~/lib/components/ui/badge'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '~/lib/components/ui/navigation-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/lib/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/lib/components/ui/tooltip'
import { useAuth } from '~/hooks/use-auth'
import { AccountDisplayName } from '~/components/account-display-name'
import { AccountHandle } from '~/components/account-handle'
import { urlFor } from '~/client'
import { cn } from '@/lib/utils'

const items = [
  { title: 'Questions', href: urlFor('home.index') },
  { title: 'Interviews', href: '#', disabled: true },
  { title: 'Topics', href: '#', disabled: true },
]

export function TopNav() {
  const page = usePage()
  const { isLoggedIn, user } = useAuth()

  return (
    <header className="py-6 flex flex-col items-center gap-6 w-full bg-background">
      <div className="flex flex-row items-center-safe justify-between w-full md:w-auto px-4">
        <div className="flex flex-1 self-stretch">
          {/* Brand (left) */}
          <Link
            href="/"
            className="text-2xl px-2 md:text-3xl font-semibold text-primary hover:text-primary/80 rounded-sm outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            Questionable
          </Link>
        </div>
        {/* Mobile hamburger trigger (right) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="place-self-end md:hidden">
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Open menu"
              className="text-primary hover:text-primary/80"
            >
              <Menu className="size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[calc(100vw-4rem)] mx-2 md:hidden"
          >
            <DropdownMenuGroup>
              {items.map((item) => (
                <DropdownMenuItem
                  key={item.title}
                  disabled={item.disabled}
                  asChild={!item.disabled}
                  className="data-disabled:opacity-60 data-disabled:pointer-events-none"
                >
                  {item.disabled ? (
                    <span className="flex w-full items-center justify-between gap-2">
                      {item.title}
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        coming soon
                      </Badge>
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={page.url === item.href ? 'page' : undefined}
                      className={cn(
                        page.url === item.href &&
                          'bg-accent text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                      )}
                    >
                      {item.title}
                    </Link>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {isLoggedIn && user ? (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      route="profile.show"
                      routeParams={{ identifier: user.handle ?? user.did }}
                    >
                      <span className="flex flex-col items-start leading-tight font-sans">
                        <AccountDisplayName account={user} />
                        <AccountHandle account={user} className="text-muted-foreground" />
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                  <DropdownMenuItem>Account Settings</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Form method="post" action="/oauth/logout">
                      <button type="submit" className="w-full text-left">
                        Logout
                      </button>
                    </Form>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            ) : (
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/login">Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/signup">Signup</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="@container/main hidden md:flex md:w-2/3 flex-row items-center self-center-safe justify-between px-2 md:px-2 gap-3 py-1 bg-primary md:rounded-md overflow-hidden shadow-lg">
        {/* Desktop nav (center) */}
        <NavigationMenu className="hidden md:flex flex-1 self-stretch items-stretch max-w-none justify-start">
          <NavigationMenuList className="justify-start items-stretch h-full">
            {items.map((item) => (
              <NavigationMenuItem key={item.title}>
                {item.disabled ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          navigationMenuTriggerStyle({ variant: 'nav' }),
                          'cursor-default text-primary-foreground/70 hover:bg-transparent hover:text-primary-foreground/70'
                        )}
                      >
                        {item.title}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={-2} variant="light">
                      <p>coming soon</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <NavigationMenuLink
                    asChild
                    active={page.url === item.href}
                    className={navigationMenuTriggerStyle({ variant: 'nav' })}
                  >
                    <Link
                      href={item.href}
                      aria-current={page.url === item.href ? 'page' : undefined}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right cluster (desktop): user menu OR auth buttons */}
        <div className="hidden md:flex gap-1">
          {isLoggedIn && user ? (
            <>
              <Link
                route="profile.show"
                routeParams={{ identifier: user.handle ?? user.did }}
                className={cn(navigationMenuTriggerStyle({ variant: 'nav' }), 'px-2 py-1')}
              >
                <span className="flex flex-col items-start leading-tight font-sans">
                  <AccountDisplayName account={user} className="truncate max-w-60" />
                  <AccountHandle
                    account={user}
                    className="text-[color-mix(in_oklch,var(--primary-foreground)_90%,var(--primary))] truncate max-w-60"
                  />
                </span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="navGhost"
                    className="flex items-center gap-2 h-12 px-2"
                    aria-label="More options"
                  >
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Account Settings</DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Form method="post" action="/oauth/logout">
                        <button type="submit" className="w-full text-left">
                          Logout
                        </button>
                      </Form>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="navGhost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="navInverse" asChild>
                <Link href="/signup">Signup</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
