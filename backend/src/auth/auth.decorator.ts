import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IUserTag } from '@schema/auth';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUserTag => {
    const request = ctx.switchToHttp().getRequest();
    return { username: request.user.username };
  },
);
