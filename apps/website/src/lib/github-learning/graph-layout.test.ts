import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { initialGitRepository } from './fixtures';
import { buildGitGraphLayout } from './graph-layout';
import { GitSimulator } from './simulator';

const run = (simulator: GitSimulator, command: string) => {
  const result = simulator.run(command);
  assert.equal(result.ok, true);
  return new GitSimulator(result.state);
};

describe('buildGitGraphLayout', () => {
  it('marks the current commit and its local and remote references', () => {
    const layout = buildGitGraphLayout(initialGitRepository);

    assert.equal(layout.nodes.length, 1);
    assert.deepEqual(layout.nodes[0], {
      commitId: 'a1b2c3d',
      column: 0,
      row: 0,
      branchNames: ['main'],
      remoteNames: ['origin/main'],
      isHead: true,
    });
  });

  it('places branch history in stable lanes and connects commit parents', () => {
    let simulator = run(
      new GitSimulator(initialGitRepository),
      'git switch -c feature',
    );
    simulator = simulator.writeFile('feature.md', 'Feature\n');
    simulator = run(simulator, 'git add .');
    simulator = run(simulator, 'git commit -m "Feature commit"');

    const layout = buildGitGraphLayout(simulator.state);
    const featureTip = simulator.state.branches.feature?.target;
    assert.ok(featureTip);

    assert.equal(
      layout.nodes.find((node) => node.commitId === featureTip)?.column,
      1,
    );
    assert.ok(
      layout.edges.some(
        (edge) => edge.from === featureTip && edge.to === 'a1b2c3d',
      ),
    );
    assert.equal(
      layout.nodes.find((node) => node.commitId === featureTip)?.isHead,
      true,
    );
  });
});
