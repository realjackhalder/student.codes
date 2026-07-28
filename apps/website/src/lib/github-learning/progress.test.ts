import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GITHUB_LESSON_IDS } from './curriculum';
import {
  completeGithubExercise,
  completeGithubLesson,
  emptyGithubCourseProgress,
  getGithubCourseCompletion,
  parseGithubCourseProgress,
} from './progress';

const completedAt = '2026-01-02T03:04:05.000Z';

describe('GitHub course progress', () => {
  it('rejects invalid persisted progress', () => {
    assert.deepEqual(
      parseGithubCourseProgress({ version: 2, completedLessons: {} }),
      emptyGithubCourseProgress,
    );
  });

  it('records lesson completion idempotently and unlocks a first lesson', () => {
    const progress = completeGithubLesson(
      emptyGithubCourseProgress,
      'how-git-thinks',
      completedAt,
    );
    const repeated = completeGithubLesson(
      progress,
      'how-git-thinks',
      '2027-01-01T00:00:00.000Z',
    );

    assert.equal(progress.completedLessons['how-git-thinks'], completedAt);
    assert.equal(progress.achievements['first-lesson'], completedAt);
    assert.equal(repeated, progress);
  });

  it('completes an exercise and its owning lesson together', () => {
    const progress = completeGithubExercise(
      emptyGithubCourseProgress,
      'stage-notes',
      completedAt,
    );

    assert.equal(progress.completedExercises['stage-notes'], completedAt);
    assert.equal(progress.completedLessons['stage-changes'], completedAt);
    assert.equal(progress.achievements['first-exercise'], completedAt);
  });

  it('unlocks branch builder and course completion achievements', () => {
    let progress = completeGithubExercise(
      emptyGithubCourseProgress,
      'create-feature-branch',
      completedAt,
    );
    progress = completeGithubExercise(
      progress,
      'switch-to-feature',
      completedAt,
    );
    assert.equal(progress.achievements['branch-builder'], completedAt);

    for (const lessonId of GITHUB_LESSON_IDS)
      progress = completeGithubLesson(progress, lessonId, completedAt);

    assert.equal(progress.achievements['course-complete'], completedAt);
    assert.deepEqual(getGithubCourseCompletion(progress), {
      completed: 21,
      total: 21,
      percentage: 100,
    });
  });
});
