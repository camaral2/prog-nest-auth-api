import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export interface HttpExceptionResponse {
    statusCode: number;
    message: any;
    error: string;
}
export declare const getErrorMessage: <T>(exception: T) => any;
export declare const getStatusCode: <T>(exception: T) => number;
export declare class HttpExceptionFilter<T> implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost): void;
}
