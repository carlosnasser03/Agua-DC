import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Usado por AuthService para validar login
  async findOneByEmail(email: string) {
    return this.prisma.adminUser.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } }
          }
        }
      }
    });
  }

  // Listar todos los usuarios (sin exponer passwords)
  async findAll() {
    return this.prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        fullname: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        role: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Obtener un usuario por ID
  async findOne(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullname: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { id: true, name: true, description: true } }
      }
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // Crear nuevo usuario administrador
  async create(dto: { email: string; fullname: string; password: string; roleId: string }) {
    const exists = await this.prisma.adminUser.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Ya existe un usuario con ese correo');

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    return this.prisma.adminUser.create({
      data: {
        email: dto.email,
        fullname: dto.fullname,
        password: hashedPassword,
        roleId: dto.roleId,
        status: 'ACTIVE',
      },
      select: {
        id: true, email: true, fullname: true, status: true,
        role: { select: { id: true, name: true } }
      }
    });
  }

  // Actualizar usuario (nombre, rol, status)
  async update(id: string, dto: { fullname?: string; roleId?: string; status?: string }) {
    await this.findOne(id);
    return this.prisma.adminUser.update({
      where: { id },
      data: dto,
      select: {
        id: true, email: true, fullname: true, status: true,
        role: { select: { id: true, name: true } }
      }
    });
  }

  // Cambiar password de un usuario
  async changePassword(id: string, newPassword: string) {
    if (!newPassword || newPassword.trim().length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }
    await this.findOne(id);
    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.adminUser.update({
      where: { id },
      data: { password: hashed }
    });
    return { message: 'Contraseña actualizada correctamente' };
  }

  // Actualizar lastLogin
  async updateLastLogin(id: string) {
    return this.prisma.adminUser.update({
      where: { id },
      data: { lastLogin: new Date() }
    });
  }

  // Obtener todos los roles disponibles
  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } }
      }
    });
  }
}
