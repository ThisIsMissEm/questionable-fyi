import { InertiaLinkProps, Link } from '@inertiajs/react'

export function Tab(props: InertiaLinkProps & { component?: string }) {
  return (
    <Link href={props.href} className={props.className}>
      <span className="tab">
        {props.children}
        <span></span>
      </span>
    </Link>
  )
}
