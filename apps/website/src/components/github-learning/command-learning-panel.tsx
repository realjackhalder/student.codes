'use client';

import { Button } from '@evaluate/components/button';
import { Input } from '@evaluate/components/input';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  GitCompareArrowsIcon,
  PlayIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  TerminalIcon,
} from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import {
  createGitCommandSession,
  moveGitCommandSession,
  resetGitCommandSession,
  runGitCommand,
} from '~/lib/github-learning/command-session';
import type { GitRepositoryState } from '~/lib/github-learning/schemas';
import { CommandBranchDiagram } from './command-branch-diagram';
import type { CommitGraphLabels } from './commit-graph';

export type CommandLearningPanelLabels = {
  title: string;
  description: string;
  commandInput: string;
  commandPlaceholder: string;
  runCommand: string;
  reset: string;
  suggestions: string;
  history: string;
  emptyHistory: string;
  feedback: string;
  replay: string;
  previousCommand: string;
  nextCommand: string;
  step: string;
  goToStep: string;
  before: string;
  after: string;
  currentHead: string;
  commits: string;
  branches: string;
  stagedFiles: string;
  workingChanges: string;
  remoteBranches: string;
  noRepositoryChange: string;
};

type CommandLearningPanelProps = {
  initialRepository: GitRepositoryState;
  labels: CommandLearningPanelLabels;
  graphLabels: CommitGraphLabels;
  suggestedCommands?: string[];
  onRepositoryChange?: (repository: GitRepositoryState) => void;
};

type RepositorySummary = {
  head: string;
  commits: number;
  branches: number;
  stagedFiles: number;
  workingChanges: number;
  remoteBranches: string;
};

type RepositoryTransition = {
  command: string;
  before: RepositorySummary;
  after: RepositorySummary;
  beforeRepository: GitRepositoryState;
  commandSucceeded: boolean;
  changed: boolean;
  direction?: 'back' | 'forward';
};

const summarizeRepository = (
  repository: GitRepositoryState,
): RepositorySummary => ({
  head:
    repository.head.type === 'branch'
      ? repository.head.branch
      : repository.head.commitId.slice(0, 7),
  commits: Object.keys(repository.commits).length,
  branches: Object.keys(repository.branches).length,
  stagedFiles: Object.keys(repository.stagingArea).length,
  workingChanges: Object.keys(repository.workingTree).length,
  remoteBranches:
    Object.values(repository.remotes)
      .flatMap((remote) =>
        Object.entries(remote.branches).map(
          ([branch, commitId]) =>
            `${remote.name}/${branch}@${commitId.slice(0, 7)}`,
        ),
      )
      .sort()
      .join(', ') || '—',
});

const createRepositoryTransition = (
  command: string,
  beforeRepository: GitRepositoryState,
  afterRepository: GitRepositoryState,
  commandSucceeded: boolean,
  direction?: 'back' | 'forward',
): RepositoryTransition => {
  const before = summarizeRepository(beforeRepository);
  const after = summarizeRepository(afterRepository);

  return {
    command,
    before,
    after,
    beforeRepository,
    commandSucceeded,
    changed:
      JSON.stringify(beforeRepository) !== JSON.stringify(afterRepository),
    direction,
  };
};

