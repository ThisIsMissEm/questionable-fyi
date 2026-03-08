import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'oauth.logout': { paramsTuple?: []; params?: {} }
    'oauth.login': { paramsTuple?: []; params?: {} }
    'oauth.signup': { paramsTuple?: []; params?: {} }
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'home.index': { paramsTuple?: []; params?: {} }
    'interviews.index': { paramsTuple?: []; params?: {} }
    'profiles.show': { paramsTuple: [ParamValue]; params: {'handleOrDid': ParamValue} }
    'profiles.update': { paramsTuple: [ParamValue]; params: {'handleOrDid': ParamValue} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.signup': { paramsTuple?: []; params?: {} }
    'onboarding.show': { paramsTuple?: []; params?: {} }
    'onboarding.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'home.index': { paramsTuple?: []; params?: {} }
    'interviews.index': { paramsTuple?: []; params?: {} }
    'profiles.show': { paramsTuple: [ParamValue]; params: {'handleOrDid': ParamValue} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.signup': { paramsTuple?: []; params?: {} }
    'onboarding.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'home.index': { paramsTuple?: []; params?: {} }
    'interviews.index': { paramsTuple?: []; params?: {} }
    'profiles.show': { paramsTuple: [ParamValue]; params: {'handleOrDid': ParamValue} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.signup': { paramsTuple?: []; params?: {} }
    'onboarding.show': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'oauth.logout': { paramsTuple?: []; params?: {} }
    'oauth.login': { paramsTuple?: []; params?: {} }
    'oauth.signup': { paramsTuple?: []; params?: {} }
    'onboarding.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'profiles.update': { paramsTuple: [ParamValue]; params: {'handleOrDid': ParamValue} }
  }
  PATCH: {
    'profiles.update': { paramsTuple: [ParamValue]; params: {'handleOrDid': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}