import { BadRequestException, Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { SkipTabUnlock } from './skip-tab-unlock.decorator.js';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: { email?: string; password?: string }, @Req() req: Request) {
    return this.auth.login(body.email ?? '', body.password ?? '', req);
  }

  @Get('me')
  @SkipTabUnlock()
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request & { user: { sub: string } }) {
    return this.auth.me(req.user.sub);
  }

  @Post('verify-tab')
  @SkipTabUnlock()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  verifyTab(
    @Req() req: Request & { user: { sub: string; sid?: string } },
    @Body() body: { password?: string; tabId?: string },
  ) {
    return this.auth.verifyTab(req.user.sub, req.user.sid, body.password ?? '', body.tabId ?? '', req);
  }

  @Post('logout')
  @SkipTabUnlock()
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: Request & { user: { sub: string; sid?: string } }) {
    return this.auth.logout(req.user.sub, req.user.sid);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  changePassword(
    @Req() req: Request & { user: { sub: string } },
    @Body() body: { currentPassword?: string; newPassword?: string },
  ) {
    const currentPassword = body.currentPassword ?? '';
    const newPassword = body.newPassword ?? '';
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current and new password are required');
    }
    return this.auth.changePassword(req.user.sub, currentPassword, newPassword, req);
  }
}
