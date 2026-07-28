'use client';

import { Button } from '@evaluate/components/button';
import { useSay } from '@sayable/react';
import {
  CheckCircle2Icon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  UsersIcon,
} from 'lucide-react';
import { useEffect, useId, useState } from 'react';

const LAST_STAGE = 6;
const STAGE_DURATION = 2200;

type DiagramEdge = {
  id: string;
  stage: number;
  path: string;
  colour: string;
};

type DiagramCommit = {
  id: string;
  stage: number;
  x: number;
  y: number;
  colour: string;
  label: string;
};

const edges: DiagramEdge[] = [
  {
    id: 'main-start',
    stage: 0,
    path: 'M 125 165 L 265 165',
    colour: 'var(--color-primary)',
  },
  {
    id: 'alice-branch',
    stage: 1,
    path: 'M 265 165 C 295 165, 300 80, 350 80',
    colour: '#a855f7',
  },
  {
    id: 'bob-branch',
    stage: 2,
    path: 'M 265 165 C 300 165, 310 255, 375 255',
    colour: '#3b82f6',
  },
  {
    id: 'alice-work',
    stage: 3,
    path: 'M 350 80 L 510 80',
    colour: '#a855f7',
  },
  {
    id: 'bob-work',
    stage: 3,
    path: 'M 375 255 L 485 255',
    colour: '#3b82f6',
  },
  {
    id: 'bob-merge',
    stage: 4,
    path: 'M 485 255 C 535 255, 525 165, 575 165',
    colour: '#3b82f6',
  },
  {
    id: 'main-after-hotfix',
    stage: 4,
    path: 'M 265 165 L 575 165',
    colour: 'var(--color-primary)',
  },
  {
    id: 'alice-merge',
    stage: 5,
    path: 'M 510 80 C 610 80, 600 165, 690 165',
    colour: '#a855f7',
  },
  {
    id: 'main-after-feature',
    stage: 5,
    path: 'M 575 165 L 690 165',
    colour: 'var(--color-primary)',
  },
  {
    id: 'release',
    stage: 6,
    path: 'M 690 165 L 830 165',
    colour: 'var(--color-primary)',
  },
];

const commits: DiagramCommit[] = [
  {
    id: 'base',
    stage: 0,
    x: 125,
    y: 165,
    colour: 'var(--color-primary)',
    label: 'a1',
  },
  {
    id: 'shared',
    stage: 0,
    x: 265,
    y: 165,
    colour: 'var(--color-primary)',
    label: 'b2',
  },
  {
    id: 'alice-one',
    stage: 1,
    x: 350,
    y: 80,
    colour: '#a855f7',
    label: 'c3',
  },
  {
    id: 'bob-one',
    stage: 2,
    x: 375,
    y: 255,
    colour: '#3b82f6',
    label: 'd4',
  },
  {
    id: 'alice-two',
    stage: 3,
    x: 510,
    y: 80,
    colour: '#a855f7',
    label: 'e5',
  },
  {
    id: 'bob-two',
    stage: 3,
    x: 485,
    y: 255,
    colour: '#3b82f6',
    label: 'f6',
  },
  {
    id: 'hotfix-merge',
    stage: 4,
    x: 575,
    y: 165,
    colour: 'var(--color-primary)',
    label: 'm7',
  },
  {
    id: 'feature-merge',
    stage: 5,
    x: 690,
    y: 165,
    colour: 'var(--color-primary)',
    label: 'm8',
  },
  {
    id: 'release',
    stage: 6,
    x: 830,
    y: 165,
    colour: '#f59e0b',
    label: 'v1',
  },
];

