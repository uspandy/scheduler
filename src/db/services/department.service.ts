import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { DepartmentEntity } from '../entities/department.entity';

@Injectable()
export class DepartmentDatabaseService {
    constructor(
        @InjectRepository(DepartmentEntity)
        private readonly departmentRepository: Repository<DepartmentEntity>,
    ) {}

    findByIds(ids: string[]): Promise<DepartmentEntity[]> {
        return this.departmentRepository.find({ where: { id: In(ids) }});
    }

    findAll(): Promise<DepartmentEntity[]> {
        return this.departmentRepository.find();
    }
}
