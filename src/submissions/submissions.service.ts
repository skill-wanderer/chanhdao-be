import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubmissionDto, SubmissionResponseDto } from './dto/submission.dto';
import { Submission, SubmissionType } from './entities/submission.entity';

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

    return this.toResponseDto(saved);
  }

  async getSubmissionsByType(
    type: SubmissionType,
  ): Promise<SubmissionResponseDto[]> {
    const submissions = await this.submissionsRepo.find({
      where: { type },
      order: { createdAt: 'DESC' },
    });

    return submissions.map((submission) => this.toResponseDto(submission));
  }

  private toResponseDto(submission: Submission): SubmissionResponseDto {
    return {
      id: submission.id,
      type: submission.type,
      content: submission.content,
      createdAt: submission.createdAt,
    };
  }
}
