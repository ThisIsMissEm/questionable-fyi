import { Link } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import AskForm from '~/components/ask'
import { Tabbar } from '~/components/tabs/tabbar'

import { urlFor } from '~/client'
import { InertiaProps } from '~/types'

type PageProps = InertiaProps<{}>

export default function Home({ viewer }: PageProps) {
  const { url } = usePage()

  return (
    <>
      {viewer ? <AskForm prompt={'My question is'} /> : null}
      <h2 className="text-3xl">Questions</h2>
      <Tabbar
        tabs={[
          {
            id: 'new',
            title: 'New',
            href: urlFor('home.index'),
            isActive: !url.includes('filter=') || url.includes('filter=new'),
          },
          {
            id: 'unanswered',
            title: 'Unanswered',
            href: urlFor('home.index', {}, { qs: { filter: 'unanswered' } }),
            isActive: url.includes('filter=unanswered'),
          },
          {
            id: 'answered',
            title: 'Answered',
            href: urlFor('home.index', {}, { qs: { filter: 'answered' } }),
            isActive: url.includes('filter=answered'),
          },
        ]}
      />
      <p>There'll be a feed of questions here at some point.</p>
      <ul>
        <li>
          <Link route="profiles.show" routeParams={{ handleOrDid: 'test.thisismissem.social' }}>
            Emelia's Test Profile
          </Link>
        </li>
        <li>
          <Link route="profiles.show" routeParams={{ handleOrDid: 'thisismissem.social' }}>
            Emelia's Main Profile
          </Link>
        </li>
      </ul>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui non animi omnis inventore sed
        culpa impedit beatae modi cupiditate ducimus incidunt, ad dolor tenetur maiores a
        dignissimos nisi placeat. Aperiam?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui non animi omnis inventore sed
        culpa impedit beatae modi cupiditate ducimus incidunt, ad dolor tenetur maiores a
        dignissimos nisi placeat. Aperiam?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui non animi omnis inventore sed
        culpa impedit beatae modi cupiditate ducimus incidunt, ad dolor tenetur maiores a
        dignissimos nisi placeat. Aperiam?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui non animi omnis inventore sed
        culpa impedit beatae modi cupiditate ducimus incidunt, ad dolor tenetur maiores a
        dignissimos nisi placeat. Aperiam?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui non animi omnis inventore sed
        culpa impedit beatae modi cupiditate ducimus incidunt, ad dolor tenetur maiores a
        dignissimos nisi placeat. Aperiam?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui non animi omnis inventore sed
        culpa impedit beatae modi cupiditate ducimus incidunt, ad dolor tenetur maiores a
        dignissimos nisi placeat. Aperiam?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui non animi omnis inventore sed
        culpa impedit beatae modi cupiditate ducimus incidunt, ad dolor tenetur maiores a
        dignissimos nisi placeat. Aperiam?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui non animi omnis inventore sed
        culpa impedit beatae modi cupiditate ducimus incidunt, ad dolor tenetur maiores a
        dignissimos nisi placeat. Aperiam?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui non animi omnis inventore sed
        culpa impedit beatae modi cupiditate ducimus incidunt, ad dolor tenetur maiores a
        dignissimos nisi placeat. Aperiam?
      </p>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui non animi omnis inventore sed
        culpa impedit beatae modi cupiditate ducimus incidunt, ad dolor tenetur maiores a
        dignissimos nisi placeat. Aperiam?
      </p>
    </>
  )
}
