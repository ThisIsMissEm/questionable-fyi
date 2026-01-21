import { BaseTransformer } from '@adonisjs/core/transformers'
import Question from '#models/question'
import ProfileTransformer from '#transformers/profile_transformer'

export default class QuestionTransformer extends BaseTransformer<Question> {
  toObject() {
    console.log(this.resource.author)
    return {
      ...this.pick(this.resource, ['summary', 'content', 'createdAt', 'rkey']),
      profile: ProfileTransformer.transform(
        this.resource.author.profile,
        this.resource.author.profile.account
      ),
    }
  }
}
