//https://stackoverflow.com/questions/60819612/how-to-test-validation-pipe-is-throwing-the-expect-error-for-improperly-shaped-r
import { registerDecorator, ValidationOptions } from 'class-validator';
import * as zxcvbn from 'zxcvbn';

export function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) {
            this.error = 'Empty password';
            return false;
          }
          if (typeof value !== 'string') {
            this.error = 'Password not is string';
            return false;
          }

          const result = zxcvbn(value);
          if (result.score <= 1) {
            this.error = 'Password is too weak';
            return false;
          }
          return true;
        },
        /* istanbul ignore next */
        defaultMessage(): string {
          return this.error || 'Something went wrong';
        },
      },
    });
  };
}
