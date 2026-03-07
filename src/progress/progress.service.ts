import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonCompletion } from './entities/lesson-completion.entity';
import {
  MarkLessonCompleteResponseDto,
  LessonCompletionStatusDto,
  CourseCompletionsResponseDto,
} from './dto/progress-response.dto';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(
    @InjectRepository(LessonCompletion)
    private readonly completionRepo: Repository<LessonCompletion>,
  ) {}

  async markComplete(
    userId: string,
    courseSlug: string,
    lessonSlug: string,
  ): Promise<{ data: MarkLessonCompleteResponseDto; alreadyExisted: boolean }> {
    const existing = await this.completionRepo.findOne({
      where: { userId, courseSlug, lessonSlug },
    });

    if (existing) {
      return {
        data: {
          courseSlug: existing.courseSlug,
          lessonSlug: existing.lessonSlug,
          completedAt: existing.completedAt,
        },
        alreadyExisted: true,
      };
    }

    const completion = this.completionRepo.create({
      userId,
      courseSlug,
      lessonSlug,
    });
    const saved = await this.completionRepo.save(completion);
    this.logger.log(
      `User ${userId} completed lesson ${lessonSlug} in course ${courseSlug}`,
    );

    return {
      data: {
        courseSlug: saved.courseSlug,
        lessonSlug: saved.lessonSlug,
        completedAt: saved.completedAt,
      },
      alreadyExisted: false,
    };
  }

  async unmarkComplete(
    userId: string,
    courseSlug: string,
    lessonSlug: string,
  ): Promise<void> {
    await this.completionRepo.delete({ userId, courseSlug, lessonSlug });
    this.logger.log(
      `User ${userId} unmarked lesson ${lessonSlug} in course ${courseSlug}`,
    );
  }

  async getCompletionStatus(
    userId: string,
    courseSlug: string,
    lessonSlug: string,
  ): Promise<LessonCompletionStatusDto> {
    const completion = await this.completionRepo.findOne({
      where: { userId, courseSlug, lessonSlug },
    });

    return {
      completed: !!completion,
      completedAt: completion?.completedAt ?? null,
    };
  }

  async getCourseCompletions(
    userId: string,
    courseSlug: string,
  ): Promise<CourseCompletionsResponseDto> {
    const completions = await this.completionRepo.find({
      where: { userId, courseSlug },
      order: { completedAt: 'ASC' },
    });

    return {
      courseSlug,
      completedLessons: completions.map((c) => ({
        lessonSlug: c.lessonSlug,
        completedAt: c.completedAt,
      })),
    };
  }
}
