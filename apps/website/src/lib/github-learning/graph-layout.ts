import type { GitRepositoryState } from './schemas';

export type GitGraphNode = {
  commitId: string;
  column: number;
  row: number;
  branchNames: string[];
  remoteNames: string[];
  isHead: boolean;
};

export type GitGraphEdge = {
  from: string;
  to: string;
};

export type GitGraphLayout = {
  nodes: GitGraphNode[];
  edges: GitGraphEdge[];
  columns: number;
};

const visitHistory = (
  repository: GitRepositoryState,
  commitId: string,
  visited: Set<string>,
  ordered: string[],
) => {
  if (visited.has(commitId)) return;
  const commit = repository.commits[commitId];
  if (!commit) return;

  visited.add(commitId);
  ordered.push(commitId);
  for (const parentId of commit.parentIds)
    visitHistory(repository, parentId, visited, ordered);
};

export function buildGitGraphLayout(
  repository: GitRepositoryState,
): GitGraphLayout {
  const branchNames = Object.keys(repository.branches).sort((left, right) => {
    if (left === repository.config.defaultBranch) return -1;
    if (right === repository.config.defaultBranch) return 1;
    return left.localeCompare(right);
  });
  const laneByCommit = new Map<string, number>();

  for (const [lane, branchName] of branchNames.entries()) {
    let commitId: string | undefined = repository.branches[branchName]?.target;
    while (commitId) {
      if (!laneByCommit.has(commitId)) laneByCommit.set(commitId, lane);
      commitId = repository.commits[commitId]?.parentIds[0];
    }
  }

  const headCommitId =
    repository.head.type === 'branch'
      ? repository.branches[repository.head.branch]?.target
      : repository.head.commitId;
  const ordered: string[] = [];
  const visited = new Set<string>();

  if (headCommitId) visitHistory(repository, headCommitId, visited, ordered);
  for (const branchName of branchNames) {
    const target = repository.branches[branchName]?.target;
    if (target) visitHistory(repository, target, visited, ordered);
  }
  for (const commitId of Object.keys(repository.commits).sort())
    visitHistory(repository, commitId, visited, ordered);

  const localBranchesByCommit = new Map<string, string[]>();
  for (const branch of Object.values(repository.branches)) {
    const names = localBranchesByCommit.get(branch.target) ?? [];
    names.push(branch.name);
    localBranchesByCommit.set(branch.target, names);
  }

  const remoteBranchesByCommit = new Map<string, string[]>();
  for (const remote of Object.values(repository.remotes))
    for (const [branchName, commitId] of Object.entries(remote.branches)) {
      const names = remoteBranchesByCommit.get(commitId) ?? [];
      names.push(`${remote.name}/${branchName}`);
      remoteBranchesByCommit.set(commitId, names);
    }

  return {
    nodes: ordered.map((commitId, row) => ({
      commitId,
      column: laneByCommit.get(commitId) ?? branchNames.length,
      row,
      branchNames: (localBranchesByCommit.get(commitId) ?? []).sort(),
      remoteNames: (remoteBranchesByCommit.get(commitId) ?? []).sort(),
      isHead: commitId === headCommitId,
    })),
    edges: ordered.flatMap((commitId) =>
      (repository.commits[commitId]?.parentIds ?? []).map((parentId) => ({
        from: commitId,
        to: parentId,
      })),
    ),
    columns: Math.max(branchNames.length, 1),
  };
}
