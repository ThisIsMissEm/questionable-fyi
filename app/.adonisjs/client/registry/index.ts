/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'oauth.logout': {
    methods: ["POST"],
    pattern: '/oauth/logout',
    tokens: [{"old":"/oauth/logout","type":0,"val":"oauth","end":""},{"old":"/oauth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['oauth.logout']['types'],
  },
  'oauth.login': {
    methods: ["POST"],
    pattern: '/oauth/login',
    tokens: [{"old":"/oauth/login","type":0,"val":"oauth","end":""},{"old":"/oauth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['oauth.login']['types'],
  },
  'oauth.signup': {
    methods: ["POST"],
    pattern: '/oauth/signup',
    tokens: [{"old":"/oauth/signup","type":0,"val":"oauth","end":""},{"old":"/oauth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['oauth.signup']['types'],
  },
  'oauth.callback': {
    methods: ["GET","HEAD"],
    pattern: '/oauth/callback',
    tokens: [{"old":"/oauth/callback","type":0,"val":"oauth","end":""},{"old":"/oauth/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['oauth.callback']['types'],
  },
  'home.index': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home.index']['types'],
  },
  'interviews.index': {
    methods: ["GET","HEAD"],
    pattern: '/interviews',
    tokens: [{"old":"/interviews","type":0,"val":"interviews","end":""}],
    types: placeholder as Registry['interviews.index']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/p/:identifier',
    tokens: [{"old":"/p/:identifier","type":0,"val":"p","end":""},{"old":"/p/:identifier","type":1,"val":"identifier","end":""}],
    types: placeholder as Registry['profile.show']['types'],
  },
  'profile.update': {
    methods: ["PUT","PATCH"],
    pattern: '/p/:identifier',
    tokens: [{"old":"/p/:identifier","type":0,"val":"p","end":""},{"old":"/p/:identifier","type":1,"val":"identifier","end":""}],
    types: placeholder as Registry['profile.update']['types'],
  },
  'profile.questions.index': {
    methods: ["GET","HEAD"],
    pattern: '/p/:identifier/questions',
    tokens: [{"old":"/p/:identifier/questions","type":0,"val":"p","end":""},{"old":"/p/:identifier/questions","type":1,"val":"identifier","end":""},{"old":"/p/:identifier/questions","type":0,"val":"questions","end":""}],
    types: placeholder as Registry['profile.questions.index']['types'],
  },
  'profile.questions.show': {
    methods: ["GET","HEAD"],
    pattern: '/p/:identifier/questions/:id',
    tokens: [{"old":"/p/:identifier/questions/:id","type":0,"val":"p","end":""},{"old":"/p/:identifier/questions/:id","type":1,"val":"identifier","end":""},{"old":"/p/:identifier/questions/:id","type":0,"val":"questions","end":""},{"old":"/p/:identifier/questions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['profile.questions.show']['types'],
  },
  'auth.login': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.signup': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.signup']['types'],
  },
  'onboarding.show': {
    methods: ["GET","HEAD"],
    pattern: '/onboarding',
    tokens: [{"old":"/onboarding","type":0,"val":"onboarding","end":""}],
    types: placeholder as Registry['onboarding.show']['types'],
  },
  'onboarding.store': {
    methods: ["POST"],
    pattern: '/onboarding',
    tokens: [{"old":"/onboarding","type":0,"val":"onboarding","end":""}],
    types: placeholder as Registry['onboarding.store']['types'],
  },
  'api.ask.store': {
    methods: ["POST"],
    pattern: '/api/ask',
    tokens: [{"old":"/api/ask","type":0,"val":"api","end":""},{"old":"/api/ask","type":0,"val":"ask","end":""}],
    types: placeholder as Registry['api.ask.store']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
