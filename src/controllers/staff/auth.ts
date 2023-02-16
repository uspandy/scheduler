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
@ApiTags('staff/auth')
@Controller('staff/auth')
export class StaffAuthController extends BaseAuthController {
    constructor(
        readonly authService: AuthService,
    ) {
        super([RolesEnum.STAFF], authService);
    }
}
