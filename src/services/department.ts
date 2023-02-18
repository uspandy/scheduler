import { Injectable } from '@nestjs/common';
import { DepartmentDatabaseService } from 'src/db/services/department.service';
import { DepartmentResponse } from 'src/dto/Department.dto';


@Injectable()
export class DepartmentService {
    constructor(
        private readonly departmentService: DepartmentDatabaseService,
    ) {}

    getAll(): Promise<DepartmentResponse[]> {
        return this.departmentService.findAll().then(list => list.map(v => new DepartmentResponse(v)));
    }
}
