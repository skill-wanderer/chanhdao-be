import { ApiProperty } from '@nestjs/swagger';

export class MarkLessonCompleteResponseDto {
  @ApiProperty({ example: 'manual-software-testing-black-box-techniques' })
  courseSlug: string;

  @ApiProperty({ example: 'what-is-software-testing' })
  lessonSlug: string;

  @ApiProperty({ example: '2026-03-07T10:30:00.000Z' })
  completedAt: Date;
}

export class LessonCompletionStatusDto {
  @ApiProperty({ example: true })
  completed: boolean;

  @ApiProperty({ example: '2026-03-07T10:30:00.000Z', nullable: true })
  completedAt: Date | null;
}

export class CompletedLessonDto {
  @ApiProperty({ example: 'what-is-software-testing' })
  lessonSlug: string;

  @ApiProperty({ example: '2026-03-07T10:30:00.000Z' })
  completedAt: Date;
}

export class CourseCompletionsResponseDto {
  @ApiProperty({ example: 'manual-software-testing-black-box-techniques' })
  courseSlug: string;

  @ApiProperty({ type: [CompletedLessonDto] })
  completedLessons: CompletedLessonDto[];
}
