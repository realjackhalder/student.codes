import { z } from 'zod';
import {
  GITHUB_EXERCISE_LESSONS,
  GITHUB_LESSON_IDS,
  type GithubExerciseId,
  type GithubLessonId,
} from './curriculum';

export const GITHUB_PROGRESS_STORAGE_KEY =
  'student.codes.github-course-progress.v1';

export const githubAchievementIdSchema = z.enum([
  'first-lesson',
  'first-exercise',
  'branch-builder',
  'course-complete',
]);

export type GithubAchievementId = z.infer<typeof githubAchievementIdSchema>;

export const githubCourseProgressSchema = z.object({
  version: z.literal(1),
  completedLessons: z.record(z.string(), z.string().datetime()),
  completedExercises: z.record(z.string(), z.string().datetime()),
  achievements: z.partialRecord(
    githubAchievementIdSchema,
    z.string().datetime(),
  ),
});

export type GithubCourseProgress = z.infer<typeof githubCourseProgressSchema>;

export const emptyGithubCourseProgress: GithubCourseProgress = {
  version: 1,
  completedLessons: {},
  completedExercises: {},
  achievements: {},
};

export function parseGithubCourseProgress(
  value: unknown,
): GithubCourseProgress {
  const result = githubCourseProgressSchema.safeParse(value);
  return result.success ? result.data : emptyGithubCourseProgress;
}

const unlockAchievements = (
  progress: GithubCourseProgress,
  completedAt: string,
) => {
  const achievements = { ...progress.achievements };
  const unlock = (id: GithubAchievementId, condition: boolean) => {
    if (condition && !achievements[id]) achievements[id] = completedAt;
  };

  unlock('first-lesson', Object.keys(progress.completedLessons).length >= 1);
  unlock(
    'first-exercise',
    Object.keys(progress.completedExercises).length >= 1,
  );
  unlock(
    'branch-builder',
    Boolean(
      progress.completedExercises['create-feature-branch'] &&
        progress.completedExercises['switch-to-feature'],
    ),
  );
  unlock(
    'course-complete',
    GITHUB_LESSON_IDS.every((id) => progress.completedLessons[id]),
  );

  return { ...progress, achievements };
};

export function completeGithubLesson(
  progress: GithubCourseProgress,
  lessonId: GithubLessonId,
  completedAt = new Date().toISOString(),
): GithubCourseProgress {
  if (progress.completedLessons[lessonId]) return progress;
  return unlockAchievements(
    {
      ...progress,
      completedLessons: {
        ...progress.completedLessons,
        [lessonId]: completedAt,
      },
    },
    completedAt,
  );
}

export function completeGithubExercise(
  progress: GithubCourseProgress,
  exerciseId: GithubExerciseId,
  completedAt = new Date().toISOString(),
): GithubCourseProgress {
  if (progress.completedExercises[exerciseId]) return progress;
  const lessonId = GITHUB_EXERCISE_LESSONS[exerciseId];
  return unlockAchievements(
    {
      ...progress,
      completedLessons: {
        ...progress.completedLessons,
        [lessonId]: progress.completedLessons[lessonId] ?? completedAt,
      },
      completedExercises: {
        ...progress.completedExercises,
        [exerciseId]: completedAt,
      },
    },
    completedAt,
  );
}

export function getGithubCourseCompletion(progress: GithubCourseProgress) {
  const completed = GITHUB_LESSON_IDS.filter(
    (id) => progress.completedLessons[id],
  ).length;
  return {
    completed,
    total: GITHUB_LESSON_IDS.length,
    percentage: Math.round((completed / GITHUB_LESSON_IDS.length) * 100),
  };
}
