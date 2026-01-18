'use client'

import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '~/lib/components/ui/avatar'
import { Form, Link, usePage } from '@inertiajs/react'
import { PageProps, SharedProps } from '@adonisjs/inertia/types'
import { Button } from '~/lib/components/ui/button'

const items = [
  { title: 'Questions', href: '/' },
  { title: 'Interviews', href: '/interviews' },
  { title: 'Topics', href: '#', disabled: true },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const page = usePage<SharedProps & PageProps>()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu className="hidden md:block">
          <SidebarMenuItem>
            <Link href="/">
              <span className="text-3xl font-semibold">Questionable</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {page.props.isAuthenticated && (
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Link
              href={`/p/${page.props.user?.handle ?? page.props.user?.did}`}
              className="grid flex-1 text-left text-sm leading-tight"
            >
              <span className="truncate font-medium">
                {page.props.user!.displayName ?? page.props.user?.handle}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {page.props.user!.handle}
              </span>
            </Link>
          </SidebarMenuButton>
        )}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} asChild isActive={page.url === item.href}>
                {item.href == '#' ? (
                  <span className="cursor-default">{item.title} (coming soon)</span>
                ) : (
                  <Link href={item.href}>{item.title}</Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}

          {page.props.isAuthenticated ? (
            <SidebarMenuItem key="logout" className="my-5 mx-2">
              <Form method="post" action="/oauth/logout">
                <Button type="submit">Logout</Button>
              </Form>
            </SidebarMenuItem>
          ) : (
            <>
              <SidebarMenuItem key="login">
                <SidebarMenuButton tooltip="Login to your account" asChild>
                  <Link href="/login">Login</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key="signup">
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