export function CommandLearningPanel({
  initialRepository,
  labels,
  graphLabels,
  suggestedCommands = [],
  onRepositoryChange,
}: CommandLearningPanelProps) {
  const [session, setSession] = useState(() =>
    createGitCommandSession(initialRepository),
  );
  const [command, setCommand] = useState('');
  const [animationCycle, setAnimationCycle] = useState(0);
  const [activeCommand, setActiveCommand] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [transition, setTransition] = useState<RepositoryTransition>();
  const animationTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const visibleCommand = command.trim() || activeCommand;

  useEffect(() => {
    onRepositoryChange?.(session.repository);
  }, [onRepositoryChange, session.repository]);

  useEffect(
    () => () => {
      if (animationTimer.current) clearTimeout(animationTimer.current);
    },
    [],
  );

  const beginAnimation = () => {
    if (animationTimer.current) clearTimeout(animationTimer.current);
    setAnimationCycle((cycle) => cycle + 1);
    setIsAnimating(true);
    animationTimer.current = setTimeout(() => setIsAnimating(false), 1900);
  };

  const execute = (nextCommand: string) => {
    if (!nextCommand.trim()) return;
    const normalizedCommand = nextCommand.trim();
    const nextSession = runGitCommand(session, normalizedCommand);
    const latestEntry = nextSession.history.at(-1);
    setTransition(
      createRepositoryTransition(
        normalizedCommand,
        session.repository,
        nextSession.repository,
        latestEntry?.ok ?? false,
      ),
    );
    setSession(nextSession);
    setActiveCommand(normalizedCommand);
    setCommand('');
    beginAnimation();
  };

  const moveToStep = (nextCursor: number) => {
    if (nextCursor === session.cursor) return;
    const direction = nextCursor < session.cursor ? 'back' : 'forward';
    const historyEntry =
      direction === 'back'
        ? session.history[session.cursor - 1]
        : session.history[nextCursor - 1];
    const nextSession = moveGitCommandSession(session, nextCursor);
    setTransition(
      createRepositoryTransition(
        historyEntry?.command ?? '',
        session.repository,
        nextSession.repository,
        true,
        direction,
      ),
    );
    setSession(nextSession);
    setActiveCommand(historyEntry?.command ?? '');
    setCommand('');
    beginAnimation();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    execute(command);
  };

  const reset = () => {
    if (animationTimer.current) clearTimeout(animationTimer.current);
    setSession((current) => resetGitCommandSession(current));
    setCommand('');
    setActiveCommand('');
    setIsAnimating(false);
    setTransition(undefined);
    setAnimationCycle((cycle) => cycle + 1);
  };

  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <TerminalIcon aria-hidden="true" className="size-5 text-primary" />
          <h2 className="font-semibold text-xl">{labels.title}</h2>
        </div>
        <p className="mt-1 text-muted-foreground text-sm">
          {labels.description}
        </p>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(19rem,0.58fr)_minmax(0,1.42fr)]">
        <div className="flex min-h-[22rem] min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100">
          <div className="flex items-center justify-between border-zinc-800 border-b px-4 py-2.5">
            <span className="flex items-center gap-2 font-medium text-sm">
              <TerminalIcon
                aria-hidden="true"
                className="size-4 text-emerald-400"
              />
              {labels.history}
            </span>
            <Button
              className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
              onClick={reset}
              size="sm"
              type="button"
              variant="outline"
            >
              <RotateCcwIcon aria-hidden="true" />
              {labels.reset}
            </Button>
          </div>

          {session.history.length > 0 && (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center border-zinc-800 border-b bg-zinc-900/70 px-2 py-1.5">
              <Button
                className="justify-self-start text-zinc-300 hover:bg-zinc-800 hover:text-white"
                disabled={session.cursor === 0}
                onClick={() => moveToStep(session.cursor - 1)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <ArrowUpIcon aria-hidden="true" />
                {labels.previousCommand}
              </Button>
              <span
                aria-live="polite"
                className="px-2 font-mono text-emerald-300 text-xs"
              >
                {labels.step} {session.cursor} / {session.history.length}
              </span>
              <Button
                className="justify-self-end text-zinc-300 hover:bg-zinc-800 hover:text-white"
                disabled={session.cursor === session.history.length}
                onClick={() => moveToStep(session.cursor + 1)}
                size="sm"
                type="button"
                variant="ghost"
              >
                {labels.nextCommand}
                <ArrowDownIcon aria-hidden="true" />
              </Button>
            </div>
          )}

          <div
            aria-live="polite"
            className="min-h-0 flex-1 overflow-y-auto p-4 font-mono text-sm"
            role="log"
          >
            {!session.history.length && (
              <p className="text-zinc-500">{labels.emptyHistory}</p>
            )}
            <ol className="space-y-4">
              {session.history.map((entry, index) => (
                <li
                  className={`rounded-md border-l-2 py-1 pl-2 transition-all ${
                    index === session.cursor - 1
                      ? 'border-emerald-400 bg-emerald-400/5'
                      : index >= session.cursor
                        ? 'border-transparent opacity-40'
                        : 'border-transparent'
                  } ${
                    index === session.cursor - 1 && isAnimating
                      ? 'motion-safe:animate-team-stage-card'
                      : ''
                  }`}
                  key={entry.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      aria-label={`${labels.goToStep} ${index + 1}: ${entry.command}`}
                      className="flex min-w-0 gap-2 text-left text-zinc-100"
                      onClick={() => moveToStep(index + 1)}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className="select-none text-emerald-400"
                      >
                        $
                      </span>
                      <code className="break-all">{entry.command}</code>
                    </button>
                    <button
                      aria-label={`${labels.replay}: ${entry.command}`}
                      className="shrink-0 rounded p-1 text-zinc-500 transition-colors hover:text-emerald-400 focus-visible:text-emerald-400"
                      onClick={() => execute(entry.command)}
                      type="button"
                    >
                      <RefreshCwIcon aria-hidden="true" className="size-3.5" />
                    </button>
                  </div>
                  {entry.ok ? (
                    entry.output.length > 0 && (
                      <pre className="mt-1 whitespace-pre-wrap text-zinc-400">
                        {entry.output.join('\n')}
                      </pre>
                    )
                  ) : (
                    <p className="mt-1 text-amber-200">
                      <span className="font-semibold">{labels.feedback}:</span>{' '}
                      {entry.error.message}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <form
            className="flex gap-2 border-zinc-800 border-t p-3"
            onSubmit={submit}
          >
            <span
              aria-hidden="true"
              className="self-center font-mono text-emerald-400"
            >
              $
            </span>
            <Input
              aria-label={labels.commandInput}
              autoComplete="off"
              className="border-zinc-700 bg-zinc-900 font-mono text-zinc-100 placeholder:text-zinc-600 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/30"
              onChange={(event) => setCommand(event.target.value)}
              placeholder={labels.commandPlaceholder}
              spellCheck={false}
              value={command}
            />
            <Button
              aria-label={labels.runCommand}
              disabled={!command.trim()}
              size="icon"
              type="submit"
            >
              <PlayIcon aria-hidden="true" />
            </Button>
          </form>
        </div>

        <CommandBranchDiagram
          animationCycle={animationCycle}
          command={visibleCommand}
          commandSucceeded={transition?.commandSucceeded}
          direction={transition?.direction}
          isAnimating={isAnimating}
          previousRepository={transition?.beforeRepository}
          repository={session.repository}
          title={graphLabels.graph}
        />
      </div>

      {suggestedCommands.length > 0 && (
        <div>
          <h3 className="font-medium text-sm">{labels.suggestions}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestedCommands.map((suggestion) => (
              <Button
                className="font-mono"
                key={suggestion}
                onClick={() => execute(suggestion)}
                size="sm"
                type="button"
                variant="outline"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {transition && (
        <details className="group rounded-xl border" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
            <span className="flex items-center gap-2 font-medium text-sm">
              <GitCompareArrowsIcon
                aria-hidden="true"
                className="size-4 text-primary"
              />
              {labels.before}
              <ArrowRightIcon
                aria-hidden="true"
                className="size-3.5 text-muted-foreground"
              />
              {labels.after}
            </span>
            {!transition.changed && (
              <span className="text-muted-foreground text-xs">
                {labels.noRepositoryChange}
              </span>
            )}
          </summary>
          <dl className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-2 border-t p-4 text-sm">
            {[
              [
                labels.currentHead,
                transition.before.head,
                transition.after.head,
              ],
              [
                labels.commits,
                transition.before.commits,
                transition.after.commits,
              ],
              [
                labels.branches,
                transition.before.branches,
                transition.after.branches,
              ],
              [
                labels.stagedFiles,
                transition.before.stagedFiles,
                transition.after.stagedFiles,
              ],
              [
                labels.workingChanges,
                transition.before.workingChanges,
                transition.after.workingChanges,
              ],
              [
                labels.remoteBranches,
                transition.before.remoteBranches,
                transition.after.remoteBranches,
              ],
            ].map(([label, before, after]) => (
              <div className="contents" key={label}>
                <dt className="truncate text-muted-foreground">{label}</dt>
                <dd className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                  {before}
                </dd>
                <dd
                  className={`rounded-md px-2 py-1 font-mono text-xs ${
                    before === after
                      ? 'bg-muted'
                      : 'bg-primary/15 font-semibold text-primary'
                  }`}
                >
                  {after}
                </dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </section>
  );
}
