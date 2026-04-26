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
    'profile.show': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'profile.update': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'profile.questions.index': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'profile.questions.show': { paramsTuple: [ParamValue,ParamValue]; params: {'identifier': ParamValue,'id': ParamValue} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.signup': { paramsTuple?: []; params?: {} }
    'onboarding.show': { paramsTuple?: []; params?: {} }
    'onboarding.store': { paramsTuple?: []; params?: {} }
    'api.ask.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'home.index': { paramsTuple?: []; params?: {} }
    'interviews.index': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'profile.questions.index': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'profile.questions.show': { paramsTuple: [ParamValue,ParamValue]; params: {'identifier': ParamValue,'id': ParamValue} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.signup': { paramsTuple?: []; params?: {} }
    'onboarding.show': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'oauth.callback': { paramsTuple?: []; params?: {} }
    'home.index': { paramsTuple?: []; params?: {} }
    'interviews.index': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'profile.questions.index': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
    'profile.questions.show': { paramsTuple: [ParamValue,ParamValue]; params: {'identifier': ParamValue,'id': ParamValue} }
    'auth.login': { paramsTuple?: []; params?: {} }
    'auth.signup': { paramsTuple?: []; params?: {} }
    'onboarding.show': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'oauth.logout': { paramsTuple?: []; params?: {} }
    'oauth.login': { paramsTuple?: []; params?: {} }
    'oauth.signup': { paramsTuple?: []; params?: {} }
    'onboarding.store': { paramsTuple?: []; params?: {} }
    'api.ask.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'profile.update': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
  }
  PATCH: {
    'profile.update': { paramsTuple: [ParamValue]; params: {'identifier': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}