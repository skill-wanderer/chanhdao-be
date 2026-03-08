import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizScoresController } from './quiz-scores.controller';
import { QuizScoresService } from './quiz-scores.service';
import { QuizScore } from './entities/quiz-score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuizScore])],
  controllers: [QuizScoresController],
  providers: [QuizScoresService],
  exports: [QuizScoresService],
})
export class QuizScoresModule {}
