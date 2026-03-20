import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubmissionDto, SubmissionResponseDto } from './dto/submission.dto';
import { Submission } from './entities/submission.entity';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    @InjectRepository(Submission)
    private readonly submissionsRepo: Repository<Submission>,
  ) {}

  async createSubmission(
    dto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    const submission = this.submissionsRepo.create({
      type: dto.type,
      content: dto.content,
    });

    const saved = await this.submissionsRepo.save(submission);
    this.logger.log(`Created ${saved.type} submission: ${saved.id}`);

    return {
      id: saved.id,
      type: saved.type,
      content: saved.content,
      createdAt: saved.createdAt,
    };
  }
}
