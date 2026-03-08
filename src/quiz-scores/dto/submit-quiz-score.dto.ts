import { IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitQuizScoreDto {
  @ApiProperty({ example: 4, description: 'Number of correct answers' })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  score: number;

  @ApiProperty({ example: 5, description: 'Total number of questions in the quiz' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  totalQuestions: number;

  @ApiProperty({ example: 80, description: 'Calculated percentage (0–100), rounded to nearest' })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  scorePercentage: number;
}
