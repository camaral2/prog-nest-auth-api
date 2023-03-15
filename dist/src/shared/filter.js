"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = exports.getStatusCode = exports.getErrorMessage = void 0;
const common_1 = require("@nestjs/common");
const getErrorMessage = (exception) => {
    if (exception instanceof common_1.HttpException) {
        const errorResponse = exception.getResponse();
        const errorMessage = errorResponse.message || exception.message;
        return errorMessage;
    }
    else {
        return String(exception);
    }
};
exports.getErrorMessage = getErrorMessage;
const getStatusCode = (exception) => {
    return exception instanceof common_1.HttpException
        ? exception.getStatus()
        : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
};
exports.getStatusCode = getStatusCode;
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let statusCode = (0, exports.getStatusCode)(exception);
        const message = (0, exports.getErrorMessage)(exception);
        if (/duplicate key/.test(message)) {
            statusCode = common_1.HttpStatus.CONFLICT;
        }
        else if (/foreign key constraint/.test(message)) {
            statusCode = common_1.HttpStatus.BAD_REQUEST;
        }
        const dt = new Date();
        const errorResponse = {
            code: statusCode,
            success: false,
            timestamp: dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString(),
            path: request.url,
            method: request.method,
            error: message,
        };
        common_1.Logger.error(`${request.method} ${request.url}`, JSON.stringify(errorResponse), 'ExceptionFilter');
        response.status(statusCode).json(errorResponse);
    }
};
HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
exports.HttpExceptionFilter = HttpExceptionFilter;
//# sourceMappingURL=filter.js.map