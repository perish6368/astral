import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FilesService } from '../files.service';

@Injectable()
export class WipeGuard implements CanActivate {
    constructor (
        private service: FilesService
    ) {}

    async canActivate (context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        return await this.service.validateDeletion(req);
    }
}
