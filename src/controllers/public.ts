import {
    Controller,
    Get,
} from '@nestjs/common';
import {
    ApiHeader,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { AboutResponse } from 'src/dto/About.dto';
import { DepartmentResponse } from 'src/dto/Department.dto';
import { DepartmentService } from 'src/services/department';
import { JwtService } from 'src/services/jwt';

import { baseApiHeadersParams } from './helpers/helpers';


@ApiHeader(baseApiHeadersParams)
@ApiTags('public')
@Controller('public')
export class PublicController {
    constructor(
        private readonly jwtService: JwtService,
        private readonly departmentService: DepartmentService,
    ) {}

    // It's just test endpoint (JWK OpenID Connect currently not supported)
    @Get('jwt-public-key')
    @ApiOperation({
        summary: 'Get JWT public key (base64, not JWK)',
    })
    @ApiResponse({
        status: 200,
        description: 'JWT public key (base64)',
        type: String,
    })
    getPublicKey(
    ): Promise<string> {
        return Promise.resolve(this.jwtService.base64PublicKey);
    }

    @Get('departments')
    @ApiOperation({
        summary: 'Get departments list',
    })
    @ApiResponse({
        status: 200,
        description: 'Get departments list',
        type: DepartmentResponse,
        isArray: true,
    })
    getDepartments(
    ): Promise<DepartmentResponse[]> {
        return this.departmentService.getAll();
    }

    // eslint-disable-next-line class-methods-use-this
    @Get('about')
    @ApiOperation({
        summary: 'Current instance info',
    })
    @ApiResponse({
        status: 200,
        description: 'Info about current instance',
        type: AboutResponse,
    })
    about(): AboutResponse {
        return new AboutResponse();
    }
}
