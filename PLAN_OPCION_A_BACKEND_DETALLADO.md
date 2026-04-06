# 🔧 PLAN OPCIÓN A - BACKEND DETALLADO

**Duración Total**: 4.5 horas
**Módulos a Modificar**: auth, common, users, excel
**Nuevo Package**: class-validator, class-transformer (ya deberían estar instalados)

---

## ⏱️ TIMELINE

```
1. DTOs con Validación         → 1.5 horas
2. POST /api/auth/refresh      → 1.5 horas
3. Global Exception Filter     → 1.0 hora
4. Verificar Integraciones     → 0.5 horas
─────────────────────────────────────────
TOTAL                          → 4.5 horas
```

---

# 📋 PARTE 1: DTOS CON CLASS-VALIDATOR (1.5h)

## Paso 1.1: Verificar Dependencias Instaladas

```bash
cd backend
npm list class-validator class-transformer
```

**Si NO están instaladas:**
```bash
npm install class-validator class-transformer --save
```

**Si YES están, continuar.**

---

## Paso 1.2: Archivos DTOs a Crear/Actualizar

### 1.2.1 `backend/src/auth/dto/login.dto.ts` (NUEVO)

```typescript
import { IsEmail, MinLength, MaxLength, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(6, { message: 'Mínimo 6 caracteres' })
  @MaxLength(64, { message: 'Máximo 64 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty()
  strategyName: string;
}

export class LoginResponseDto {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export class RefreshTokenDto {
  access_token: string;
}
```

### 1.2.2 `backend/src/users/dto/create-user.dto.ts` (ACTUALIZAR)

```typescript
import { IsEmail, MinLength, MaxLength, IsNotEmpty, IsEnum, IsString } from 'class-validator';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export class CreateUserDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mínimo 6 caracteres' })
  @MaxLength(32, { message: 'Máximo 32 caracteres' })
  password: string;

  @IsEnum(UserRole, { message: 'Rol inválido' })
  role: UserRole;

  @IsString()
  @IsNotEmpty({ message: 'Nombre requerido' })
  name?: string;
}

export class UpdateUserDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  email?: string;

  @IsEnum(UserRole, { message: 'Rol inválido' })
  role?: UserRole;

  @IsString()
  name?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  role: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.2.3 `backend/src/schedules/dto/schedule.dto.ts` (ACTUALIZAR)

```typescript
import { IsString, IsNotEmpty, IsDate, IsOptional, IsArray } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty({ message: 'Sector requerido' })
  sector: string;

  @IsString()
  @IsNotEmpty({ message: 'Colonia requerida' })
  colony: string;

  @IsString()
  @IsNotEmpty({ message: 'Período requerido' })
  period: string;

  @IsArray()
  @IsNotEmpty({ message: 'Horarios requeridos' })
  scheduleEntries: any[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  colony?: string;

  @IsOptional()
  @IsArray()
  scheduleEntries?: any[];
}

export class ScheduleResponseDto {
  id: string;
  sector: string;
  colony: string;
  period: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.2.4 `backend/src/reports/dto/report.dto.ts` (ACTUALIZAR)

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum ReportStatus {
  ENVIADO = 'ENVIADO',
  EN_REVISION = 'EN_REVISION',
  VALIDADO = 'VALIDADO',
  RESUELTO = 'RESUELTO',
  RECHAZADO = 'RECHAZADO',
}

export class CreateReportDto {
  @IsString()
  @IsNotEmpty({ message: 'Descripción requerida' })
  description: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  colonyName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus, { message: 'Estado inválido' })
  status: ReportStatus;

