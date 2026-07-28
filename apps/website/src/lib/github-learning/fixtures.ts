import { type GitRepositoryState, gitRepositoryStateSchema } from './schemas';

const initialCommitId = 'a1b2c3d';

export const initialGitRepository = gitRepositoryStateSchema.parse({
  version: 1,
  commits: {
    [initialCommitId]: {
      id: initialCommitId,
      message: 'Initial commit',
      parentIds: [],
      author: {
        name: 'Student',
        email: 'student@example.com',
      },
      authoredAt: '2026-01-01T00:00:00.000Z',
      tree: {
        'README.md': '# Learning Git\n',
      },
    },
  },
  branches: {
    main: {
      name: 'main',
      target: initialCommitId,
    },
  },
  head: {
    type: 'branch',
    branch: 'main',
  },
  workingTree: {},
  stagingArea: {},
  remotes: {
    origin: {
      name: 'origin',
      url: 'https://github.com/student/learning-git.git',
      branches: {
        main: initialCommitId,
      },
    },
  },
  config: {
    userName: 'Student',
    userEmail: 'student@example.com',
    defaultBranch: 'main',
  },
}) satisfies GitRepositoryState;

export const courseGitRepository = gitRepositoryStateSchema.parse({
  version: 1,
  commits: {
    a1b2c3d: {
      id: 'a1b2c3d',
      message: 'Initial commit',
      parentIds: [],
      author: {
        name: 'Mia',
        email: 'mia@example.com',
      },
      authoredAt: '2026-01-01T08:00:00.000Z',
      tree: {
        'README.md': '# Team project\n',
      },
    },
    b2c3d4e: {
      id: 'b2c3d4e',
      message: 'Set up project structure',
      parentIds: ['a1b2c3d'],
      author: {
        name: 'Alice',
        email: 'alice@example.com',
      },
      authoredAt: '2026-01-02T08:00:00.000Z',
      tree: {
        'README.md': '# Team project\n',
        'package.json': '{"name":"team-project"}\n',
      },
    },
    c3d4e5f: {
      id: 'c3d4e5f',
      message: 'Add application entry point',
      parentIds: ['b2c3d4e'],
      author: {
        name: 'Bob',
        email: 'bob@example.com',
      },
      authoredAt: '2026-01-03T08:00:00.000Z',
      tree: {
        'README.md': '# Team project\n',
        'package.json': '{"name":"team-project"}\n',
        'src/index.ts': 'export const start = () => "ready";\n',
      },
    },
  },
  branches: {
    main: {
      name: 'main',
      target: 'c3d4e5f',
    },
  },
  head: {
    type: 'branch',
    branch: 'main',
  },
  workingTree: {},
  stagingArea: {},
  remotes: {
    origin: {
      name: 'origin',
      url: 'https://github.com/team/learning-git.git',
      branches: {
        main: 'c3d4e5f',
      },
    },
  },
  config: {
    userName: 'Student',
    userEmail: 'student@example.com',
    defaultBranch: 'main',
  },
}) satisfies GitRepositoryState;

export const parallelGitRepository = gitRepositoryStateSchema.parse({
  ...courseGitRepository,
  commits: {
    ...courseGitRepository.commits,
    d4e5f6a: {
      id: 'd4e5f6a',
      message: 'Build profile card',
      parentIds: ['c3d4e5f'],
      author: {
        name: 'Alice',
        email: 'alice@example.com',
      },
      authoredAt: '2026-01-04T09:00:00.000Z',
      tree: {
        ...courseGitRepository.commits.c3d4e5f?.tree,
        'src/profile.ts': 'export const profile = "card";\n',
      },
    },
    e5f6a7b: {
      id: 'e5f6a7b',
      message: 'Polish profile layout',
      parentIds: ['d4e5f6a'],
      author: {
        name: 'Alice',
        email: 'alice@example.com',
      },
      authoredAt: '2026-01-05T09:00:00.000Z',
      tree: {
        ...courseGitRepository.commits.c3d4e5f?.tree,
        'src/profile.ts': 'export const profile = "polished card";\n',
      },
    },
    f6a7b8c: {
      id: 'f6a7b8c',
      message: 'Fix login timeout',
      parentIds: ['c3d4e5f'],
      author: {
        name: 'Bob',
        email: 'bob@example.com',
      },
      authoredAt: '2026-01-04T10:00:00.000Z',
      tree: {
        ...courseGitRepository.commits.c3d4e5f?.tree,
        'src/login.ts': 'export const timeout = 5000;\n',
      },
    },
  },
  branches: {
    main: {
      name: 'main',
      target: 'c3d4e5f',
    },
    'feature/profile': {
      name: 'feature/profile',
      target: 'e5f6a7b',
    },
    'fix/login': {
      name: 'fix/login',
      target: 'f6a7b8c',
    },
  },
}) satisfies GitRepositoryState;
