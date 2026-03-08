import { ApiProperty } from '@nestjs/swagger';

export class QuizScoreResponseDto {
  @ApiProperty({ example: 'manual-software-testing-black-box-techniques' })
  courseSlug: string;

  @ApiProperty({ example: 'module-1-summary-and-takeaway' })
  lessonSlug: string;

  @ApiProperty({ example: 4 })
  score: number;

  @ApiProperty({ example: 5 })
  totalQuestions: number;

  @ApiProperty({ example: 80 })
  scorePercentage: number;

  @ApiProperty({ example: true })
  passed: boolean;

  @ApiProperty({ example: '2026-03-08T14:30:00.000Z' })
  submittedAt: Date;
}

export class QuizScoreNotFoundResponseDto {
  @ApiProperty({ example: null, nullable: true })
  score: number | null;

  @ApiProperty({ example: null, nullable: true })
  totalQuestions: number | null;

  @ApiProperty({ example: null, nullable: true })
  scorePercentage: number | null;

  @ApiProperty({ example: null, nullable: true })
  passed: boolean | null;

  @ApiProperty({ example: null, nullable: true })
  submittedAt: Date | null;
}
