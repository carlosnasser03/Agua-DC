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
    const { method, url, user, body } = request;

    // Only audit non-GET requests
    if (method === 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const moduleMatch = url.match(/\/([^\/]+)/);
          const moduleName = moduleMatch ? moduleMatch[1].toUpperCase() : 'SYSTEM';

          await this.prisma.auditLog.create({
            data: {
              userId: user?.userId || null,
              module: moduleName,
              action: method,
              description: `Acción ${method} en ${url}`,
              entityId: data?.id || null,
              afterData: body ? body : null,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });
        } catch (error) {
          this.logger.error('Failed to write audit log', error);
        }
      }),
    );
  }
}
