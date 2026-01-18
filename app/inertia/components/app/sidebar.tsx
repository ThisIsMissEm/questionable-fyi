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
import { Avatar, AvatarFallback } from '~/lib/components/ui/avatar'
import { Form, Link, usePage } from '@inertiajs/react'
import { PageProps, SharedProps } from '@adonisjs/inertia/types'
import { Button } from '~/lib/components/ui/button'
import { Badge } from '~/lib/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/lib/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

const items = [
  { title: 'Questions', href: '/' },
  { title: 'Interviews', href: '/interviews' },
  { title: 'Topics', href: '#', disabled: true },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const page = usePage<SharedProps & PageProps>()

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
        {page.props.isAuthenticated && (
          <SidebarMenuItem className="p-1">
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link
                href={`/p/${page.props.user?.handle ?? page.props.user?.did}`}
                className="grid flex-1 text-left text-md leading-tight"
              >
                <span className="truncate font-medium">
                  {page.props.user!.displayName ?? page.props.user?.handle}
                </span>
                <span className="text-muted-foreground truncate text-sm">
                  {page.props.user!.handle}
                </span>
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

          {page.props.isAuthenticated ? (
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
