import type HomeController from '#controllers/home_controller'
import { InferPageProps } from '@adonisjs/inertia/types'
import { Link, usePage } from '@inertiajs/react'
import Layout from '~/app/layout'
import AskForm from '~/components/ask'
import { Tabbar } from '~/components/tabs/tabbar'

export default function Home(props: InferPageProps<HomeController, 'index'>) {
  const { url } = usePage()
  return (
    <Layout>
      {props.isAuthenticated ? <AskForm /> : null}
      <h2 className="text-3xl">Questions</h2>
      <Tabbar
        tabs={[
          {
            id: 'new',
            title: 'New',
            href: `?filter=new`,
            isActive: !url.includes('filter=') || url.includes('filter=new'),
          },
          {
            id: 'unanswered',
            title: 'Unanswered',
            href: `?filter=unanswered`,
            isActive: url.includes('filter=unanswered'),
          },
          {
            id: 'answered',
            title: 'Answered',
            href: `?filter=answered`,
            isActive: url.includes('filter=answered'),
          },
        ]}
      />
      <p>There'll be a feed of questions here at some point.</p>
      <ul>
        <li>
          <Link href="/p/test.thisismissem.social">Emelia's Test Profile</Link>
        </li>
        <li>
          <Link href="/p/thisismissem.social">Emelia's Main Profile</Link>
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
    </Layout>
  )
}
