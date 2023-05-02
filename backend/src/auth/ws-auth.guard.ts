import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../../../schema/ws';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context
      .switchToWs()
      .getClient<
        Socket<
          ClientToServerEvents,
          ServerToClientEvents,
          InterServerEvents,
          SocketData
        >
      >();
    const token = client.handshake.headers.authorization.split(' ')[1];
    try {
      const payload = this.jwtService.verify<Express.User>(token);
      client.data = {
        user: { ...payload },
      };
      console.log(payload);
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid Jwt');
    }
  }
}
