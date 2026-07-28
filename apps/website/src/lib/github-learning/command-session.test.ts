import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createGitCommandSession,
  moveGitCommandSession,
  resetGitCommandSession,
  runGitCommand,
} from './command-session';
import { initialGitRepository } from './fixtures';

describe('Git command session', () => {
  it('runs sequential commands against the latest simulated state', () => {
    let session = createGitCommandSession(initialGitRepository);
    session = runGitCommand(session, 'git switch -c feature');
    session = runGitCommand(session, 'git branch');

    assert.deepEqual(session.repository.head, {
      type: 'branch',
      branch: 'feature',
    });
    assert.equal(session.history.length, 2);
    assert.equal(session.snapshots.length, 3);
    assert.equal(session.cursor, 2);
    assert.deepEqual(session.history[1], {
      id: 2,
      command: 'git branch',
      ok: true,
      output: ['* feature', '  main'],
    });
  });

  it('moves backward and forward through repository snapshots', () => {
    let session = createGitCommandSession(initialGitRepository);
    session = runGitCommand(session, 'git switch -c feature');
    session = runGitCommand(session, 'git branch topic');

    const previous = moveGitCommandSession(session, 1);
    assert.equal(previous.repository.branches.topic, undefined);
    assert.equal(previous.repository.head.type, 'branch');
    if (previous.repository.head.type === 'branch')
      assert.equal(previous.repository.head.branch, 'feature');

    const next = moveGitCommandSession(previous, 2);
    assert.ok(next.repository.branches.topic);
  });

  it('discards future steps when a new command runs after moving back', () => {
    let session = createGitCommandSession(initialGitRepository);
    session = runGitCommand(session, 'git switch -c feature');
    session = runGitCommand(session, 'git branch old-topic');
    session = moveGitCommandSession(session, 1);
    session = runGitCommand(session, 'git branch new-topic');

    assert.equal(session.history.length, 2);
    assert.equal(session.repository.branches['old-topic'], undefined);
    assert.ok(session.repository.branches['new-topic']);
  });

  it('keeps structured command errors in history without changing state', () => {
    const initial = createGitCommandSession(initialGitRepository);
    const session = runGitCommand(initial, 'git switch missing');

    assert.deepEqual(session.repository, initial.repository);
    assert.equal(session.history[0]?.ok, false);
    if (session.history[0]?.ok === false)
      assert.equal(session.history[0].error.code, 'branch-not-found');
  });

  it('ignores empty commands and resets repository and history', () => {
    const initial = createGitCommandSession(initialGitRepository);
    assert.equal(runGitCommand(initial, '   '), initial);

    const changed = runGitCommand(initial, 'git switch -c feature');
    const reset = resetGitCommandSession(changed);

    assert.deepEqual(reset.repository, initialGitRepository);
    assert.deepEqual(reset.history, []);
    assert.equal(reset.snapshots.length, 1);
    assert.equal(reset.cursor, 0);
    assert.equal(reset.nextEntryId, 1);
  });
});
