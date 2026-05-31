import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/decorators';
import { CreateSubmissionDto, SubmissionResponseDto } from './dto/submission.dto';
import { SubmissionType } from './entities/submission.entity';
import { SubmissionsService } from './submissions.service';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a public form payload (contact for now)' })
  @ApiResponse({
    status: 201,
    description: 'Submission accepted and stored in PostgreSQL jsonb',
    type: SubmissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async createSubmission(
    @Body() dto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionsService.createSubmission(dto);
  }

  @Get('type/:type')
  @ApiBearerAuth('keycloak')
  @ApiOperation({ summary: 'Get all form submissions by type' })
  @ApiParam({
    name: 'type',
    enum: SubmissionType,
    example: SubmissionType.CONTACT,
    description: 'Submission category to filter by',
  })
  @ApiResponse({
    status: 200,
    description: 'Matching submissions ordered newest first',
    type: SubmissionResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Invalid submission type' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSubmissionsByType(
    @Param('type', new ParseEnumPipe(SubmissionType)) type: SubmissionType,
  ): Promise<SubmissionResponseDto[]> {
    return this.submissionsService.getSubmissionsByType(type);
  }
}
