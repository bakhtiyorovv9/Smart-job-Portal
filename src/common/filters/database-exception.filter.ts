import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  BaseError,
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
  DatabaseError,
} from 'sequelize';

@Catch(BaseError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: BaseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ma\u2019lumotlar bazasida xatolik yuz berdi';

    if (exception instanceof UniqueConstraintError) {
      status = HttpStatus.CONFLICT;
      const field = exception.errors?.[0]?.path || 'qiymat';
      message = `Bu ${field} allaqachon mavjud`;
    }
    else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.errors?.[0]?.message || 'Validatsiya xatosi';
    }
    else if (exception instanceof ForeignKeyConstraintError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Bog\u2018liq ma\u2019lumot topilmadi yoki band';
    }
    else if (exception instanceof DatabaseError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'So\u2018rovda xatolik bor';
    }

    this.logger.error(
      `${request.method} ${request.url} → DB error: ${exception.message}`,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
