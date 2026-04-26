import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ProfileLinksTransformer extends BaseTransformer<{
  asks: boolean
  questions: boolean
  answers: boolean
}> {
  toObject() {
    return this.pick(this.resource, ['asks', 'questions', 'answers'])
  }
}
