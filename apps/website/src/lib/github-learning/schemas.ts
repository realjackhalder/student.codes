import { z } from 'zod';

const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const gitNameSchema = z.string().trim().min(1).max(120);
const commitIdSchema = z.string().regex(/^[a-f0-9]{7,40}$/);
const filePathSchema = z
  .string()
  .min(1)
  .refine((path) => !path.startsWith('/') && !path.includes('..'), {
    error: 'File paths must be relative and cannot traverse directories.',
  });

export const gitCommitSchema = z.object({
  id: commitIdSchema,
  message: z.string().trim().min(1).max(300),
  parentIds: z.array(commitIdSchema).max(2),
  author: z.object({
    name: z.string().trim().min(1),
    email: z.email(),
  }),
  authoredAt: z.string().datetime(),
  tree: z.record(filePathSchema, z.string()),
});

export const gitBranchSchema = z.object({
  name: gitNameSchema,
  target: commitIdSchema,
});

export const gitRemoteSchema = z.object({
  name: gitNameSchema,
  url: z.url(),
  branches: z.record(gitNameSchema, commitIdSchema),
});

export const gitWorkingFileSchema = z.object({
  path: filePathSchema,
  content: z.string().nullable(),
  status: z.enum(['untracked', 'modified', 'deleted']),
});

export const gitStagedFileSchema = z.object({
  path: filePathSchema,
  content: z.string().nullable(),
});

export const gitHeadSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('branch'), branch: gitNameSchema }),
  z.object({ type: z.literal('detached'), commitId: commitIdSchema }),
]);

export const gitRepositoryStateSchema = z
  .object({
    version: z.literal(1),
    commits: z.record(commitIdSchema, gitCommitSchema),
    branches: z.record(gitNameSchema, gitBranchSchema),
    head: gitHeadSchema,
    workingTree: z.record(filePathSchema, gitWorkingFileSchema),
    stagingArea: z.record(filePathSchema, gitStagedFileSchema),
    remotes: z.record(gitNameSchema, gitRemoteSchema),
    config: z.object({
      userName: z.string().trim().min(1),
      userEmail: z.email(),
      defaultBranch: gitNameSchema,
    }),
  })
  .superRefine((repository, context) => {
    const commitIds = new Set(Object.keys(repository.commits));

    for (const [id, commit] of Object.entries(repository.commits)) {
      if (commit.id !== id)
        context.addIssue({
          code: 'custom',
          path: ['commits', id, 'id'],
          message: 'Commit ID must match its record key.',
        });

      for (const parentId of commit.parentIds)
        if (!commitIds.has(parentId))
          context.addIssue({
            code: 'custom',
            path: ['commits', id, 'parentIds'],
            message: `Unknown parent commit: ${parentId}`,
          });
    }

    for (const [name, branch] of Object.entries(repository.branches)) {
      if (branch.name !== name)
        context.addIssue({
          code: 'custom',
          path: ['branches', name, 'name'],
          message: 'Branch name must match its record key.',
        });
      if (!commitIds.has(branch.target))
        context.addIssue({
          code: 'custom',
          path: ['branches', name, 'target'],
          message: `Unknown branch target: ${branch.target}`,
        });
    }

    if (
      repository.head.type === 'branch' &&
      !(repository.head.branch in repository.branches)
    )
      context.addIssue({
        code: 'custom',
        path: ['head', 'branch'],
        message: `Unknown HEAD branch: ${repository.head.branch}`,
      });

    if (
      repository.head.type === 'detached' &&
      !commitIds.has(repository.head.commitId)
    )
      context.addIssue({
        code: 'custom',
        path: ['head', 'commitId'],
        message: `Unknown detached HEAD commit: ${repository.head.commitId}`,
      });

    for (const [name, remote] of Object.entries(repository.remotes)) {
      if (remote.name !== name)
        context.addIssue({
          code: 'custom',
          path: ['remotes', name, 'name'],
          message: 'Remote name must match its record key.',
        });
      for (const [branch, commitId] of Object.entries(remote.branches))
        if (!commitIds.has(commitId))
          context.addIssue({
            code: 'custom',
            path: ['remotes', name, 'branches', branch],
            message: `Unknown remote branch target: ${commitId}`,
          });
    }
  });

export const repositoryAssertionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('current-branch'),
    branch: gitNameSchema,
  }),
  z.object({
    type: z.literal('branch-exists'),
    branch: gitNameSchema,
    target: commitIdSchema.optional(),
  }),
  z.object({
    type: z.literal('commit-count'),
    count: z.number().int().nonnegative(),
  }),
  z.object({
    type: z.literal('working-tree-clean'),
  }),
  z.object({
    type: z.literal('staging-area-empty'),
  }),
  z.object({
    type: z.literal('remote-branch-exists'),
    remote: gitNameSchema,
    branch: gitNameSchema,
  }),
  z.object({
    type: z.literal('file-status'),
    path: filePathSchema,
    status: z.enum(['untracked', 'modified', 'deleted', 'staged', 'clean']),
  }),
]);

export const courseContentBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    body: z.string().min(1),
  }),
  z.object({
    type: z.literal('command'),
    command: z.string().trim().min(1),
    explanation: z.string().min(1),
  }),
  z.object({
    type: z.literal('callout'),
    tone: z.enum(['information', 'tip', 'warning']),
    body: z.string().min(1),
  }),
]);

export const courseExerciseSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1),
  instructions: z.array(z.string().min(1)).min(1),
  hints: z.array(z.string().min(1)),
  initialRepository: gitRepositoryStateSchema,
  successAssertions: z.array(repositoryAssertionSchema).min(1),
});

export const courseLessonSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1),
  objective: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  content: z.array(courseContentBlockSchema).min(1),
  exercises: z.array(courseExerciseSchema),
});

export const courseModuleSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1),
  description: z.string().min(1),
  lessons: z.array(courseLessonSchema).min(1),
});

export const courseSchema = z.object({
  version: z.literal(1),
  id: idSchema,
  title: z.string().trim().min(1),
  description: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  modules: z.array(courseModuleSchema).min(1),
});

export type GitCommit = z.infer<typeof gitCommitSchema>;
export type GitBranch = z.infer<typeof gitBranchSchema>;
export type GitRemote = z.infer<typeof gitRemoteSchema>;
export type GitWorkingFile = z.infer<typeof gitWorkingFileSchema>;
export type GitStagedFile = z.infer<typeof gitStagedFileSchema>;
export type GitHead = z.infer<typeof gitHeadSchema>;
export type GitRepositoryState = z.infer<typeof gitRepositoryStateSchema>;
export type RepositoryAssertion = z.infer<typeof repositoryAssertionSchema>;
export type CourseContentBlock = z.infer<typeof courseContentBlockSchema>;
export type CourseExercise = z.infer<typeof courseExerciseSchema>;
export type CourseLesson = z.infer<typeof courseLessonSchema>;
export type CourseModule = z.infer<typeof courseModuleSchema>;
export type Course = z.infer<typeof courseSchema>;
