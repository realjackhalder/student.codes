import { z } from 'zod';
import { type GitRepositoryState, gitRepositoryStateSchema } from './schemas';

const githubNameSchema = z.string().regex(/^[A-Za-z0-9_.-]{1,100}$/);
const githubCommitIdSchema = z.string().regex(/^[a-f0-9]{40}$/);

export const githubRepositoryReferenceSchema = z.object({
  owner: githubNameSchema,
  repository: githubNameSchema,
});

export const githubRepositorySchema = z.object({
  name: z.string(),
  full_name: z.string(),
  html_url: z.url(),
  default_branch: z.string().min(1),
  description: z.string().nullable(),
  stargazers_count: z.number().int().nonnegative(),
  forks_count: z.number().int().nonnegative(),
  open_issues_count: z.number().int().nonnegative(),
});

export const githubBranchSchema = z.object({
  name: z.string().min(1),
  commit: z.object({ sha: githubCommitIdSchema }),
});

export const githubCommitSchema = z.object({
  sha: githubCommitIdSchema,
  html_url: z.url(),
  commit: z.object({
    message: z.string().min(1),
    author: z.object({
      name: z.string().min(1),
      email: z.email(),
      date: z.string().datetime(),
    }),
  }),
  parents: z.array(z.object({ sha: githubCommitIdSchema })),
});

export const githubRepositorySnapshotSchema = z.object({
  repository: githubRepositorySchema,
  branches: z.array(githubBranchSchema),
  commits: z.array(githubCommitSchema).min(1),
});

export type GithubRepositoryReference = z.infer<
  typeof githubRepositoryReferenceSchema
>;
export type GithubRepositorySnapshot = z.infer<
  typeof githubRepositorySnapshotSchema
>;

export const parseGithubRepositoryReference = (
  value: string,
): GithubRepositoryReference | undefined => {
  const trimmed = value
    .trim()
    .replace(/\/+$/, '')
    .replace(/\.git$/, '');
  const match = trimmed.match(
    /^(?:https?:\/\/github\.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/,
  );
  if (!match) return;

  const parsed = githubRepositoryReferenceSchema.safeParse({
    owner: match[1],
    repository: match[2],
  });
  return parsed.success ? parsed.data : undefined;
};

export const adaptGithubSnapshotToRepository = (
  snapshot: GithubRepositorySnapshot,
): GitRepositoryState => {
  const parsed = githubRepositorySnapshotSchema.parse(snapshot);
  const commitIds = new Set(parsed.commits.map((commit) => commit.sha));
  const commits = Object.fromEntries(
    parsed.commits.map((commit) => [
      commit.sha,
      {
        id: commit.sha,
        message: commit.commit.message.split('\n')[0] || commit.commit.message,
        parentIds: commit.parents
          .map((parent) => parent.sha)
          .filter((parentId) => commitIds.has(parentId))
          .slice(0, 2),
        author: commit.commit.author,
        authoredAt: commit.commit.author.date,
        tree: {},
      },
    ]),
  );
  const defaultCommit =
    parsed.branches.find(
      (branch) =>
        branch.name === parsed.repository.default_branch &&
        commitIds.has(branch.commit.sha),
    )?.commit.sha ?? parsed.commits[0]!.sha;
  const branches = Object.fromEntries(
    parsed.branches
      .filter((branch) => commitIds.has(branch.commit.sha))
      .map((branch) => [
        branch.name,
        { name: branch.name, target: branch.commit.sha },
      ]),
  );
  branches[parsed.repository.default_branch] ??= {
    name: parsed.repository.default_branch,
    target: defaultCommit,
  };

  return gitRepositoryStateSchema.parse({
    version: 1,
    commits,
    branches,
    head: { type: 'branch', branch: parsed.repository.default_branch },
    workingTree: {},
    stagingArea: {},
    remotes: {
      origin: {
        name: 'origin',
        url: `${parsed.repository.html_url}.git`,
        branches: Object.fromEntries(
          Object.entries(branches).map(([name, branch]) => [
            name,
            branch.target,
          ]),
        ),
      },
    },
    config: {
      userName: 'GitHub',
      userEmail: 'noreply@github.com',
      defaultBranch: parsed.repository.default_branch,
    },
  });
};
