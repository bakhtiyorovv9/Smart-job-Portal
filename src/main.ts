import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import cookieParser from 'cookie-parser';
import hbs = require('hbs');
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const hbsAny = hbs as any;
  const _compile = hbsAny.handlebars.compile.bind(hbsAny.handlebars);
  hbsAny.handlebars.compile = (template: string, options?: any) =>
    _compile(template, {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
      ...options,
    });

  app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/public/' });
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  const viewsPath =
    process.env.NODE_ENV === 'production'
      ? join(__dirname, 'views')
      : join(process.cwd(), 'src', 'views');

  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('hbs');

  const partialsDir = join(viewsPath, 'partials');
  fs.readdirSync(partialsDir).forEach((file) => {
    if (file.endsWith('.hbs')) {
      const name = file.replace('.hbs', '');
      const content = fs.readFileSync(join(partialsDir, file), 'utf8');
      hbs.registerPartial(name, content);
    }
  });

  hbs.registerHelper('initials', (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
  });

  hbs.registerHelper('formatSalary', (salary: number) => {
    if (!salary) return 'Kelishilgan holda';
    const mln = (salary / 1_000_000).toFixed(1);
    return `${mln} mln so'm`;
  });

  hbs.registerHelper('timeAgo', (date: Date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (days > 0) return `${days} kun oldin`;
    if (hours > 0) return `${hours} soat oldin`;
    return 'Hozirgina';
  });

  hbs.registerHelper('eq', (a: any, b: any) => a === b);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(
    new DatabaseExceptionFilter(),
    new HttpExceptionFilter(),
  );

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseTransformInterceptor(app.get(Reflector)),
  );

  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.enableCors({ origin: true, credentials: true });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
