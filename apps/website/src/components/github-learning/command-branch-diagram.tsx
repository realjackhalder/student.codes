'use client';

import { useSay } from '@sayable/react';
import {
  CloudIcon,
  GitBranchIcon,
  LaptopIcon,
  PackageIcon,
} from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import {
  buildGitGraphLayout,
  type GitGraphNode,
} from '~/lib/github-learning/graph-layout';
import type { GitRepositoryState } from '~/lib/github-learning/schemas';

const GRAPH_LEFT = 156;
const GRAPH_TOP = 78;
const COLUMN_GAP = 96;
const LANE_GAP = 76;
const LANE_COLOURS = [
  'var(--color-primary)',
  '#8b5cf6',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
];

type CommandBranchDiagramProps = {
  repository: GitRepositoryState;
  previousRepository?: GitRepositoryState;
  command?: string;
  commandSucceeded?: boolean;
  direction?: 'back' | 'forward';
  animationCycle: number;
  isAnimating: boolean;
  title: string;
};

const getHeadLabel = (repository: GitRepositoryState) =>
  repository.head.type === 'branch'
    ? repository.head.branch
    : repository.head.commitId.slice(0, 7);

const getHeadCommitId = (repository: GitRepositoryState) =>
  repository.head.type === 'branch'
    ? repository.branches[repository.head.branch]?.target
    : repository.head.commitId;

const getCommitDepths = (repository: GitRepositoryState) => {
  const depths = new Map<string, number>();
  const visiting = new Set<string>();
  const visit = (commitId: string): number => {
    const knownDepth = depths.get(commitId);
    if (knownDepth !== undefined) return knownDepth;
    if (visiting.has(commitId)) return 0;
    visiting.add(commitId);
    const commit = repository.commits[commitId];
    const depth = commit?.parentIds.length
      ? Math.max(...commit.parentIds.map(visit)) + 1
      : 0;
    visiting.delete(commitId);
    depths.set(commitId, depth);
    return depth;
  };

  for (const commitId of Object.keys(repository.commits)) visit(commitId);
  return depths;
};

const getEffect = (
  before: GitRepositoryState | undefined,
  after: GitRepositoryState,
  commandSucceeded: boolean | undefined,
  command: string | undefined,
) => {
  if (commandSucceeded === false) return 'inspect' as const;
  const subcommand = command
    ?.trim()
    .replace(/^git\s+/, '')
    .split(/\s+/)[0];
  if (subcommand === 'pull') return 'pull' as const;
  if (subcommand === 'push') return 'push' as const;
  if (subcommand === 'switch' || subcommand === 'checkout')
    return 'head' as const;
  if (!before) return 'ready' as const;
  if (Object.keys(after.commits).length > Object.keys(before.commits).length)
    return 'commit' as const;
  if (Object.keys(after.branches).length > Object.keys(before.branches).length)
    return 'branch' as const;
  if (getHeadLabel(after) !== getHeadLabel(before)) return 'head' as const;
  if (JSON.stringify(after.stagingArea) !== JSON.stringify(before.stagingArea))
    return 'stage' as const;
  if (JSON.stringify(after.remotes) !== JSON.stringify(before.remotes))
    return 'push' as const;
  if (JSON.stringify(after.workingTree) !== JSON.stringify(before.workingTree))
    return 'working' as const;
  return 'inspect' as const;
};

