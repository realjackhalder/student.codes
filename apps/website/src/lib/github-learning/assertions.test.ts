import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  evaluateRepositoryAssertion,
  evaluateRepositoryAssertions,
} from './assertions';
import { initialGitRepository } from './fixtures';
import { GitSimulator } from './simulator';

const run = (simulator: GitSimulator, command: string) => {
  const result = simulator.run(command);
  assert.equal(result.ok, true);
  return new GitSimulator(result.state);
};

describe('repository assertions', () => {
  it('evaluates branch and cleanliness assertions', () => {
    assert.equal(
      evaluateRepositoryAssertion(initialGitRepository, {
        type: 'current-branch',
        branch: 'main',
      }),
      true,
    );
    assert.equal(
      evaluateRepositoryAssertion(initialGitRepository, {
        type: 'branch-exists',
        branch: 'feature',
      }),
      false,
    );
    assert.equal(
      evaluateRepositoryAssertion(initialGitRepository, {
        type: 'working-tree-clean',
      }),
      true,
    );
    assert.equal(
      evaluateRepositoryAssertion(initialGitRepository, {
        type: 'staging-area-empty',
      }),
      true,
    );
  });

  it('detects staged files and new commits', () => {
    let simulator = new GitSimulator(initialGitRepository).writeFile(
      'notes.md',
      'Notes\n',
    );
    simulator = run(simulator, 'git add notes.md');

    assert.equal(
      evaluateRepositoryAssertion(simulator.state, {
        type: 'file-status',
        path: 'notes.md',
        status: 'staged',
      }),
      true,
    );

    simulator = run(simulator, 'git commit -m "Add notes"');
    assert.equal(
      evaluateRepositoryAssertion(simulator.state, {
        type: 'commit-count',
        count: 2,
      }),
      true,
    );
  });

  it('evaluates local and remote branch state together', () => {
    let simulator = run(
      new GitSimulator(initialGitRepository),
      'git switch -c feature',
    );
    simulator = run(simulator, 'git push origin feature');

    const results = evaluateRepositoryAssertions(simulator.state, [
      { type: 'branch-exists', branch: 'feature' },
      { type: 'current-branch', branch: 'feature' },
      {
        type: 'remote-branch-exists',
        remote: 'origin',
        branch: 'feature',
      },
    ]);
    assert.ok(results.every((result) => result.passed));
  });
});
