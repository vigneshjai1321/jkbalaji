import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { SKIP_TAB_UNLOCK_KEY } from './skip-tab-unlock.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {
    super();
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const activated = (await super.canActivate(context)) as boolean;
    if (!activated) return false;

    const skipTab = this.reflector.getAllAndOverride<boolean>(SKIP_TAB_UNLOCK_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipTab) return true;

    const req = context.switchToHttp().getRequest<{ user?: { sub: string; sid?: string }; headers: Record<string, unknown> }>();
    if (req.user?.sub) {
      this.auth.requireTabUnlock(req.user, req.headers);
    }
    return true;
  }
}
