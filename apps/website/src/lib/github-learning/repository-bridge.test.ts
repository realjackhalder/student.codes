import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  adaptGithubSnapshotToRepository,
  parseGithubRepositoryReference,
} from './repository-bridge';

const snapshot = {
  repository: {
    name: 'project',
    full_name: 'student/project',
    html_url: 'https://github.com/student/project',
    default_branch: 'main',
    description: 'A public project',
    stargazers_count: 12,
    forks_count: 3,
    open_issues_count: 2,
  },
  branches: [
    {
      name: 'main',
      commit: { sha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
    },
    {
      name: 'old',
      commit: { sha: 'cccccccccccccccccccccccccccccccccccccccc' },
    },
  ],
  commits: [
    {
      sha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      html_url:
        'https://github.com/student/project/commit/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      commit: {
        message: 'Add course\n\nMore detail',
        author: {
          name: 'Student',
          email: 'student@example.com',
          date: '2026-01-02T00:00:00.000Z',
        },
      },
      parents: [{ sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }],
    },
    {
      sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      html_url:
        'https://github.com/student/project/commit/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      commit: {
        message: 'Initial commit',
        author: {
          name: 'Student',
          email: 'student@example.com',
          date: '2026-01-01T00:00:00.000Z',
        },
      },
      parents: [],
    },
  ],
};

describe('GitHub repository bridge', () => {
  it('parses shorthand, HTTPS, and clone-style public repository references', () => {
    assert.deepEqual(parseGithubRepositoryReference('student/project'), {
      owner: 'student',
      repository: 'project',
    });
    assert.deepEqual(
      parseGithubRepositoryReference('https://github.com/student/project.git'),
      { owner: 'student', repository: 'project' },
    );
    assert.equal(
      parseGithubRepositoryReference('https://example.com/a/b'),
      undefined,
    );
  });

  it('adapts a validated snapshot without inventing unavailable history', () => {
    const repository = adaptGithubSnapshotToRepository(snapshot);

    assert.equal(repository.head.type, 'branch');
    assert.equal(repository.branches.main?.target, snapshot.commits[0]?.sha);
    assert.equal(repository.branches.old, undefined);
    assert.equal(
      repository.commits[snapshot.commits[0]!.sha]?.message,
      'Add course',
    );
    assert.deepEqual(repository.commits[snapshot.commits[0]!.sha]?.parentIds, [
      snapshot.commits[1]?.sha,
    ]);
    assert.deepEqual(repository.workingTree, {});
    assert.deepEqual(repository.stagingArea, {});
  });
});