  @IsString()
  @IsOptional()
  resolution?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReportResponseDto {
  id: string;
  description: string;
  status: string;
  deviceId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Paso 1.3: Crear Validation Pipe Global

### `backend/src/common/pipes/validation.pipe.ts` (NUEVO)

```typescript
import { Injectable, BadRequestException, ValidationPipe } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });
  }
}
```

---

## Paso 1.4: Registrar Validation Pipe Global

### Modificar `backend/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ AGREGAR ESTA LÍNEA
  app.useGlobalPipes(new CustomValidationPipe());

  // Swagger config (ya debería estar)
  const config = new DocumentBuilder()
    .setTitle('AguaDC API')
    .setDescription('API de distribución de agua')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`✅ API running on http://localhost:3000`);
}

bootstrap();
```

---

# 📋 PARTE 2: POST /api/auth/refresh (1.5h)

## Paso 2.1: Actualizar AuthService

### Modificar `backend/src/auth/auth.service.ts`

Buscar la clase `AuthService` y agregar este método:

```typescript
// Dentro de la clase AuthService

async refreshToken(user: any): Promise<{ access_token: string }> {
  // user viene del JwtAuthGuard
  const payload = { sub: user.id, email: user.email, role: user.role };

  const token = this.jwtService.sign(payload, {
    expiresIn: '24h',
    secret: process.env.JWT_SECRET,
  });

  return {
    access_token: token,
  };
}

// Método helper para validar y decodificar JWT
validateToken(token: string): any {
  try {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    return decoded;
  } catch (error) {
    throw new UnauthorizedException('Token inválido o expirado');
  }
}
```

---

## Paso 2.2: Crear Refresh Controller Endpoint

### Modificar `backend/src/auth/auth.controller.ts`

Agregar este endpoint DESPUÉS del endpoint `/login`:

```typescript
import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // endpoint existente...
  }

  // ✅ AGREGAR ESTE ENDPOINT
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      properties: {
        access_token: { type: 'string' },
      },
    },
  })
  async refreshToken(@Req() req: any) {
    const user = req.user; // JwtAuthGuard extrae user del token

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado en token');
    }

    const result = await this.authService.refreshToken(user);
    return result;
  }
}
```

---

## Paso 2.3: Verificar JwtAuthGuard Existe

### Verificar `backend/src/auth/guards/jwt-auth.guard.ts`

Este archivo debería existir. Si NO existe, crear:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('No autorizado');
    }
    return user;
  }
}
```

---

## Paso 2.4: Verificar Passport JWT Strategy

### Verificar `backend/src/auth/strategies/jwt.strategy.ts`

Debería contener:

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'agua_dc_secure_secret_2026',
    });
  }

  async validate(payload: any) {
    // payload = { sub: userId, email, role }
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
```

---

# 📋 PARTE 3: GLOBAL EXCEPTION FILTER (1h)

## Paso 3.1: Crear Global Exception Filter

### Crear `backend/src/common/filters/http-exception.filter.ts` (NUEVO)

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno del servidor';
    let error = 'Internal Server Error';

    // ========== HTTP EXCEPTIONS ==========
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const responseObject = exceptionResponse as any;

        // BadRequestException (DTOs)
        if (exception instanceof BadRequestException) {
          error = 'Bad Request';
          message = responseObject.message || 'Datos inválidos';
          if (Array.isArray(message)) {
            message = message.map((m) => m.replace(/,/g, ',')); // formato
          }
        }
        // UnauthorizedException
        else if (exception instanceof UnauthorizedException) {
          error = 'Unauthorized';
          message = responseObject.message || 'No autorizado';
        }
        // ForbiddenException
        else if (exception instanceof ForbiddenException) {
          error = 'Forbidden';
          message = responseObject.message || 'Acceso denegado';
        }
        // NotFoundException
        else if (exception instanceof NotFoundException) {
          error = 'Not Found';
          message = responseObject.message || 'Recurso no encontrado';
        }
        // ConflictException
        else if (exception instanceof ConflictException) {
          error = 'Conflict';
          message = responseObject.message || 'Conflicto en los datos';
        }
        // Generic HTTP
        else {
          error = responseObject.error || 'Error';
          message = responseObject.message || 'Error en la solicitud';
        }
      }
    }
    // ========== VALIDATION ERRORS ==========
    else if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message || 'Validación fallida';
    }
    // ========== DATABASE ERRORS ==========
    else if (exception instanceof Error) {
      const err = exception as any;

      // Prisma unique constraint
      if (err.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        error = 'Conflict';
        message = `El campo ${err.meta?.target?.[0] || 'unknown'} ya existe`;
      }
      // Prisma not found
      else if (err.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        error = 'Not Found';
        message = 'Registro no encontrado';
      }
      // Generic error
      else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        error = 'Internal Server Error';
        message = err.message || 'Error interno del servidor';
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    console.error(`[${request.method}] ${request.url}`, {
      statusCode: status,
      error,
      message,
      exception: exception instanceof Error ? exception.message : exception,
    });

    response.status(status).json(errorResponse);
  }
}
```

---

## Paso 3.2: Registrar Filter Global en main.ts

### Modificar `backend/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ AGREGAR FILTERS ANTES DE PIPES
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new CustomValidationPipe());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('AguaDC API')
    .setDescription('API de distribución de agua')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`✅ API running on http://localhost:3000`);
}

