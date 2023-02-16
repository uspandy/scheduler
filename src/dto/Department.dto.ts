import { ApiProperty } from '@nestjs/swagger';

const idParam = {
    description: 'Department id',
};

const nameParam = {
    description: 'Department name',
};

export class DepartmentResponse {
    @ApiProperty(idParam)
    id: string;

    @ApiProperty(nameParam)
    name: string;

    constructor(v?: DepartmentResponse) {
        if (v) {
            this.id = v.id;
            this.name = v.name;
        }
    }
}
