import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizScore } from './entities/quiz-score.entity';
import { SubmitQuizScoreDto } from './dto/submit-quiz-score.dto';
import { QuizScoreResponseDto, QuizScoreNotFoundResponseDto } from './dto/quiz-score-response.dto';

const PASS_THRESHOLD = 70;

@Injectable()
export class QuizScoresService {
  private readonly logger = new Logger(QuizScoresService.name);

  constructor(
    @InjectRepository(QuizScore)
    private readonly quizScoreRepo: Repository<QuizScore>,
  ) {}

  async submitScore(
    userId: string,
    courseSlug: string,
    lessonSlug: string,
    dto: SubmitQuizScoreDto,
  ): Promise<{ data: QuizScoreResponseDto; alreadyExisted: boolean }> {
    if (dto.score > dto.totalQuestions) {
      throw new BadRequestException('score must not exceed totalQuestions');
    }

    const expectedPercentage = Math.round((dto.score / dto.totalQuestions) * 100);
    if (dto.scorePercentage !== expectedPercentage) {
      throw new BadRequestException(
        `scorePercentage must match computed value (expected ${expectedPercentage})`,
      );
    }

    const passed = dto.scorePercentage >= PASS_THRESHOLD;

    const existing = await this.quizScoreRepo.findOne({
      where: { userId, courseSlug, lessonSlug },
    });

    if (existing) {
      existing.score = dto.score;
      existing.totalQuestions = dto.totalQuestions;
      existing.scorePercentage = dto.scorePercentage;
      existing.passed = passed;

      const saved = await this.quizScoreRepo.save(existing);
      this.logger.log(
        `User ${userId} updated quiz score for ${lessonSlug} in ${courseSlug}`,
      );

      return {
        data: {
          courseSlug: saved.courseSlug,
          lessonSlug: saved.lessonSlug,
          score: saved.score,
          totalQuestions: saved.totalQuestions,
          scorePercentage: saved.scorePercentage,
          passed: saved.passed,
          submittedAt: saved.updatedAt,
        },
        alreadyExisted: true,
      };
    }

    const quizScore = this.quizScoreRepo.create({
      userId,
      courseSlug,
      lessonSlug,
      score: dto.score,
      totalQuestions: dto.totalQuestions,
      scorePercentage: dto.scorePercentage,
      passed,
    });

    const saved = await this.quizScoreRepo.save(quizScore);
    this.logger.log(
      `User ${userId} submitted quiz score for ${lessonSlug} in ${courseSlug}`,
    );

    return {
      data: {
        courseSlug: saved.courseSlug,
        lessonSlug: saved.lessonSlug,
        score: saved.score,
        totalQuestions: saved.totalQuestions,
        scorePercentage: saved.scorePercentage,
        passed: saved.passed,
        submittedAt: saved.submittedAt,
      },
      alreadyExisted: false,
    };
  }

  async getScore(
    userId: string,
    courseSlug: string,
    lessonSlug: string,
  ): Promise<QuizScoreResponseDto | QuizScoreNotFoundResponseDto> {
    const existing = await this.quizScoreRepo.findOne({
      where: { userId, courseSlug, lessonSlug },
    });

    if (!existing) {
      return {
        score: null,
        totalQuestions: null,
        scorePercentage: null,
        passed: null,
        submittedAt: null,
      };
    }

    return {
      courseSlug: existing.courseSlug,
      lessonSlug: existing.lessonSlug,
      score: existing.score,
      totalQuestions: existing.totalQuestions,
      scorePercentage: existing.scorePercentage,
      passed: existing.passed,
      submittedAt: existing.submittedAt,
    };
  }
}