bootstrap();
```

---

## Paso 3.3: Actualizar app.module.ts

### Modificar `backend/src/app.module.ts`

Verificar que importe todas las DTOs:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchedulesModule } from './schedules/schedules.module';
import { ReportsModule } from './reports/reports.module';
import { ExcelModule } from './excel/excel.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SchedulesModule,
    ReportsModule,
    ExcelModule,
    CommonModule,
  ],
})
export class AppModule {}
```

---

# 📋 PARTE 4: VERIFICAR INTEGRACIONES (0.5h)

## Paso 4.1: Compilar Backend

```bash
cd backend
npm run build
```

**Esperado**: Compila sin errores (0 warnings deseables)

---

## Paso 4.2: Test de DTOs - Via Swagger

```bash
cd backend
npm run start:dev
```

Luego abre en navegador: `http://localhost:3000/api/docs`

### Test 1: Login

```bash
POST /api/auth/login
Body:
{
  "email": "carlos_admin",
  "password": "Tu_Clave_Secreta_Aqui_2026!",
  "strategyName": "jwt"
}

Esperado: 201 Created
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "carlos_admin",
    "role": "super_admin"
  }
}
```

### Test 2: Refresh Token

```bash
POST /api/auth/refresh
Headers:
  Authorization: Bearer eyJhbGc... (token del Test 1)

Esperado: 200 OK
{
  "access_token": "eyJhbGc... (nuevo token)"
}
```

### Test 3: DTO Validation Error

```bash
POST /api/auth/login
Body:
{
  "email": "invalid-email",
  "password": "123",
  "strategyName": "jwt"
}

Esperado: 400 Bad Request
{
  "statusCode": 400,
  "timestamp": "2026-04-06T...",
  "path": "/api/auth/login",
  "method": "POST",
  "message": [
    "El email debe ser válido",
    "Mínimo 6 caracteres"
  ],
  "error": "Bad Request"
}
```

### Test 4: Unauthorized

```bash
POST /api/auth/refresh
Headers:
  Authorization: Bearer invalid_token

Esperado: 401 Unauthorized
{
  "statusCode": 401,
  "timestamp": "2026-04-06T...",
  "path": "/api/auth/refresh",
  "method": "POST",
  "message": "Token inválido o expirado",
  "error": "Unauthorized"
}
```

---

## Paso 4.3: Verificación de Archivos

```bash
cd backend

# Verificar archivos creados/modificados
ls -la src/auth/dto/
ls -la src/users/dto/
ls -la src/common/filters/
ls -la src/common/pipes/

# Verificar imports en main.ts
grep -n "AllExceptionsFilter\|CustomValidationPipe" src/main.ts
```

---

## Paso 4.4: Conectar con Admin Panel