export function TeamBranchDiagram() {
  const say = useSay();
  const titleId = useId();
  const descriptionId = useId();
  const gridId = useId();
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const stages = [
    {
      title: say`Everyone starts from main`,
      description: say`The team pulls the latest shared commit before starting new work.`,
      command: 'git pull origin main',
      person: say`Whole team`,
    },
    {
      title: say`Alice starts a profile feature`,
      description: say`Alice creates an isolated branch so unfinished UI work cannot destabilize main.`,
      command: 'git switch -c feature/profile',
      person: say`Alice · Frontend`,
    },
    {
      title: say`Bob starts an urgent login fix`,
      description: say`Bob branches from the same stable commit while Alice continues independently.`,
      command: 'git switch -c fix/login',
      person: say`Bob · Authentication`,
    },
    {
      title: say`Both developers commit in parallel`,
      description: say`Each branch advances through focused commits without blocking the other developer.`,
      command: 'git add . && git commit',
      person: say`Alice + Bob`,
    },
    {
      title: say`Bob's hotfix is reviewed and merged`,
      description: say`The small urgent pull request reaches main first after automated checks and review.`,
      command: 'gh pr merge fix/login',
      person: say`Mia · Reviewer`,
    },
    {
      title: say`Alice's feature follows through review`,
      description: say`Alice updates from main, resolves any conflicts, and merges the approved feature.`,
      command: 'gh pr merge feature/profile',
      person: say`Alice + Mia`,
    },
    {
      title: say`The team releases from main`,
      description: say`Main now contains both pieces of work and becomes the source of the next release.`,
      command: 'git tag v1.0.0',
      person: say`Whole team`,
    },
  ];
  const activeStage = stages[stage]!;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setReducedMotion(media.matches);
      if (media.matches) setPlaying(false);
    };
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(
      () => setStage((current) => (current === LAST_STAGE ? 0 : current + 1)),
      STAGE_DURATION,
    );
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);

  return (
    <section className="overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 shadow-sm">
      <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 font-medium text-primary text-sm">
            <UsersIcon aria-hidden="true" className="size-4" />
            {say`Real team workflow`}
          </p>
          <h2 className="mt-1 font-semibold text-2xl" id={titleId}>
            {say`Three teammates, two branches, one stable main`}
          </h2>
          <p className="mt-2 text-muted-foreground text-sm" id={descriptionId}>
            {say`Follow feature work and an urgent hotfix as they move through parallel branches, review, merge, and release.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            aria-label={playing ? say`Pause animation` : say`Play animation`}
            onClick={() => setPlaying((current) => !current)}
            size="icon"
            type="button"
            variant="outline"
          >
            {playing ? (
              <PauseIcon aria-hidden="true" />
            ) : (
              <PlayIcon aria-hidden="true" />
            )}
          </Button>
          <Button
            onClick={() => {
              setStage(0);
              setPlaying(!reducedMotion);
            }}
            type="button"
            variant="outline"
          >
            <RotateCcwIcon aria-hidden="true" />
            {say`Replay`}
          </Button>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.5fr)_minmax(19rem,0.5fr)]">
        <div className="min-w-0 overflow-x-auto p-3 sm:p-5">
          <svg
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            className="min-w-[720px]"
            role="img"
            viewBox="0 0 900 330"
          >
            <title>{say`Animated team Git branch workflow`}</title>
            <desc>
              {say`A visual timeline showing Alice and Bob working on parallel branches, completing pull request reviews, merging into main, and releasing together.`}
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
                  strokeOpacity="0.35"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect fill={`url(#${gridId})`} height="330" rx="18" width="900" />

            <g className="font-medium text-xs">
              <text fill="var(--color-primary)" x="24" y="169">
                main
              </text>
              <text fill="#a855f7" x="24" y="84">
                feature/profile · Alice
              </text>
              <text fill="#3b82f6" x="24" y="259">
                fix/login · Bob
              </text>
            </g>

            {edges
              .filter((edge) => edge.stage <= stage)
              .map((edge) => (
                <path
                  className="motion-safe:animate-team-branch-draw"
                  d={edge.path}
                  fill="none"
                  key={`${stage}-${edge.id}`}
                  pathLength="1"
                  stroke={edge.colour}
                  strokeDasharray="1"
                  strokeLinecap="round"
                  strokeWidth="5"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

            {commits
              .filter((commit) => commit.stage <= stage)
              .map((commit) => (
                <g
                  className="motion-safe:animate-team-commit-enter"
                  key={`${stage}-${commit.id}`}
                >
                  <circle
                    cx={commit.x}
                    cy={commit.y}
                    fill="var(--color-card)"
                    r="11"
                    stroke={commit.colour}
                    strokeWidth="5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <text
                    fill="var(--color-muted-foreground)"
                    fontFamily="monospace"
                    fontSize="11"
                    textAnchor="middle"
                    x={commit.x}
                    y={commit.y + 31}
                  >
                    {commit.label}
                  </text>
                </g>
              ))}

            {stage >= 4 && (
              <g className="motion-safe:animate-team-review-card">
                <rect
                  fill="var(--color-card)"
                  height="30"
                  rx="15"
                  stroke="#3b82f6"
                  width="98"
                  x="478"
                  y="286"
                />
                <text
                  fill="#3b82f6"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  x="527"
                  y="305"
                >
                  {say`PR approved`}
                </text>
              </g>
            )}
            {stage >= 5 && (
              <g className="motion-safe:animate-team-review-card">
                <rect
                  fill="var(--color-card)"
                  height="30"
                  rx="15"
                  stroke="#a855f7"
                  width="98"
                  x="525"
                  y="34"
                />
                <text
                  fill="#a855f7"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  x="574"
                  y="53"
                >
                  {say`PR approved`}
                </text>
              </g>
            )}
            {stage === 6 && (
              <g className="motion-safe:animate-team-release">
                <circle
                  cx="830"
                  cy="165"
                  fill="#f59e0b"
                  r="26"
                  opacity="0.16"
                />
                <text
                  fill="#f59e0b"
                  fontSize="12"
                  fontWeight="700"
                  textAnchor="middle"
                  x="830"
                  y="118"
                >
                  {say`Release`}
                </text>
              </g>
            )}
          </svg>
        </div>

        <aside
          aria-live="polite"
          className="flex flex-col justify-between border-t bg-background/70 p-5 xl:border-t-0 xl:border-l"
        >
          <div key={stage} className="motion-safe:animate-team-stage-card">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.16em]">
              {say`Step ${stage + 1} of ${LAST_STAGE + 1}`}
            </p>
            <h3 className="mt-3 font-semibold text-xl">{activeStage.title}</h3>
            <p className="mt-2 text-muted-foreground text-sm">
              {activeStage.description}
            </p>
            <code className="mt-4 block overflow-x-auto rounded-lg border bg-zinc-950 p-3 text-emerald-400 text-xs">
              $ {activeStage.command}
            </code>
            <p className="mt-4 flex items-center gap-2 font-medium text-sm">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                {activeStage.person.slice(0, 1)}
              </span>
              {activeStage.person}
            </p>
          </div>

          <div className="mt-6">
            <div className="flex gap-1.5" role="list">
              {stages.map((item, index) => (
                <button
                  aria-label={say`Show step ${index + 1}: ${item.title}`}
                  aria-current={index === stage ? 'step' : undefined}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index <= stage ? 'bg-primary' : 'bg-muted'
                  }`}
                  key={item.title}
                  onClick={() => {
                    setStage(index);
                    setPlaying(false);
                  }}
                  type="button"
                />
              ))}
            </div>
            <p className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
              <CheckCircle2Icon
                aria-hidden="true"
                className="size-4 text-primary"
              />
              {say`Each developer works independently; reviewed changes meet again on main.`}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
