import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  HttpCode,
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
import { ProgressService } from './progress.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  MarkLessonCompleteResponseDto,
  LessonCompletionStatusDto,
  CourseCompletionsResponseDto,
} from './dto/progress-response.dto';

@ApiTags('Progress')
@ApiBearerAuth('keycloak')
@Controller('courses/:courseSlug')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('lessons/:lessonSlug/complete')
  @ApiOperation({ summary: 'Mark a lesson as complete' })
  @ApiParam({ name: 'courseSlug', description: 'URL slug of the course' })
  @ApiParam({ name: 'lessonSlug', description: 'URL slug of the lesson' })
  @ApiResponse({ status: 201, description: 'Lesson marked as complete', type: MarkLessonCompleteResponseDto })
  @ApiResponse({ status: 200, description: 'Lesson was already complete', type: MarkLessonCompleteResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markComplete(
    @CurrentUser('id') userId: string,
    @Param('courseSlug') courseSlug: string,
    @Param('lessonSlug') lessonSlug: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MarkLessonCompleteResponseDto> {
    const { data, alreadyExisted } = await this.progressService.markComplete(
      userId,
      courseSlug,
      lessonSlug,
    );

    if (alreadyExisted) {
      res.status(HttpStatus.OK);
    }

    return data;
  }

  @Delete('lessons/:lessonSlug/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unmark lesson completion' })
  @ApiParam({ name: 'courseSlug', description: 'URL slug of the course' })
  @ApiParam({ name: 'lessonSlug', description: 'URL slug of the lesson' })
  @ApiResponse({ status: 204, description: 'Completion removed (or was not present)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async unmarkComplete(
    @CurrentUser('id') userId: string,
    @Param('courseSlug') courseSlug: string,
    @Param('lessonSlug') lessonSlug: string,
  ): Promise<void> {
    await this.progressService.unmarkComplete(userId, courseSlug, lessonSlug);
  }

  @Get('lessons/:lessonSlug/complete')
  @ApiOperation({ summary: 'Get lesson completion status' })
  @ApiParam({ name: 'courseSlug', description: 'URL slug of the course' })
  @ApiParam({ name: 'lessonSlug', description: 'URL slug of the lesson' })
  @ApiResponse({ status: 200, description: 'Completion status', type: LessonCompletionStatusDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCompletionStatus(
    @CurrentUser('id') userId: string,
    @Param('courseSlug') courseSlug: string,
    @Param('lessonSlug') lessonSlug: string,
  ): Promise<LessonCompletionStatusDto> {
    return this.progressService.getCompletionStatus(
      userId,
      courseSlug,
      lessonSlug,
    );
  }

  @Get('completions')
  @ApiOperation({ summary: 'Get all completed lessons for a course' })
  @ApiParam({ name: 'courseSlug', description: 'URL slug of the course' })
  @ApiResponse({ status: 200, description: 'List of completed lessons', type: CourseCompletionsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCourseCompletions(
    @CurrentUser('id') userId: string,
    @Param('courseSlug') courseSlug: string,
  ): Promise<CourseCompletionsResponseDto> {
    return this.progressService.getCourseCompletions(userId, courseSlug);
  }
}
