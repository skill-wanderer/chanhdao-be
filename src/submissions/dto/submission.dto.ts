import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject } from 'class-validator';
import { SubmissionType } from '../entities/submission.entity';

export class CreateSubmissionDto {
  @ApiProperty({
    enum: SubmissionType,
    example: SubmissionType.CONTACT,
    description: 'Submission category. Extendable for future types.',
  })
  @IsEnum(SubmissionType)
  type: SubmissionType;

  @ApiProperty({
    example: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'I want to know more about your courses.',
    },
    description: 'Flexible payload stored as jsonb in PostgreSQL.',
  })
  @IsObject()
  content: Record<string, unknown>;
}

export class SubmissionResponseDto {
  @ApiProperty({ example: 'd4a4a649-35b3-4f4c-92cb-26cdf8f17b6f' })
  id: string;

  @ApiProperty({
    enum: SubmissionType,
    example: SubmissionType.CONTACT,
  })
  type: SubmissionType;

  @ApiProperty({
    example: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'I want to know more about your courses.',
    },
  })
  content: Record<string, unknown>;

  @ApiProperty({ example: '2026-03-20T09:00:00.000Z' })
  createdAt: Date;
}
