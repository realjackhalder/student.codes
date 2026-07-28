import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluateRepositoryAssertions } from './assertions';
import {
  type CourseTranslator,
  getGithubCourse,
  getGithubLessons,
} from './lessons';
import { GitSimulator } from './simulator';

const identitySay = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  strings.reduce(
    (message, part, index) => `${message}${part}${values[index] ?? ''}`,
    '',
  )) as CourseTranslator;

describe('GitHub course lessons', () => {
  it('contains exactly twenty-one unique, ordered lessons', () => {
    const course = getGithubCourse(identitySay);
    const lessons = getGithubLessons(course);

    assert.equal(lessons.length, 21);
    assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 21);
    assert.equal(lessons[0]?.id, 'how-git-thinks');
    assert.equal(lessons[20]?.id, 'promote-between-environments');
  });

  it('attaches thirteen unique state-based exercises to matching lessons', () => {
    const lessons = getGithubLessons(getGithubCourse(identitySay));
    const exercises = lessons.flatMap((lesson) => lesson.exercises);

    assert.equal(exercises.length, 13);
    assert.equal(new Set(exercises.map((exercise) => exercise.id)).size, 13);
    assert.ok(lessons.every((lesson) => lesson.content.length >= 3));
    assert.deepEqual(
      lessons
        .filter((lesson) => lesson.exercises.length > 0)
        .map((lesson) => lesson.id),
      [
        'stage-changes',
        'create-commits',
        'create-branches',
        'switch-branches',
        'understand-remotes',
        'share-branches',
        'submit-code-github',
        'safe-daily-workflow',
        'parallel-branch-history',
        'continue-feature-branch',
        'continue-hotfix-branch',
        'publish-team-branches',
        'promote-between-environments',
      ],
    );
  });

  it('provides a solvable simulator path for every exercise', () => {
    const lessons = getGithubLessons(getGithubCourse(identitySay));
    const exercises = lessons.flatMap((lesson) => lesson.exercises);
    const solutions: Record<string, string[]> = {
      'stage-notes': ['git add notes.md'],
      'commit-notes': ['git commit -m "Complete exercise"'],
      'create-feature-branch': ['git branch feature'],
      'switch-to-feature': ['git switch feature'],
      'pull-latest-main': ['git pull origin main'],
      'publish-feature': ['git push origin feature'],
      'submit-branch-code': [
        'git add src/greeting.ts',
        'git commit -m "Add greeting"',
        'git push -u origin feature/github-submit',
      ],
      'daily-work-branch': [
        'git switch -c daily-work',
        'git push origin daily-work',
      ],
      'inspect-parallel-branches': ['git switch feature/profile'],
      'continue-profile-branch': ['git commit -m "Test profile card"'],
      'continue-login-hotfix': ['git commit -m "Test login timeout"'],
      'publish-parallel-branches': [
        'git push origin feature/profile',
        'git push origin fix/login',
      ],
      'publish-environment-branches': [
        'git branch develop',
        'git branch release/uat',
        'git push origin develop',
        'git push origin release/uat',
      ],
    };

    for (const exercise of exercises) {
      let simulator = new GitSimulator(exercise.initialRepository);
      for (const command of solutions[exercise.id] ?? []) {
        const result = simulator.run(command);
        assert.equal(result.ok, true, `${exercise.id}: ${command}`);
        simulator = new GitSimulator(result.state);
      }

      assert.ok(
        evaluateRepositoryAssertions(
          simulator.state,
          exercise.successAssertions,
        ).every((result) => result.passed),
        `${exercise.id} should be solvable`,
      );
    }
  });
});
