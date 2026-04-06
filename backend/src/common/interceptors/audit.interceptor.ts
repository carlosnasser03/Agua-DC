import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();
    const { method, url, user, body, ip } = request;

    return next.handle().pipe(
      tap(async (data) => {
        const duration = Date.now() - start;
        
        // Structured logging for every request (Performance + Auditing)
        this.logger.log({
          message: `Request ${method} ${url} completed`,
          method,
          url,
          userId: user?.id || user?.userId || 'anonymous',
          duration: `${duration}ms`,
          ip,
        });

        // Only persist non-GET requests to the database
        if (method === 'GET') {
          return;
        }

        try {
          const moduleMatch = url.match(/\/([^\/]+)/);
          const moduleName = moduleMatch ? moduleMatch[1].toUpperCase() : 'SYSTEM';

          await this.prisma.auditLog.create({
            data: {
              userId: user?.id || user?.userId || null,
              module: moduleName,
              action: method,
              description: `Acción ${method} en ${url}`,
              entityId: data?.id || null,
              afterData: body ? body : null,
              ipAddress: ip,
              userAgent: request.headers['user-agent'],
            },
          });
        } catch (error) {
          this.logger.error({
            message: 'Failed to write audit log',
            error: error.message,
            stack: error.stack,
          });
        }
      }),
    );
  }
}
