import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const renderTemplate = this.reflector.get<string>(
      '__renderTemplate__',
      context.getHandler(),
    );

    const ctx = context.switchToHttp();
    const statusCode = ctx.getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        if (renderTemplate) {
          return data;
        }

        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        return {
          success: true,
          statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
