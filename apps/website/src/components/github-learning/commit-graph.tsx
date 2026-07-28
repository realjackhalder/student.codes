'use client';

import { Fragment, useMemo, useState } from 'react';
import {
  buildGitGraphLayout,
  type GitGraphNode,
} from '~/lib/github-learning/graph-layout';
import type { GitRepositoryState } from '~/lib/github-learning/schemas';

const COLUMN_WIDTH = 52;
const ROW_HEIGHT = 76;
const GRAPH_PADDING = 28;
const LANE_COLOURS = [
  'var(--color-primary)',
  '#3b82f6',
  '#a855f7',
  '#f59e0b',
  '#ef4444',
];

export type CommitGraphLabels = {
  graph: string;
  head: string;
  commit: string;
  authoredBy: string;
};

type CommitGraphProps = {
  repository: GitRepositoryState;
  labels: CommitGraphLabels;
  selectedCommitId?: string;
  onSelectCommit?: (commitId: string) => void;
};

export function CommitGraph({
  repository,
  labels,
  selectedCommitId,
  onSelectCommit,
}: CommitGraphProps) {
  const layout = useMemo(() => buildGitGraphLayout(repository), [repository]);
  const [internalSelection, setInternalSelection] = useState(
    selectedCommitId ?? layout.nodes[0]?.commitId,
  );
  const activeCommitId = selectedCommitId ?? internalSelection;
  const activeCommit = activeCommitId
    ? repository.commits[activeCommitId]
    : undefined;
  const currentBranch =
    repository.head.type === 'branch' ? repository.head.branch : undefined;
  const positions = new Map(
    layout.nodes.map((node) => [
      node.commitId,
      {
        x: GRAPH_PADDING + node.column * COLUMN_WIDTH,
        y: GRAPH_PADDING + node.row * ROW_HEIGHT,
      },
    ]),
  );
  const width =
    GRAPH_PADDING * 2 + Math.max(layout.columns - 1, 0) * COLUMN_WIDTH;
  const height =
    GRAPH_PADDING * 2 + Math.max(layout.nodes.length - 1, 0) * ROW_HEIGHT;

  const selectCommit = (node: GitGraphNode) => {
    setInternalSelection(node.commitId);
    onSelectCommit?.(node.commitId);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(11rem,auto)_minmax(0,1fr)]">
      <div
        aria-label={labels.graph}
        className="overflow-x-auto rounded-xl border bg-card p-3"
        role="tree"
      >
        <svg
          aria-label={labels.graph}
          className="block min-h-24"
          height={Math.max(height, 96)}
          role="group"
          viewBox={`0 0 ${Math.max(width, 176)} ${Math.max(height, 96)}`}
          width={Math.max(width, 176)}
        >
          <title>{labels.graph}</title>
          {layout.edges.map((edge) => {
            const from = positions.get(edge.from);
            const to = positions.get(edge.to);
            if (!from || !to) return null;
            const colour =
              LANE_COLOURS[
                (layout.nodes.find((node) => node.commitId === edge.from)
                  ?.column ?? 0) % LANE_COLOURS.length
              ];

            return (
              <path
                d={`M ${from.x} ${from.y} C ${from.x} ${(from.y + to.y) / 2}, ${to.x} ${(from.y + to.y) / 2}, ${to.x} ${to.y}`}
                fill="none"
                key={`${edge.from}-${edge.to}`}
                pathLength="1"
                stroke={colour}
                strokeDasharray="1"
                strokeWidth="3"
              />
            );
          })}

          {layout.nodes.map((node) => {
            const commit = repository.commits[node.commitId];
            const position = positions.get(node.commitId);
            if (!commit || !position) return null;
            const isSelected = node.commitId === activeCommitId;
            const colour =
              LANE_COLOURS[node.column % LANE_COLOURS.length] ??
              'var(--color-primary)';

            return (
              <g
                aria-label={`${commit.message}, ${labels.commit} ${node.commitId.slice(0, 7)}`}
                aria-selected={isSelected}
                className="cursor-pointer outline-none focus-visible:[&_circle]:stroke-foreground"
                key={node.commitId}
                onClick={() => selectCommit(node)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectCommit(node);
                  }
                }}
                role="treeitem"
                tabIndex={0}
              >
                {isSelected && (
                  <circle
                    cx={position.x}
                    cy={position.y}
                    fill="none"
                    r="13"
                    stroke={colour}
                    strokeWidth="2"
                  />
                )}
                <circle
                  cx={position.x}
                  cy={position.y}
                  fill="var(--color-card)"
                  r="8"
                  stroke={colour}
                  strokeWidth="4"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div aria-live="polite" className="min-w-0 rounded-xl border bg-card p-5">
        {activeCommit && (
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  ...(layout.nodes.find(
                    (node) => node.commitId === activeCommit.id,
                  )?.branchNames ?? []),
                ]
                  .sort((left, right) =>
                    left === currentBranch
                      ? -1
                      : right === currentBranch
                        ? 1
                        : 0,
                  )
                  .map((branch) => (
                    <Fragment key={branch}>
                      <span
                        className={
                          branch === currentBranch
                            ? 'rounded-full bg-primary px-2 py-0.5 font-medium text-primary-foreground text-xs'
                            : 'rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground text-xs'
                        }
                      >
                        {branch}
                      </span>
                      {branch === currentBranch && (
                        <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-semibold text-primary text-xs">
                          {labels.head}
                        </span>
                      )}
                    </Fragment>
                  ))}
                {layout.nodes
                  .find((node) => node.commitId === activeCommit.id)
                  ?.remoteNames.map((remote) => (
                    <span
                      className="rounded-full border px-2 py-0.5 font-medium text-muted-foreground text-xs"
                      key={remote}
                    >
                      {remote}
                    </span>
                  ))}
                {!currentBranch &&
                  layout.nodes.find((node) => node.commitId === activeCommit.id)
                    ?.isHead && (
                    <span className="font-semibold text-primary text-xs">
                      {labels.head}
                    </span>
                  )}
              </div>
              <h3 className="mt-3 font-semibold text-lg">
                {activeCommit.message}
              </h3>
              <code className="text-muted-foreground text-xs">
                {activeCommit.id}
              </code>
            </div>
            <p className="text-muted-foreground text-sm">
              {labels.authoredBy} {activeCommit.author.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
