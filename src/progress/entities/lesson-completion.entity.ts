import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('lesson_completions')
@Unique(['userId', 'courseSlug', 'lessonSlug'])
export class LessonCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'course_slug' })
  courseSlug: string;

  @Column({ name: 'lesson_slug' })
  lessonSlug: string;

  @CreateDateColumn({ name: 'completed_at' })
  completedAt: Date;
}