En `admin-panel/src/api/client.ts`, verifica que el interceptor maneje 401:

```typescript
// Detectar 401 y llamar refresh
if (response.status === 401) {
  try {
    // POST /api/auth/refresh con token viejo
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${oldToken}`,
      },
    });

    if (refreshResponse.ok) {
      const { access_token } = await refreshResponse.json();
      localStorage.setItem('aguadc_token', access_token);

      // Reintentar request original
      return fetch(url, { ...options, headers: newHeaders });
    }
  } catch (error) {
    // Fallback a login
    window.location.href = '/login';
  }
}
```

---

# ✅ CHECKLIST DE COMPLETION

```
[ ] 1.1 - DTOs creados: login.dto.ts
[ ] 1.2 - DTOs actualizados: create-user.dto.ts
[ ] 1.3 - DTOs actualizados: schedule.dto.ts
[ ] 1.4 - DTOs actualizados: report.dto.ts
[ ] 1.5 - Validation Pipe creado
[ ] 1.6 - main.ts actualizado con Validation Pipe

[ ] 2.1 - AuthService.refreshToken() implementado
[ ] 2.2 - AuthService.validateToken() implementado
[ ] 2.3 - POST /api/auth/refresh endpoint agregado
[ ] 2.4 - JwtAuthGuard existe y funciona
[ ] 2.5 - JWT Strategy configurada

[ ] 3.1 - Global Exception Filter creado
[ ] 3.2 - main.ts actualizado con filter
[ ] 3.3 - app.module.ts verificado

[ ] 4.1 - npm run build: ✅ 0 errors
[ ] 4.2 - Test Login: ✅ 201 Created
[ ] 4.3 - Test Refresh: ✅ 200 OK
[ ] 4.4 - Test DTO Error: ✅ 400 Bad Request
[ ] 4.5 - Test 401: ✅ 401 Unauthorized
```

---

# 🚀 COMANDOS RÁPIDOS

```bash
# 1. Instalar deps
cd backend && npm install

# 2. Compilar
npm run build

# 3. Desarrollar
npm run start:dev

# 4. Tests
npm test

# 5. Ver DB
npx prisma studio

# 6. Limpiar
npm run lint && npm run format
```

---

# 📝 NOTAS IMPORTANTES

1. **class-validator** debe estar en `backend/package.json`
   - Si NO está: `npm install class-validator class-transformer`

2. **JWT_SECRET** en `.env` debe ser consistente
   - Backend: `JWT_SECRET="agua_dc_secure_secret_2026"`

3. **Token expira en 24h** - cambiar en `authService.generateToken()`
   - `expiresIn: '24h'` o menos si prefieres

4. **Refresh no olvida token viejo** - esto es seguridad
   - Cliente debe guardar nuevo token en localStorage

5. **Errores de validación** se formatean automáticamente
   - Admin panel recibe array de mensajes

6. **Global Filter** maneja TODOS los errores
   - Prisma, HTTP, custom, etc.

---

# 💾 ARCHIVOS MODIFICADOS RESUMEN

```
CREADOS (3):
- backend/src/auth/dto/login.dto.ts
- backend/src/common/pipes/validation.pipe.ts
- backend/src/common/filters/http-exception.filter.ts

ACTUALIZADOS (7):
- backend/src/main.ts (+ 2 líneas)
- backend/src/auth/auth.service.ts (+ 15 líneas)
- backend/src/auth/auth.controller.ts (+ 15 líneas)
- backend/src/users/dto/create-user.dto.ts (renovado)
- backend/src/schedules/dto/schedule.dto.ts (renovado)
- backend/src/reports/dto/report.dto.ts (renovado)
- backend/src/app.module.ts (verificado)

TOTAL: 10 archivos, ~150 líneas nuevas
```

---

*Plan detallado para OPCIÓN A - Backend - 4.5 horas*
*Última actualización: 06/04/2026*
