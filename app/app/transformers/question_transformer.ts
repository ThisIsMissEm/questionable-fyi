import { BaseTransformer } from '@adonisjs/core/transformers'
import type Question from '#models/question'
import ProfileTransformer from '#transformers/profile_transformer'

export default class QuestionTransformer extends BaseTransformer<Question> {
  toObject() {
    return {
      ...this.pick(this.resource, ['summary', 'content', 'createdAt', 'rkey']),
      profile: ProfileTransformer.transform(
        this.resource.author.profile,
        this.resource.author.profile.account
      ),
    }
  }
}
