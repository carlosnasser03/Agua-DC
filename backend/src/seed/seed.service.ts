import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedSuperAdmin();
  }

  private async seedSuperAdmin() {
    const email = this.config.get<string>('INITIAL_ADMIN_USER');
    const password = this.config.get<string>('INITIAL_ADMIN_PASS');

    if (!email || !password) {
      this.logger.warn(
        'INITIAL_ADMIN_USER / INITIAL_ADMIN_PASS no definidas — se omite la creación del admin inicial',
      );
      return;
    }

    // Garantiza que el rol 'Super Admin' existe
    const role = await this.prisma.role.upsert({
      where: { name: 'Super Admin' },
      update: {},
      create: {
        name: 'Super Admin',
        description: 'Acceso total al sistema',
      },
    });

    // Si el usuario ya existe no hace nada
    const existing = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (existing) {
      this.logger.log(`Usuario administrador ya existe: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await this.prisma.adminUser.create({
      data: {
        email,
        fullname: 'Super Administrador',
        password: hashedPassword,
        roleId: role.id,
        status: 'ACTIVE',
      },
    });

    this.logger.log(`Usuario administrador inicial creado: ${email}`);
  }
}
