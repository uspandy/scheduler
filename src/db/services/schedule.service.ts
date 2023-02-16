import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeRangeListQueryParams } from 'src/dto/ListGeneric.dto';
import { countOffset, normalizeDate } from 'src/utils/helpers';
import { And, LessThanOrEqual, MoreThanOrEqual, Repository, UpdateResult } from 'typeorm';

import { ScheduleEntity } from '../entities/schedule.entity';

export class ScheduleRepository extends Repository<ScheduleEntity> {}

@Injectable()
export class ScheduleDatabaseService {
    constructor(
        @InjectRepository(ScheduleEntity)
        private readonly scheduleRepository: ScheduleRepository,
    ) {}

    findByUserIdAndStartDate(
        userId: string,
        startDate: string,
    ): Promise<ScheduleEntity | null> {
        return this.scheduleRepository.findOneBy({
            user: { id: userId },
            startDate: normalizeDate(startDate),
        });
    }

    findAllByUserId(userId: string, params: TimeRangeListQueryParams): Promise<[ScheduleEntity[], number]> {
        const { page, perPage, from, to } = params;

        return this.scheduleRepository.findAndCount({
            where: {
                user: { id: userId },
                startDate: And(
                    MoreThanOrEqual(normalizeDate(from)),
                    LessThanOrEqual(normalizeDate(to)),
                ),
            },
            take: perPage,
            skip: countOffset(page, perPage),
            order: {
                startDate: 'DESC',
            },
        });
    }

    findById(id: string): Promise<ScheduleEntity | null> {
        return this.scheduleRepository.findOneBy({ id });
    }

    create(scheduleEntity: Partial<ScheduleEntity>): Promise<ScheduleEntity> {
        return this.scheduleRepository.save(this.scheduleRepository.create(scheduleEntity));
    }

    update(id: string, scheduleEntity: Partial<ScheduleEntity>): Promise<UpdateResult> {
        return this.scheduleRepository.update(id, scheduleEntity);
    }

    delete(id: string): Promise<UpdateResult> {
        return this.scheduleRepository.softDelete(id);
    }
}
