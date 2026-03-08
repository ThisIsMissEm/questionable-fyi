'use client'

import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link, Form } from '@adonisjs/inertia/react'
import { Button } from '~/lib/components/ui/button'
import { Badge } from '~/lib/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/lib/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { urlFor } from '~/client'
import { usePage } from '@inertiajs/react'
import { useAuth } from '~/lib/hooks/use-auth'

const items = [
  { title: 'Questions', href: urlFor('home.index') },
  { title: 'Interviews', href: '#', disabled: true },
  { title: 'Topics', href: '#', disabled: true },
]

type AppSidebarProps = React.ComponentProps<typeof Sidebar>

export function AppSidebar({ ...props }: AppSidebarProps) {
  const page = usePage()
  const { isLoggedIn, user } = useAuth()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="mb-3">
        <Link
          href="/"
          className="text-3xl font-semibold text-purple-800 hover:text-purple-600 focus:text-purple-600 outline-hidden"
        >
          Questionable
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {isLoggedIn && user && (
          <SidebarMenuItem className="p-1">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link
                route="profiles.show"
                routeParams={{ handleOrDid: user.handle ?? user.did }}
                className="grid flex-1 text-left text-md leading-tight"
              >
                <span className="truncate font-medium">{user.displayName ?? user.handle}</span>
                <span className="text-muted-foreground truncate text-sm">{user.handle}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger className="me-2" asChild>
                <SidebarMenuAction>
                  <MoreHorizontal />
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start">
                <DropdownMenuItem>
                  <span>Account Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        )}
        <SidebarMenu className="mt-3">
          {items.map((item) => (
            <SidebarMenuItem className="p-1" key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild isActive={page.url === item.href}>
                {item.href == '#' ? (
                  <span className="cursor-default">
                    {item.title}
                    <Badge variant="secondary" className="py-0.5 px-1 -mb-0.5">
                      coming soon
                    </Badge>
                  </span>
                ) : (
                  <Link href={item.href}>{item.title}</Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {isLoggedIn ? (
            <SidebarMenuItem key="logout" className="my-5 mx-2">
              <Form method="post" action="/oauth/logout">
                <Button className="w-full" type="submit">
                  Logout
                </Button>
              </Form>
            </SidebarMenuItem>
          ) : (
            <>
              <SidebarMenuItem className="p-1" key="login">
                <SidebarMenuButton tooltip="Login to your account" asChild>
                  <Link href="/login">Login</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem className="p-1" key="signup">
                <SidebarMenuButton tooltip="Login to your account" asChild>
                  <Link href="/signup">Signup</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

/*

<div id="wrapper">
      <aside>
        <nav>
          <h1 className="logomark">Questionable</h1>
          {props.isAuthenticated && props.user ? (
            <div className="account">
              Logged in as{' '}
              <Link href={`/p/${props.user.handle ?? props.user.did}`}>
                {props.user.handle ?? props.user.did}
              </Link>
            </div>
          ) : null}
          <ul>
            <li>
              <Link href="/" className={url === '/' ? 'active' : ''}>
                Questions
              </Link>
            </li>
            <li>
              <Link href="#">Interviews</Link>
            </li>
            <li>
              <Link href="#">Topics</Link>
            </li>
            {props.isAuthenticated ? (
              <li>
                <Form method="post" action="/oauth/logout">
                  <button type="submit">Logout</button>
                </Form>
              </li>
            ) : (
              <>
                <li>
                  <Link href="/login">Login</Link>
                </li>
                <li>
                  <Link href="/signup">Signup</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>
      <main>{children}</main>
    </div>
*/
