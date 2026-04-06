import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

// Segregated services (Phase 3A: ISP refactoring)
import { AuthUserService } from './services/auth-user.service';
import { AuditUserService } from './services/audit-user.service';
import { PermissionUserService } from './services/permission-user.service';

@Module({
  imports: [PrismaModule],
  providers: [
    UsersService,
    AuthUserService,
    AuditUserService,
    PermissionUserService,
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    AuthUserService,
    AuditUserService,
    PermissionUserService,
  ]
})
export class UsersModule {}
