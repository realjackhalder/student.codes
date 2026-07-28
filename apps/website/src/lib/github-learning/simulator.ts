import { type GitRepositoryState, gitRepositoryStateSchema } from './schemas';

export type GitSimulatorErrorCode =
  | 'branch-already-exists'
  | 'branch-not-found'
  | 'command-not-supported'
  | 'invalid-arguments'
  | 'nothing-to-commit'
  | 'path-not-found'
  | 'remote-not-found';

export type GitSimulatorResult =
  | {
      ok: true;
      command: string;
      output: string[];
      state: GitRepositoryState;
    }
  | {
      ok: false;
      command: string;
      error: {
        code: GitSimulatorErrorCode;
        message: string;
      };
      state: GitRepositoryState;
    };

const cloneRepository = (repository: GitRepositoryState) =>
  gitRepositoryStateSchema.parse(repository);

const getHeadCommitId = (repository: GitRepositoryState) =>
  repository.head.type === 'branch'
    ? repository.branches[repository.head.branch]?.target
    : repository.head.commitId;

const getHeadTree = (repository: GitRepositoryState) => {
  const commitId = getHeadCommitId(repository);
  return commitId ? repository.commits[commitId]?.tree : undefined;
};

const isCommitAncestor = (
  repository: GitRepositoryState,
  ancestorId: string,
  descendantId: string,
) => {
  const pending = [descendantId];
  const visited = new Set<string>();
  while (pending.length) {
    const commitId = pending.pop();
    if (!commitId || visited.has(commitId)) continue;
    if (commitId === ancestorId) return true;
    visited.add(commitId);
    pending.push(...(repository.commits[commitId]?.parentIds ?? []));
  }
  return false;
};

const tokenize = (command: string) => {
  const tokens: string[] = [];
  let token = '';
  let quote: '"' | "'" | undefined;

  for (let index = 0; index < command.length; index += 1) {
    const character = command[index] ?? '';

    if (quote) {
      if (character === quote) quote = undefined;
      else if (character === '\\' && command[index + 1] === quote) {
        token += quote;
        index += 1;
      } else token += character;
    } else if (character === '"' || character === "'") quote = character;
    else if (/\s/.test(character)) {
      if (token) {
        tokens.push(token);
        token = '';
      }
    } else token += character;
  }

  if (quote) return undefined;
  if (token) tokens.push(token);
  return tokens;
};

const createCommitId = (
  repository: GitRepositoryState,
  message: string,
  tree: Record<string, string>,
) => {
  const input = `${Object.keys(repository.commits).length}:${message}:${JSON.stringify(tree)}`;
  let hash = 2166136261;

  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  let commitId = (hash >>> 0).toString(16).padStart(7, '0').slice(0, 7);
  while (repository.commits[commitId])
    commitId = ((Number.parseInt(commitId, 16) + 1) >>> 0)
      .toString(16)
      .padStart(7, '0')
      .slice(0, 7);

  return commitId;
};

const success = (
  command: string,
  state: GitRepositoryState,
  output: string[] = [],
): GitSimulatorResult => ({
  ok: true,
  command,
  output,
  state: gitRepositoryStateSchema.parse(state),
});

const failure = (
  command: string,
  state: GitRepositoryState,
  code: GitSimulatorErrorCode,
  message: string,
): GitSimulatorResult => ({
  ok: false,
  command,
  error: { code, message },
  state,
});

export class GitSimulator {
  readonly state: GitRepositoryState;

  constructor(repository: GitRepositoryState) {
    this.state = cloneRepository(repository);
  }

  writeFile(path: string, content: string): GitSimulator {
    const repository = cloneRepository(this.state);
    const headContent = getHeadTree(repository)?.[path];

    if (headContent === content) delete repository.workingTree[path];
    else
      repository.workingTree[path] = {
        path,
        content,
        status: headContent === undefined ? 'untracked' : 'modified',
      };

    return new GitSimulator(repository);
  }

  deleteFile(path: string): GitSimulator {
    const repository = cloneRepository(this.state);
    const headContent = getHeadTree(repository)?.[path];

    if (headContent === undefined) delete repository.workingTree[path];
    else
      repository.workingTree[path] = {
        path,
        content: null,
        status: 'deleted',
      };

    return new GitSimulator(repository);
  }

  run(command: string): GitSimulatorResult {
    const tokens = tokenize(command.trim());
    if (!tokens)
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'Unclosed quote in command.',
      );

    if (tokens[0] === 'git') tokens.shift();
    const [subcommand, ...args] = tokens;

