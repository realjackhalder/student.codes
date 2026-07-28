import type { GitRepositoryState, RepositoryAssertion } from './schemas';

export type RepositoryAssertionResult = {
  assertion: RepositoryAssertion;
  passed: boolean;
};

const getFileStatus = (repository: GitRepositoryState, path: string) => {
  if (repository.stagingArea[path]) return 'staged';
  return repository.workingTree[path]?.status ?? 'clean';
};

export function evaluateRepositoryAssertion(
  repository: GitRepositoryState,
  assertion: RepositoryAssertion,
): boolean {
  switch (assertion.type) {
    case 'current-branch':
      return (
        repository.head.type === 'branch' &&
        repository.head.branch === assertion.branch
      );
    case 'branch-exists': {
      const branch = repository.branches[assertion.branch];
      return (
        branch !== undefined &&
        (assertion.target === undefined || branch.target === assertion.target)
      );
    }
    case 'commit-count':
      return Object.keys(repository.commits).length === assertion.count;
    case 'working-tree-clean':
      return Object.keys(repository.workingTree).length === 0;
    case 'staging-area-empty':
      return Object.keys(repository.stagingArea).length === 0;
    case 'remote-branch-exists':
      return (
        repository.remotes[assertion.remote]?.branches[assertion.branch] !==
        undefined
      );
    case 'file-status':
      return getFileStatus(repository, assertion.path) === assertion.status;
  }
}

export function evaluateRepositoryAssertions(
  repository: GitRepositoryState,
  assertions: RepositoryAssertion[],
): RepositoryAssertionResult[] {
  return assertions.map((assertion) => ({
    assertion,
    passed: evaluateRepositoryAssertion(repository, assertion),
  }));
}
