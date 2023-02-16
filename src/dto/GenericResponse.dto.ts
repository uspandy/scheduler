import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponse {
    @ApiPropertyOptional({
        description: 'Error message',
    })
    message?: string;

    @ApiProperty({
        description: 'Error code',
    })
    code: string;

    constructor(v?: ErrorResponse) {
        if (v) {
            this.message = v.message;
            this.code = v.code;
        }
    }
}

// TODO: Maybe use as global response interface (with data field)?
export class GenericResponse {
    @ApiProperty({
        description: 'Request status',
    })
    isSuccess: boolean;

    @ApiPropertyOptional({
        description: 'Request error',
    })
    error?: ErrorResponse;

    constructor(v?: GenericResponse) {
        if (v) {
            this.isSuccess = v.isSuccess;
            this.error = v.error ? new ErrorResponse(v.error) : undefined;
        }
    }
}
