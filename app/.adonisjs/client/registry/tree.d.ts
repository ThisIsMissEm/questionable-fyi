/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  oauth: {
    logout: typeof routes['oauth.logout']
    login: typeof routes['oauth.login']
    signup: typeof routes['oauth.signup']
    callback: typeof routes['oauth.callback']
  }
  home: {
    index: typeof routes['home.index']
  }
  interviews: {
    index: typeof routes['interviews.index']
  }
  profiles: {
    show: typeof routes['profiles.show']
    update: typeof routes['profiles.update']
  }
  auth: {
    login: typeof routes['auth.login']
    signup: typeof routes['auth.signup']
  }
  onboarding: {
    show: typeof routes['onboarding.show']
    store: typeof routes['onboarding.store']
  }
}
