import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class UsersGuard implements CanActivate {
    constructor (
        private service: UsersService
    ) {}

    async canActivate (context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        return this.service.validateUser(req);
    }
}
