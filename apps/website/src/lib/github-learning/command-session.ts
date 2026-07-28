import { type GitRepositoryState, gitRepositoryStateSchema } from './schemas';
import {
  GitSimulator,
  type GitSimulatorErrorCode,
  type GitSimulatorResult,
} from './simulator';

export type CommandHistoryEntry =
  | {
      id: number;
      command: string;
      ok: true;
      output: string[];
    }
  | {
      id: number;
      command: string;
      ok: false;
      error: {
        code: GitSimulatorErrorCode;
        message: string;
      };
    };

export type GitCommandSession = {
  initialRepository: GitRepositoryState;
  repository: GitRepositoryState;
  history: CommandHistoryEntry[];
  snapshots: GitRepositoryState[];
  cursor: number;
  nextEntryId: number;
};

export function createGitCommandSession(
  repository: GitRepositoryState,
): GitCommandSession {
  const validated = gitRepositoryStateSchema.parse(repository);
  return {
    initialRepository: validated,
    repository: validated,
    history: [],
    snapshots: [validated],
    cursor: 0,
    nextEntryId: 1,
  };
}

const toHistoryEntry = (
  result: GitSimulatorResult,
  id: number,
): CommandHistoryEntry =>
  result.ok
    ? {
        id,
        command: result.command,
        ok: true,
        output: result.output,
      }
    : {
        id,
        command: result.command,
        ok: false,
        error: result.error,
      };

export function runGitCommand(
  session: GitCommandSession,
  command: string,
): GitCommandSession {
  const normalizedCommand = command.trim();
  if (!normalizedCommand) return session;

  const result = new GitSimulator(session.repository).run(normalizedCommand);
  const history = session.history.slice(0, session.cursor);
  const snapshots = session.snapshots.slice(0, session.cursor + 1);
  return {
    ...session,
    repository: result.state,
    history: [...history, toHistoryEntry(result, session.nextEntryId)],
    snapshots: [...snapshots, result.state],
    cursor: history.length + 1,
    nextEntryId: session.nextEntryId + 1,
  };
}

export function moveGitCommandSession(
  session: GitCommandSession,
  cursor: number,
): GitCommandSession {
  const nextCursor = Math.max(0, Math.min(cursor, session.history.length));
  return {
    ...session,
    repository: session.snapshots[nextCursor] ?? session.initialRepository,
    cursor: nextCursor,
  };
}

export function resetGitCommandSession(
  session: GitCommandSession,
): GitCommandSession {
  return createGitCommandSession(session.initialRepository);
}
