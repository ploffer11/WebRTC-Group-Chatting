import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

import { Socket } from 'socket.io';

import {
  IClientToServerEvents,
  IInterServerEvents,
  IServerToClientEvents,
  ISocketData,
} from '@schema/ws';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context
      .switchToWs()
      .getClient<
        Socket<
          IClientToServerEvents,
          IServerToClientEvents,
          IInterServerEvents,
          ISocketData
        >
      >();
    const authorizationHeader = client.handshake.headers.authorization;
    if (!authorizationHeader) throw new WsException('Invalid Header');

    try {
      const [, token] = authorizationHeader.split(' ');
      const payload = this.jwtService.verify<Express.User>(token);
      client.data = {
        user: { username: payload.username, socketId: client.id },
      };
      console.log(payload);
      return true;
    } catch (e) {
      throw new WsException('Invalid Jwt token');
    }
  }
}
