import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { courseGitRepository, initialGitRepository } from './fixtures';
import { GitSimulator } from './simulator';

const run = (simulator: GitSimulator, command: string) => {
  const result = simulator.run(command);
  assert.equal(result.ok, true);
  return result;
};

describe('GitSimulator', () => {
  it('stages and commits a file without mutating the previous state', () => {
    const original = new GitSimulator(initialGitRepository);
    const edited = original.writeFile('notes.md', '# Notes\n');

    assert.equal(original.state.workingTree['notes.md'], undefined);
    assert.equal(edited.state.workingTree['notes.md']?.status, 'untracked');

    const staged = run(edited, 'git add notes.md');
    assert.equal(staged.state.workingTree['notes.md'], undefined);
    assert.equal(staged.state.stagingArea['notes.md']?.content, '# Notes\n');

    const committed = run(
      new GitSimulator(staged.state),
      'git commit -m "Add notes"',
    );
    const branchTarget = committed.state.branches.main?.target;
    assert.ok(branchTarget);
    const commit = committed.state.commits[branchTarget];
    assert.ok(commit);

    assert.equal(commit.message, 'Add notes');
    assert.equal(commit.tree['notes.md'], '# Notes\n');
    assert.deepEqual(commit.parentIds, ['a1b2c3d']);
    assert.deepEqual(committed.state.stagingArea, {});
  });

  it('creates and switches branches while preserving their commit targets', () => {
    const created = run(
      new GitSimulator(initialGitRepository),
      'git switch -c feature',
    );

    assert.deepEqual(created.state.head, {
      type: 'branch',
      branch: 'feature',
    });
    assert.equal(created.state.branches.feature?.target, 'a1b2c3d');

    const edited = new GitSimulator(created.state).writeFile(
      'README.md',
      '# Feature\n',
    );
    const staged = run(edited, 'git add .');
    const committed = run(
      new GitSimulator(staged.state),
      "git commit -m 'Build feature'",
    );

    assert.notEqual(committed.state.branches.feature?.target, 'a1b2c3d');
    assert.equal(committed.state.branches.main?.target, 'a1b2c3d');
  });

  it('updates only the simulated remote when pushing', () => {
    const created = run(
      new GitSimulator(initialGitRepository),
      'git switch -c lesson',
    );
    const pushed = run(
      new GitSimulator(created.state),
      'git push -u origin lesson',
    );

    assert.equal(pushed.state.remotes.origin?.branches.lesson, 'a1b2c3d');
    assert.equal(
      initialGitRepository.remotes.origin?.branches.lesson,
      undefined,
    );
  });

  it('lets students safely repeat common learning commands', () => {
    const created = run(
      new GitSimulator(initialGitRepository),
      'git switch -c lesson',
    );
    const repeatedSwitch = run(
      new GitSimulator(created.state),
      'git switch -c lesson',
    );
    const repeatedBranch = run(
      new GitSimulator(repeatedSwitch.state),
      'git branch lesson',
    );
    const emptyCommit = run(
      new GitSimulator(repeatedBranch.state),
      'git commit -m "Repeat safely"',
    );
    const pushed = run(
      new GitSimulator(emptyCommit.state),
      'git push origin lesson',
    );
    const repeatedPush = run(
      new GitSimulator(pushed.state),
      'git push origin lesson',
    );

    assert.deepEqual(repeatedPush.state, pushed.state);
    assert.match(repeatedPush.output[0] ?? '', /already up to date/);
  });

  it('pulls a newer remote commit into the current local branch', () => {
    const repository = {
      ...courseGitRepository,
      branches: {
        ...courseGitRepository.branches,
        main: { name: 'main', target: 'b2c3d4e' },
      },
    };
    const pulled = run(new GitSimulator(repository), 'git pull origin main');
    const repeated = run(
      new GitSimulator(pulled.state),
      'git pull origin main',
    );

    assert.equal(pulled.state.branches.main?.target, 'c3d4e5f');
    assert.match(repeated.output[0] ?? '', /already up to date/);
  });

  it('returns structured errors without changing state', () => {
    const simulator = new GitSimulator(initialGitRepository);
    const result = simulator.run('git switch missing');

    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, 'branch-not-found');
    assert.deepEqual(result.state, initialGitRepository);
  });

  it('reports repository status and commit history', () => {
    const simulator = new GitSimulator(initialGitRepository);
    const status = run(simulator, 'git status');
    const log = run(simulator, 'git log');

    assert.deepEqual(status.output, [
      'On branch main',
      'nothing to commit, working tree clean',
    ]);
    assert.deepEqual(log.output, ['a1b2c3d Initial commit']);
  });
});
