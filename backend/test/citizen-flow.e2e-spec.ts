import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AllExceptionsFilter } from './../src/common/filters/http-exception.filter';

describe('Citizen Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testDeviceId = 'test-device-uuid-999';

  jest.setTimeout(60000);

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.setGlobalPrefix('api');
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
      app.useGlobalFilters(new AllExceptionsFilter());
      
      prisma = app.get(PrismaService);
      await app.init();

      // Cleanup test data
      await prisma.reportStatusHistory.deleteMany({
        where: { report: { deviceProfile: { deviceUuid: testDeviceId } } }
      });
      await prisma.report.deleteMany({
        where: { deviceProfile: { deviceUuid: testDeviceId } }
      });
      await prisma.deviceProfile.deleteMany({
        where: { deviceUuid: testDeviceId }
      });
    } catch (error) {
      console.error('Error in beforeAll:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (app) {
      // ✅ Limpiar datos de prueba
      try {
        await prisma.reportStatusHistory.deleteMany({
          where: { report: { deviceProfile: { deviceUuid: testDeviceId } } }
        });
        await prisma.report.deleteMany({
          where: { deviceProfile: { deviceUuid: testDeviceId } }
        });
        await prisma.deviceProfile.deleteMany({
          where: { deviceUuid: testDeviceId }
        });
      } catch (error) {
        console.error('Error cleaning up test data:', error);
      }

      // ✅ Cerrar aplicación y Prisma
      await app.close();
      await prisma.$disconnect();
    }
  });

  describe('Report Submission and Retrieval', () => {
    let reportPublicId: string;
    let testColonyId: string;

    it('should find or create a colony for testing', async () => {
      // ✅ PRIMERO: Buscar o crear SECTOR (requerido por Colony)
      let sector = await prisma.sector.findFirst();
      if (!sector) {
        sector = await prisma.sector.create({
          data: { name: `SECTOR_TEST_E2E_${Date.now()}` }
        });
      }

      // ✅ SEGUNDO: Buscar o crear COLONY con sectorId
      let colony = await prisma.colony.findFirst();
      if (!colony) {
        colony = await prisma.colony.create({
          data: {
            name: `COLONIA_TEST_E2E_${Date.now()}`,
            sectorId: sector.id  // ✅ REQUERIDO - ahora presente
          }
        });
      }

      testColonyId = colony.id;
      expect(testColonyId).toBeDefined();
      expect(testColonyId).toMatch(/^[a-f0-9-]{36}$/); // UUID format
    });

    it('POST /api/reports/app - should create a new report', async () => {
      expect(testColonyId).toBeDefined();

      const reportPayload = {
        colonyId: testColonyId,
        type: 'NO_WATER',
        description: 'Prueba de integración E2E - Sin agua en mi sector',
        reporterName: 'Tester Citizen',
        reporterPhone: '99999999'
      };

      const response = await request(app.getHttpServer())
        .post('/api/reports/app')
        .set('x-device-id', testDeviceId)
        .set('x-device-fingerprint', 'test-fingerprint')
        .send(reportPayload);

      // ✅ Log detallado si falla
      if (response.status !== 201) {
        console.error('❌ Report creation failed');
        console.error('Status:', response.status);
        console.error('Body:', JSON.stringify(response.body, null, 2));
        console.error('Payload:', JSON.stringify(reportPayload, null, 2));
      }

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('publicId');
      reportPublicId = response.body.publicId;
      expect(reportPublicId).toBeDefined();
    });

    it('GET /api/reports/app - should list the created report', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reports/app')
        .set('x-device-id', testDeviceId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some(r => r.publicId === reportPublicId)).toBe(true);
    });
  });
});
