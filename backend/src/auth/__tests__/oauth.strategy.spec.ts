import { Test, TestingModule } from '@nestjs/testing';
import { OAuthAuthStrategy } from '../strategies/oauth.strategy';
import { NotImplementedException } from '@nestjs/common';

describe('OAuthAuthStrategy', () => {
  let strategy: OAuthAuthStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OAuthAuthStrategy],
    }).compile();

    strategy = module.get<OAuthAuthStrategy>(OAuthAuthStrategy);
  });

  describe('authenticate', () => {
    // TODO: Test that authenticate throws NotImplementedException
    // TODO: Document expected interface when OAuth is implemented
  });

  describe('generateTokens', () => {
    // TODO: Test that generateTokens throws NotImplementedException
  });

  describe('validateToken', () => {
    // TODO: Test that validateToken throws NotImplementedException
  });

  describe('refreshToken', () => {
    // TODO: Test that refreshToken throws NotImplementedException
  });

  describe('revokeToken', () => {
    // TODO: Test that revokeToken throws NotImplementedException
  });

  describe('getStrategyName', () => {
    // TODO: Test strategy name returns 'OAUTH'
  });

  describe('getTokenExpiration', () => {
    // TODO: Test expiration returns 7 days (604800000 ms)
    // TODO: Document expected OAuth token lifespan
  });
});
