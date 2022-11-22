import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface HttpExceptionResponse {
  statusCode: number;
  message: any;
  error: string;
}

export const getErrorMessage = <T>(exception: T): any => {
  if (exception instanceof HttpException) {
    const errorResponse = exception.getResponse();
    const errorMessage =
      (errorResponse as HttpExceptionResponse).message || exception.message;

    return errorMessage;
  } else {
    return String(exception);
  }
};

export const getStatusCode = <T>(exception: T): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let statusCode = getStatusCode<T>(exception);
    const message = getErrorMessage<T>(exception);

    if (/duplicate key/.test(message)) {
      statusCode = HttpStatus.CONFLICT;
    } else if (/foreign key constraint/.test(message)) {
      statusCode = HttpStatus.BAD_REQUEST;
    }
    const dt = new Date();

    const errorResponse = {
      code: statusCode,
      success: false,
      timestamp: dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString(),
      path: request.url,
      method: request.method,
      //message: exception.message || null,
      error: message,
    };

    Logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'ExceptionFilter',
    );

    response.status(statusCode).json(errorResponse);
    /*
    switch (exception.message) {
      case '11000': // duplicate exception
        return new ConflictException();
      default:
        return new BadRequestException(`error ${exception.message}`);
    }
    */
  }
}
