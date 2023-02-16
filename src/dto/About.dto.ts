import { ApiProperty } from '@nestjs/swagger';

const startedAt = new Date().toISOString();

export class AboutResponse {
  @ApiProperty({
      description: 'Release version',
  })
  version: string;

  @ApiProperty({
      description: 'Current server time',
  })
  currentTime: string;

  @ApiProperty({
      description: 'Last started at',
  })
  startedAt: string;

  @ApiProperty({
      description: 'Stand name',
  })
  stand: string;

  constructor() {
      this.version = process.env.APP_VERSION ?? 'UNKNOWN';
      this.currentTime = new Date().toISOString();
      this.startedAt = startedAt;
      this.stand = process.env.APP_STAND_NAME ?? 'UNKNOWN';
  }
}
