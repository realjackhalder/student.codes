'use client';

import { useCallback } from 'react';
import type {
  GithubExerciseId,
  GithubLessonId,
} from '~/lib/github-learning/curriculum';
import {
  completeGithubExercise,
  completeGithubLesson,
  emptyGithubCourseProgress,
  GITHUB_PROGRESS_STORAGE_KEY,
  parseGithubCourseProgress,
} from '~/lib/github-learning/progress';
import { useLocalStorage } from './local-storage';

export function useGithubCourseProgress() {
  const [progress, setProgress] = useLocalStorage(
    GITHUB_PROGRESS_STORAGE_KEY,
    emptyGithubCourseProgress,
    {
      deserializer: (value) => parseGithubCourseProgress(JSON.parse(value)),
      initializeWithValue: false,
    },
  );

  const completeLesson = useCallback(
    (lessonId: GithubLessonId) =>
      setProgress((current) => completeGithubLesson(current, lessonId)),
    [setProgress],
  );
  const completeExercise = useCallback(
    (exerciseId: GithubExerciseId) =>
      setProgress((current) => completeGithubExercise(current, exerciseId)),
    [setProgress],
  );

  return { progress, completeLesson, completeExercise };
}
