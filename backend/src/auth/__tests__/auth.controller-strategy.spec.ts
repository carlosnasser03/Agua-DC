import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController (Strategy Support)', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            getAvailableStrategies: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/login', () => {
    // TODO: Test login with JWT strategy (email, password)
    // TODO: Test login with Device strategy (deviceUuid, platform, appVersion)
    // TODO: Test login defaults to JWT if no strategyName provided (backward compatibility)
    // TODO: Test login with invalid strategy name
    // TODO: Test response includes access_token, refresh_token, user info
  });

  describe('GET /auth/strategies', () => {
    // TODO: Test endpoint returns available strategies array
    // TODO: Test endpoint returns default strategy as 'jwt'
    // TODO: Test response structure: { available: [], default: 'jwt' }
  });

  describe('GET /auth/profile', () => {
    // TODO: Test requires JWT guard
    // TODO: Test returns authenticated user profile
    // TODO: Test 401 response without valid JWT
  });

  describe('Strategy Support in Controller', () => {
    // TODO: Test request body accepts multiple strategy types simultaneously
    // TODO: Test strategyName routing to correct service method
    // TODO: Test backward compatibility (no strategyName parameter)
  });
});