export function CommandBranchDiagram({
  repository,
  previousRepository,
  command,
  commandSucceeded,
  direction,
  animationCycle,
  isAnimating,
  title,
}: CommandBranchDiagramProps) {
  const say = useSay();
  const titleId = useId();
  const descriptionId = useId();
  const gridId = useId();
  const [reducedMotion, setReducedMotion] = useState(false);
  const layout = useMemo(() => buildGitGraphLayout(repository), [repository]);
  const commitDepths = useMemo(() => getCommitDepths(repository), [repository]);
  const nodesById = new Map(layout.nodes.map((node) => [node.commitId, node]));
  const maxDepth = Math.max(0, ...commitDepths.values());
  const laneCount = Math.max(layout.columns, 1);
  const width = Math.max(660, GRAPH_LEFT + maxDepth * COLUMN_GAP + 110);
  const height = Math.max(210, GRAPH_TOP + (laneCount - 1) * LANE_GAP + 108);
  const effect = getEffect(
    previousRepository,
    repository,
    commandSucceeded,
    command,
  );
  const newCommitIds = new Set(
    previousRepository
      ? Object.keys(repository.commits).filter(
          (commitId) => !previousRepository.commits[commitId],
        )
      : [],
  );
  const newBranches = new Set(
    previousRepository
      ? Object.keys(repository.branches).filter(
          (branchName) => !previousRepository.branches[branchName],
        )
      : [],
  );

  const positionForNode = (node: GitGraphNode) => ({
    x: GRAPH_LEFT + (commitDepths.get(node.commitId) ?? 0) * COLUMN_GAP,
    y: GRAPH_TOP + node.column * LANE_GAP,
  });
  const positions = new Map(
    layout.nodes.map((node) => [node.commitId, positionForNode(node)]),
  );
  const currentHeadNode = layout.nodes.find((node) => node.isHead);
  const currentHeadPosition = currentHeadNode
    ? positions.get(currentHeadNode.commitId)
    : undefined;
  const previousHeadCommitId = previousRepository
    ? getHeadCommitId(previousRepository)
    : undefined;
  const previousHeadPosition = previousHeadCommitId
    ? positions.get(previousHeadCommitId)
    : undefined;
  const currentBranch =
    repository.head.type === 'branch' ? repository.head.branch : 'detached';
  const activeRemote = Object.keys(repository.remotes).sort()[0] ?? 'origin';

  const effectLabel =
    direction === 'back'
      ? say`Moved back one command`
      : direction === 'forward'
        ? say`Moved forward one command`
        : {
            ready: say`Ready for a command`,
            commit: say`New commit added`,
            branch: say`New branch created`,
            head: say`HEAD moved to another branch`,
            stage: say`Staging area updated`,
            push: say`Remote branch updated`,
            pull: say`Remote code installed on your local branch`,
            working: say`Working files updated`,
            inspect: say`Command replayed — current location highlighted`,
          }[effect];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p
            className="flex items-center gap-2 font-medium text-sm"
            id={titleId}
          >
            <GitBranchIcon aria-hidden="true" className="size-4 text-primary" />
            {title}
          </p>
          <p
            aria-live="polite"
            className="mt-0.5 text-muted-foreground text-xs"
          >
            {effectLabel}
          </p>
        </div>
        {command && (
          <code
            className={`max-w-full truncate rounded-md bg-muted px-2.5 py-1 font-mono text-xs ${
              isAnimating
                ? 'text-primary motion-safe:animate-team-stage-card'
                : 'text-muted-foreground'
            }`}
          >
            $ {command}
          </code>
        )}
      </div>

      <div className="border-b bg-muted/20 px-4 py-3">
        <div className="grid grid-cols-[minmax(7rem,auto)_minmax(5rem,1fr)_minmax(7rem,auto)] items-center gap-3">
          <div
            className={`flex min-w-0 items-center gap-2 rounded-lg border bg-card px-3 py-2 ${
              isAnimating && effect === 'pull'
                ? 'motion-safe:animate-git-device-install'
                : ''
            }`}
          >
            <LaptopIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-emerald-500"
            />
            <span className="min-w-0">
              <span className="block text-muted-foreground text-xs">
                {say`Local computer`}
              </span>
              <span className="block truncate font-mono text-xs">
                {currentBranch}
              </span>
            </span>
          </div>

          <div className="relative flex h-10 items-center justify-center overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 border-border border-t"
            />
            {(effect === 'push' || effect === 'pull') && isAnimating ? (
              <PackageIcon
                aria-label={
                  effect === 'pull'
                    ? say`Code package moving to your computer`
                    : say`Code package moving to GitHub`
                }
                className={`absolute z-10 size-6 rounded bg-card p-1 text-amber-500 shadow-sm ${
                  effect === 'pull'
                    ? 'left-0 motion-safe:animate-git-package-pull'
                    : 'right-0 motion-safe:animate-git-package-push'
                }`}
                key={`package-${animationCycle}`}
              />
            ) : effect === 'head' && command ? (
              <span className="relative z-10 flex items-center gap-1.5 rounded-full bg-card px-2 py-1 text-emerald-600 text-xs shadow-sm">
                <GitBranchIcon aria-hidden="true" className="size-3.5" />
                {say`Switching local branch`}
              </span>
            ) : (
              <span className="relative z-10 rounded-full bg-card px-2 py-1 text-muted-foreground text-xs">
                {say`Code transfer`}
              </span>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <CloudIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-sky-500"
            />
            <span className="min-w-0">
              <span className="block text-muted-foreground text-xs">
                {say`GitHub remote`}
              </span>
              <span className="block truncate font-mono text-xs">
                {activeRemote}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="border-b px-4 py-2.5">
        <dl className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5">
            <dt className="text-muted-foreground">{say`Working`}</dt>
            <dd
              className={`rounded-full bg-muted px-2 py-0.5 font-mono ${
                isAnimating && effect === 'working'
                  ? 'text-primary motion-safe:animate-team-stage-card'
                  : ''
              }`}
            >
              {Object.keys(repository.workingTree).length}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-muted-foreground">{say`Staged`}</dt>
            <dd
              className={`rounded-full bg-muted px-2 py-0.5 font-mono ${
                isAnimating && effect === 'stage'
                  ? 'text-primary motion-safe:animate-team-stage-card'
                  : ''
              }`}
            >
              {Object.keys(repository.stagingArea).length}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="text-muted-foreground">{say`Commits`}</dt>
            <dd className="rounded-full bg-muted px-2 py-0.5 font-mono">
              {Object.keys(repository.commits).length}
            </dd>
          </div>
        </dl>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs">
          <span>{say`Solid lines connect commits`}</span>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-emerald-500"
            />
            {say`Green dot shows your current location`}
          </span>
        </p>
      </div>

      <div className="min-w-0 overflow-x-auto p-3">
        <svg
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          className={`block ${
            isAnimating ? 'motion-safe:animate-git-command-focus' : ''
          }`}
          height={height}
          key={animationCycle}
          role="img"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        >
          <title>{title}</title>
          <desc id={descriptionId}>
            {say`A live diagram of the simulated repository. Branch lines, commits, remote pointers, and HEAD update after each command.`}
          </desc>
          <defs>
            <pattern
              height="24"
              id={gridId}
              patternUnits="userSpaceOnUse"
              width="24"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="var(--color-border)"
                strokeOpacity="0.28"
              />
            </pattern>
          </defs>
          <rect
            fill={`url(#${gridId})`}
            height={height}
            rx="12"
            width={width}
          />

          {layout.edges.map((edge) => {
            const child = positions.get(edge.from);
            const parent = positions.get(edge.to);
            const childNode = nodesById.get(edge.from);
            if (!child || !parent || !childNode) return null;
            const colour =
              LANE_COLOURS[childNode.column % LANE_COLOURS.length] ??
              'var(--color-primary)';
            return (
              <path
                className={
                  isAnimating && newCommitIds.has(edge.from)
                    ? 'motion-safe:animate-team-branch-draw'
                    : undefined
                }
                d={`M ${parent.x} ${parent.y} C ${(parent.x + child.x) / 2} ${parent.y}, ${(parent.x + child.x) / 2} ${child.y}, ${child.x} ${child.y}`}
                fill="none"
                key={`${edge.from}-${edge.to}`}
                pathLength="1"
                stroke={colour}
                strokeDasharray={
                  isAnimating && newCommitIds.has(edge.from) ? '1' : undefined
                }
                strokeLinecap="round"
                strokeWidth="4"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {isAnimating &&
            effect === 'head' &&
            previousHeadPosition &&
            currentHeadPosition &&
            !reducedMotion && (
              <circle
                fill="var(--color-card)"
                r="7"
                stroke="#22c55e"
                strokeWidth="3"
              >
                <animate attributeName="opacity" dur="1.65s" values="0;1;1;0" />
                <animateMotion
                  dur="1.65s"
                  path={`M ${previousHeadPosition.x} ${previousHeadPosition.y} L ${currentHeadPosition.x} ${currentHeadPosition.y}`}
                />
                <title>{say`HEAD moving between local branches`}</title>
              </circle>
            )}

          {layout.nodes.map((node) => {
            const commit = repository.commits[node.commitId];
            const position = positions.get(node.commitId);
            if (!commit || !position) return null;
            const colour =
              LANE_COLOURS[node.column % LANE_COLOURS.length] ??
              'var(--color-primary)';
            const isNew = newCommitIds.has(node.commitId);
            return (
              <g
                className={
                  isAnimating && isNew
                    ? 'motion-safe:animate-team-commit-enter'
                    : undefined
                }
                key={node.commitId}
              >
                <circle
                  cx={position.x}
                  cy={position.y}
                  fill="var(--color-card)"
                  r={isNew ? 11 : 8}
                  stroke={colour}
                  strokeWidth={isNew ? 5 : 4}
                  vectorEffect="non-scaling-stroke"
                />
                {node.isHead && (
                  <>
                    <circle
                      className={
                        isAnimating
                          ? 'motion-safe:animate-git-current-pulse'
                          : undefined
                      }
                      cx={position.x}
                      cy={position.y}
                      fill="#22c55e"
                      r="3.5"
                    />
                    <text
                      fill="#16a34a"
                      fontSize="9"
                      fontWeight="700"
                      x={position.x + 14}
                      y={position.y + 3.5}
                    >
                      HEAD
                    </text>
                  </>
                )}
                {node.branchNames.map((branchName, index) => (
                  <text
                    className={
                      isAnimating && newBranches.has(branchName)
                        ? 'motion-safe:animate-team-stage-card'
                        : undefined
                    }
                    fill={colour}
                    fontSize="10"
                    fontWeight={node.isHead ? '700' : '600'}
                    key={branchName}
                    textAnchor="middle"
                    x={position.x}
                    y={position.y - 17 - index * 13}
                  >
                    {branchName}
                    <title>{branchName}</title>
                  </text>
                ))}
                <text
                  fill="var(--color-muted-foreground)"
                  fontFamily="monospace"
                  fontSize="10"
                  textAnchor="middle"
                  x={position.x}
                  y={position.y + 25}
                >
                  {node.commitId.slice(0, 7)}
                </text>
                {node.remoteNames.map((remoteName, index) => (
                  <text
                    className={
                      isAnimating && effect === 'push'
                        ? 'motion-safe:animate-team-stage-card'
                        : undefined
                    }
                    fill="var(--color-muted-foreground)"
                    fontSize="10"
                    key={remoteName}
                    textAnchor="middle"
                    x={position.x}
                    y={position.y + 42 + index * 13}
                  >
                    {remoteName}
                  </text>
                ))}
                <title>{commit.message}</title>
              </g>
            );
          })}

          {isAnimating &&
            currentHeadPosition &&
            !reducedMotion &&
            effect !== 'head' && (
              <circle fill="#f59e0b" r="5">
                <animate attributeName="opacity" dur="1.55s" values="0;1;1;0" />
                <animateMotion
                  dur="1.55s"
                  path={`M ${GRAPH_LEFT - 70} ${currentHeadPosition.y} L ${currentHeadPosition.x} ${currentHeadPosition.y}`}
                />
                <title>{say`Command moving to the current commit`}</title>
              </circle>
            )}
        </svg>
      </div>
    </section>
  );
}
