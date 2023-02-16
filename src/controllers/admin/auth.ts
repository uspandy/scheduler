import {
    Controller,
} from '@nestjs/common';
import {
    ApiHeader,
    ApiTags,
} from '@nestjs/swagger';
import { RolesEnum } from 'src/consts';
import { AuthService } from 'src/services/auth';

import { BaseAuthController } from '../baseAuth';
import { baseApiHeadersParams } from '../helpers/helpers';


@ApiHeader(baseApiHeadersParams)
@ApiTags('admin/auth')
@Controller('admin/auth')
export class AdminAuthController extends BaseAuthController {
    constructor(
        readonly authService: AuthService,
    ) {
        super([RolesEnum.ADMIN], authService);
    }
}
