import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpStatus,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { QuizScoresService } from './quiz-scores.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmitQuizScoreDto } from './dto/submit-quiz-score.dto';
import { QuizScoreResponseDto, QuizScoreNotFoundResponseDto } from './dto/quiz-score-response.dto';

@ApiTags('Quiz Scores')
@ApiBearerAuth('keycloak')
@Controller('courses/:courseSlug/lessons/:lessonSlug/quiz')
export class QuizScoresController {
  constructor(private readonly quizScoresService: QuizScoresService) {}

  @Post('score')
  @ApiOperation({ summary: 'Submit quiz score' })
  @ApiParam({ name: 'courseSlug', description: 'URL slug of the course' })
  @ApiParam({ name: 'lessonSlug', description: 'URL slug of the lesson' })
  @ApiResponse({ status: 201, description: 'Score submitted for the first time', type: QuizScoreResponseDto })
  @ApiResponse({ status: 200, description: 'Score updated (re-submission)', type: QuizScoreResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitScore(
    @CurrentUser('id') userId: string,
    @Param('courseSlug') courseSlug: string,
    @Param('lessonSlug') lessonSlug: string,
    @Body() dto: SubmitQuizScoreDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<QuizScoreResponseDto> {
    const { data, alreadyExisted } = await this.quizScoresService.submitScore(
      userId,
      courseSlug,
      lessonSlug,
      dto,
    );

    if (alreadyExisted) {
      res.status(HttpStatus.OK);
    }

    return data;
  }

  @Get('score')
  @ApiOperation({ summary: 'Get quiz score' })
  @ApiParam({ name: 'courseSlug', description: 'URL slug of the course' })
  @ApiParam({ name: 'lessonSlug', description: 'URL slug of the lesson' })
  @ApiResponse({ status: 200, description: 'Quiz score retrieved', type: QuizScoreResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getScore(
    @CurrentUser('id') userId: string,
    @Param('courseSlug') courseSlug: string,
    @Param('lessonSlug') lessonSlug: string,
  ): Promise<QuizScoreResponseDto | QuizScoreNotFoundResponseDto> {
    return this.quizScoresService.getScore(userId, courseSlug, lessonSlug);
  }
}
