import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators';
import { CreateSubmissionDto, SubmissionResponseDto } from './dto/submission.dto';
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
}
