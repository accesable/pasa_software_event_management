// roles.guard.ts
import { UserResponse } from '@app/common';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler()); // Get roles from the metadata
    if (!roles) {
      return true; // If no roles are defined, allow access
    }

    const request: Request = context.switchToHttp().getRequest();
    const user: any = request.user;

    if (roles.some(role => user.role.toLowerCase() === role.toLowerCase())) {
      return true;
    } else {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
  }
}
