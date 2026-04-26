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
  profile: {
    show: typeof routes['profile.show']
    update: typeof routes['profile.update']
    questions: {
      index: typeof routes['profile.questions.index']
      show: typeof routes['profile.questions.show']
    }
  }
  auth: {
    login: typeof routes['auth.login']
    signup: typeof routes['auth.signup']
  }
  onboarding: {
    show: typeof routes['onboarding.show']
    store: typeof routes['onboarding.store']
  }
  api: {
    ask: {
      store: typeof routes['api.ask.store']
    }
  }
}
