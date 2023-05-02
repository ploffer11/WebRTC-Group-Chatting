import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.headers.authorization.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      Object.assign(client.data, payload);
      console.log(payload);
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid Jwt');
    }
  }
}
