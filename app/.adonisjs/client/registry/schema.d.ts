/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'oauth.logout': {
    methods: ["POST"]
    pattern: '/oauth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['logout']>>>
    }
  }
  'oauth.login': {
    methods: ["POST"]
    pattern: '/oauth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/oauth').loginRequestValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/oauth').loginRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'oauth.signup': {
    methods: ["POST"]
    pattern: '/oauth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/oauth').signupRequestValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/oauth').signupRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['signup']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['signup']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'oauth.callback': {
    methods: ["GET","HEAD"]
    pattern: '/oauth/callback'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['callback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/oauth_controller').default['callback']>>>
    }
  }
  'home.index': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/homepage').homeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/home_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'interviews.index': {
    methods: ["GET","HEAD"]
    pattern: '/interviews'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/interviews_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/interviews_controller').default['index']>>>
    }
  }
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/p/:identifier'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { identifier: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/profile').showProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profiles_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profiles_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.update': {
    methods: ["PUT","PATCH"]
    pattern: '/p/:identifier'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/profile').updateProfileValidator)>>
      paramsTuple: [ParamValue]
      params: { identifier: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/profile').updateProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profiles_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profiles_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.questions.index': {
    methods: ["GET","HEAD"]
    pattern: '/p/:identifier/questions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { identifier: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/question').listQuestionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/questions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/questions_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.questions.show': {
    methods: ["GET","HEAD"]
    pattern: '/p/:identifier/questions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { identifier: ParamValue; id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/question').showQuestionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/questions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/questions_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.login': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['login']>>>
    }
  }
  'auth.signup': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['signup']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_controller').default['signup']>>>
    }
  }
  'onboarding.show': {
    methods: ["GET","HEAD"]
    pattern: '/onboarding'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/onboarding_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/onboarding_controller').default['show']>>>
    }
  }
  'onboarding.store': {
    methods: ["POST"]
    pattern: '/onboarding'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/onboarding').storeProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/onboarding').storeProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/onboarding_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/onboarding_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.ask.store': {
    methods: ["POST"]
    pattern: '/api/ask'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/ask').askValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/ask').askValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/asks_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/asks_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
