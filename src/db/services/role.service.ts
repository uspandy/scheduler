import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEnum } from 'src/consts';
import { In, Repository } from 'typeorm';

import { RoleEntity } from '../entities/role.entity';

@Injectable()
export class RoleDatabaseService {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
    ) {}

    findByNames(names: RolesEnum[]): Promise<RoleEntity[]> {
        return this.roleRepository.find({ where: { name: In(names) }});
    }
}
