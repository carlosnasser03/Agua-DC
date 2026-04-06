import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { IAuthStrategy, IAuthPayload, IAuthTokens } from '../interfaces/IAuthStrategy';
import { BadRequestException } from '@nestjs/common';

describe('AuthService (Strategy Router)', () => {
  let authService: AuthService;
  let jwtStrategy: IAuthStrategy;
  let deviceStrategy: IAuthStrategy;
  let oauthStrategy: IAuthStrategy;
  let strategiesMap: Map<string, IAuthStrategy>;

  beforeEach(async () => {
    // Mock strategy implementations
    jwtStrategy = {
      authenticate: jest.fn(),
      generateTokens: jest.fn(),
      validateToken: jest.fn(),
      refreshToken: jest.fn(),
      revokeToken: jest.fn(),
      getStrategyName: jest.fn().mockReturnValue('JWT'),
      getTokenExpiration: jest.fn().mockReturnValue(86400000),
    };

    deviceStrategy = {
      authenticate: jest.fn(),
      generateTokens: jest.fn(),
      validateToken: jest.fn(),
      refreshToken: jest.fn(),
      revokeToken: jest.fn(),
      getStrategyName: jest.fn().mockReturnValue('DEVICE'),
      getTokenExpiration: jest.fn().mockReturnValue(0),
    };

    oauthStrategy = {
      authenticate: jest.fn(),
      generateTokens: jest.fn(),
      validateToken: jest.fn(),
      refreshToken: jest.fn(),
      revokeToken: jest.fn(),
      getStrategyName: jest.fn().mockReturnValue('OAUTH'),
      getTokenExpiration: jest.fn().mockReturnValue(604800000),
    };

    strategiesMap = new Map([
      ['jwt', jwtStrategy],
      ['device', deviceStrategy],
      ['oauth', oauthStrategy],
    ]);

    authService = new AuthService(strategiesMap);
  });

  describe('login', () => {
    // TODO: Test login delegates to JWT strategy by default
    // TODO: Test login with explicit strategy name
    // TODO: Test login with unknown strategy throws BadRequestException
    // TODO: Test login response includes access_token, refresh_token, user info
    // TODO: Test strategy.authenticate is called with credentials
    // TODO: Test strategy.generateTokens is called with payload
  });

  describe('validateToken', () => {
    // TODO: Test validateToken delegates to specified strategy
    // TODO: Test validateToken with unknown strategy throws BadRequestException
    // TODO: Test validateToken returns payload from strategy
  });

  describe('getAvailableStrategies', () => {
    // TODO: Test returns array of strategy names ['jwt', 'device', 'oauth']
    // TODO: Test returns empty array if no strategies registered
  });

  describe('Strategy Routing', () => {
    // TODO: Test each strategy can be independently selected
    // TODO: Test strategy isolation (JWT auth doesn't call Device strategy)
    // TODO: Test multiple strategies can coexist without interference
  });

  describe('Integration', () => {
    // TODO: Test full login flow for JWT strategy
    // TODO: Test full login flow for Device strategy
    // TODO: Test strategy switching mid-session
    // TODO: Test error propagation from strategies
  });
});
