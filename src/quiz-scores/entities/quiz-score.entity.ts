import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('quiz_scores')
@Unique(['userId', 'courseSlug', 'lessonSlug'])
export class QuizScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'course_slug' })
  courseSlug: string;

  @Column({ name: 'lesson_slug' })
  lessonSlug: string;

  @Column()
  score: number;

  @Column({ name: 'total_questions' })
  totalQuestions: number;

  @Column({ name: 'score_percentage' })
  scorePercentage: number;

  @Column()
  passed: boolean;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
