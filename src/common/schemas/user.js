import { UnprocessableError } from '../../common/errors.js';
import Joi from '@hapi/joi';

const schema = Joi.object({
  username: Joi.string(),
  password: Joi.string(),
  id: Joi.number(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  location: Joi.string(),
  email: Joi.string(),
  role: Joi.number(),
});

export async function validate(data) {
  try {
    const value = await schema.validateAsync(data);
    return value;
  } catch (err) {
    throw new UnprocessableError('Unable to validate test JSON: ', err);
  }
}
