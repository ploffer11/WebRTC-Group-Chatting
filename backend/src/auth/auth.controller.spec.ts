import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

import { createRequest } from 'node-mocks-http';

const moduleMocker = new ModuleMocker(global);

describe('AuthController', () => {
  const TEST_CREDENTIALS = {
    username: 'webrtc',
    password: 'webrtc',
  };

  const TEST_ACCESS_TOKEN = 'webrtc_test_access_token';

  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return {
            validateUser: () => ({ username: TEST_CREDENTIALS.username }),
            login: () => ({
              access_token: TEST_ACCESS_TOKEN,
            }),
          };
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login as default user', async () => {
    const loginResult = await controller.login(
      createRequest({
        body: TEST_CREDENTIALS,
      }),
    );

    expect(loginResult.access_token).toEqual(TEST_ACCESS_TOKEN);
  });
});
