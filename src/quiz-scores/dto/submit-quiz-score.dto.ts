import { IsInt, Min, Max, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({ example: 50, description: 'Threshold for passing (0–100)' })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  passPercentage: number;

  @ApiPropertyOptional({
    example: { '0': 'A', '1': 'B', '2': 'C', '3': 'A', '4': 'D' },
    description: 'Map of question index (string) to selected option key (string)',
  })
  @IsOptional()
  @IsObject()
  answers?: Record<string, string>;
}
