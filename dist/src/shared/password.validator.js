"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsPasswordValid = void 0;
const class_validator_1 = require("class-validator");
const zxcvbn = require("zxcvbn");
function IsPasswordValid(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value) {
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
                defaultMessage() {
                    return this.error || 'Something went wrong';
                },
            },
        });
    };
}
exports.IsPasswordValid = IsPasswordValid;
//# sourceMappingURL=password.validator.js.map