    switch (subcommand) {
      case 'status':
        return this.status(command, args);
      case 'log':
        return this.log(command, args);
      case 'branch':
        return this.branch(command, args);
      case 'switch':
      case 'checkout':
        return this.switch(command, args);
      case 'add':
        return this.add(command, args);
      case 'commit':
        return this.commit(command, args);
      case 'remote':
        return this.remote(command, args);
      case 'push':
        return this.push(command, args);
      case 'pull':
        return this.pull(command, args);
      default:
        return failure(
          command,
          this.state,
          'command-not-supported',
          `Unsupported Git command: ${subcommand ?? ''}`,
        );
    }
  }

  private status(command: string, args: string[]): GitSimulatorResult {
    if (args.length)
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'git status does not accept arguments in this simulator.',
      );

    const branch =
      this.state.head.type === 'branch'
        ? `On branch ${this.state.head.branch}`
        : `HEAD detached at ${this.state.head.commitId}`;
    const staged = Object.keys(this.state.stagingArea).sort();
    const changed = Object.keys(this.state.workingTree).sort();
    const output = [branch];

    if (staged.length) output.push(`Changes staged: ${staged.join(', ')}`);
    if (changed.length)
      output.push(`Changes not staged: ${changed.join(', ')}`);
    if (!staged.length && !changed.length)
      output.push('nothing to commit, working tree clean');

    return success(command, this.state, output);
  }

  private log(command: string, args: string[]): GitSimulatorResult {
    if (args.length)
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'git log does not accept arguments in this simulator.',
      );

    const output: string[] = [];
    let commitId = getHeadCommitId(this.state);

    while (commitId) {
      const commit = this.state.commits[commitId];
      if (!commit) break;
      output.push(`${commit.id} ${commit.message}`);
      commitId = commit.parentIds[0];
    }

    return success(command, this.state, output);
  }

  private branch(command: string, args: string[]): GitSimulatorResult {
    if (!args.length) {
      const output = Object.keys(this.state.branches)
        .sort()
        .map(
          (name) =>
            `${this.state.head.type === 'branch' && this.state.head.branch === name ? '*' : ' '} ${name}`,
        );
      return success(command, this.state, output);
    }

    if (args.length !== 1)
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'Usage: git branch <name>',
      );

    const name = args[0] as string;
    if (this.state.branches[name])
      return success(command, this.state, [
        `Branch '${name}' already exists. Repository unchanged.`,
      ]);

    const target = getHeadCommitId(this.state);
    if (!target)
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'Cannot create a branch without a commit.',
      );

    const repository = cloneRepository(this.state);
    repository.branches[name] = { name, target };
    return success(command, repository);
  }

  private switch(command: string, args: string[]): GitSimulatorResult {
    const create = args[0] === '-c' || args[0] === '-b';
    const name = create ? args[1] : args[0];

    if (!name || args.length !== (create ? 2 : 1))
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'Usage: git switch [-c] <branch>',
      );
    if (this.state.head.type === 'branch' && this.state.head.branch === name)
      return success(command, this.state, [
        `Already on branch '${name}'. Repository unchanged.`,
      ]);
    if (
      Object.keys(this.state.workingTree).length ||
      Object.keys(this.state.stagingArea).length
    )
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'Commit or discard changes before switching branches.',
      );
    if (create && this.state.branches[name])
      return success(
        command,
        {
          ...cloneRepository(this.state),
          head: { type: 'branch', branch: name },
        },
        [`Branch '${name}' already exists; switched to it.`],
      );
    if (!create && !this.state.branches[name])
      return failure(
        command,
        this.state,
        'branch-not-found',
        `Branch '${name}' does not exist.`,
      );

    const repository = cloneRepository(this.state);
    if (create) {
      const target = getHeadCommitId(repository);
      if (!target)
        return failure(
          command,
          this.state,
          'invalid-arguments',
          'Cannot create a branch without a commit.',
        );
      repository.branches[name] = { name, target };
    }
    repository.head = { type: 'branch', branch: name };
    return success(command, repository, [`Switched to branch '${name}'`]);
  }

  private add(command: string, args: string[]): GitSimulatorResult {
    if (!args.length)
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'Usage: git add <path|.>',
      );

    const paths =
      args.length === 1 && args[0] === '.'
        ? Object.keys(this.state.workingTree)
        : args;
    if (!paths.length)
      return success(command, this.state, [
        'No new changes to stage. Repository unchanged.',
      ]);
    const missing = paths.find(
      (path) => !this.state.workingTree[path] && !this.state.stagingArea[path],
    );
    if (missing)
      return failure(
        command,
        this.state,
        'path-not-found',
        `Path '${missing}' has no working-tree changes.`,
      );

    const repository = cloneRepository(this.state);
    for (const path of paths) {
      const file = repository.workingTree[path];
      if (!file) continue;
      repository.stagingArea[path] = { path, content: file.content };
      delete repository.workingTree[path];
    }
    return success(
      command,
      repository,
      paths.every((path) => !this.state.workingTree[path])
        ? ['Selected changes are already staged. Repository unchanged.']
        : [],
    );
  }

  private commit(command: string, args: string[]): GitSimulatorResult {
    const messageFlag = args[0];
    const message = args[1];
    if (
      (messageFlag !== '-m' && messageFlag !== '--message') ||
      !message ||
      args.length !== 2
    )
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'Usage: git commit -m "message"',
      );
    if (!Object.keys(this.state.stagingArea).length)
      return success(command, this.state, [
        'No staged changes to commit. Repository unchanged.',
      ]);

    const repository = cloneRepository(this.state);
    const parentId = getHeadCommitId(repository);
    const tree = { ...(parentId ? repository.commits[parentId]?.tree : {}) };

    for (const [path, file] of Object.entries(repository.stagingArea)) {
      if (file.content === null) delete tree[path];
      else tree[path] = file.content;
    }

    const commitId = createCommitId(repository, message, tree);
    repository.commits[commitId] = {
      id: commitId,
      message,
      parentIds: parentId ? [parentId] : [],
      author: {
        name: repository.config.userName,
        email: repository.config.userEmail,
      },
      authoredAt: new Date().toISOString(),
      tree,
    };
    repository.stagingArea = {};

    if (repository.head.type === 'branch') {
      const branch = repository.branches[repository.head.branch];
      if (!branch)
        return failure(
          command,
          this.state,
          'branch-not-found',
          `Branch '${repository.head.branch}' does not exist.`,
        );
      branch.target = commitId;
    } else repository.head = { type: 'detached', commitId };

    return success(command, repository, [
      `[${repository.head.type === 'branch' ? repository.head.branch : 'detached'} ${commitId}] ${message}`,
    ]);
  }

  private remote(command: string, args: string[]): GitSimulatorResult {
    if (args.length > 1 || (args.length === 1 && args[0] !== '-v'))
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'Usage: git remote [-v]',
      );

    const verbose = args[0] === '-v';
    const output = Object.values(this.state.remotes)
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((remote) =>
        verbose ? `${remote.name}\t${remote.url} (fetch/push)` : remote.name,
      );
    return success(command, this.state, output);
  }

  private push(command: string, args: string[]): GitSimulatorResult {
    const positionals =
      args[0] === '-u' || args[0] === '--set-upstream' ? args.slice(1) : args;
    const remoteName = positionals[0] ?? 'origin';
    const branchName =
      positionals[1] ??
      (this.state.head.type === 'branch' ? this.state.head.branch : undefined);

    if (positionals.length > 2 || !branchName)
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'Usage: git push [-u|--set-upstream] [remote] [branch]',
      );
    if (!this.state.remotes[remoteName])
      return failure(
        command,
        this.state,
        'remote-not-found',
        `Remote '${remoteName}' does not exist.`,
      );
    if (!this.state.branches[branchName])
      return failure(
        command,
        this.state,
        'branch-not-found',
        `Branch '${branchName}' does not exist.`,
      );

    const repository = cloneRepository(this.state);
    const remote = repository.remotes[remoteName];
    const branch = repository.branches[branchName];
    if (!remote || !branch)
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'The remote or branch became unavailable.',
      );
    if (remote.branches[branchName] === branch.target)
      return success(command, this.state, [
        `${remoteName}/${branchName} is already up to date.`,
      ]);
    remote.branches[branchName] = branch.target;
    return success(command, repository, [
      `${branchName} -> ${remoteName}/${branchName}`,
    ]);
  }

  private pull(command: string, args: string[]): GitSimulatorResult {
    const remoteName = args[0] ?? 'origin';
    const branchName =
      args[1] ??
      (this.state.head.type === 'branch' ? this.state.head.branch : undefined);

    if (args.length > 2 || !branchName)
      return failure(
        command,
        this.state,
        'invalid-arguments',
        'Usage: git pull [remote] [branch]',
      );
    if (this.state.head.type !== 'branch')
      return success(command, this.state, [
        'Switch to a local branch before pulling. Repository unchanged.',
      ]);
    const currentBranchName = this.state.head.branch;
    if (
      Object.keys(this.state.workingTree).length ||
      Object.keys(this.state.stagingArea).length
    )
      return success(command, this.state, [
        'Save the current file changes before pulling. Repository unchanged.',
      ]);

    const remote = this.state.remotes[remoteName];
    if (!remote)
      return failure(
        command,
        this.state,
        'remote-not-found',
        `Remote '${remoteName}' does not exist.`,
      );
    const remoteTarget = remote.branches[branchName];
    if (!remoteTarget)
      return success(command, this.state, [
        `${remoteName}/${branchName} is not published yet. Repository unchanged.`,
      ]);
    const currentBranch = this.state.branches[currentBranchName];
    if (!currentBranch)
      return failure(
        command,
        this.state,
        'branch-not-found',
        `Branch '${currentBranchName}' does not exist.`,
      );
    if (currentBranch.target === remoteTarget)
      return success(command, this.state, [
        `${remoteName}/${branchName} is already up to date.`,
      ]);
    if (!isCommitAncestor(this.state, currentBranch.target, remoteTarget))
      return success(command, this.state, [
        'This lesson simulator only performs safe fast-forward pulls. Repository unchanged.',
      ]);

    const repository = cloneRepository(this.state);
    const branch = repository.branches[currentBranchName];
    if (!branch)
      return failure(
        command,
        this.state,
        'branch-not-found',
        `Branch '${currentBranchName}' does not exist.`,
      );
    branch.target = remoteTarget;
    return success(command, repository, [
      `${remoteName}/${branchName} -> ${currentBranchName}`,
      `Updated local branch to ${remoteTarget}.`,
    ]);
  }
}
