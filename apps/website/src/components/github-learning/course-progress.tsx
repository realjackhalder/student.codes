'use client';

import { Say, useSay } from '@sayable/react';
import {
  AwardIcon,
  CheckCircle2Icon,
  CircleIcon,
  GitBranchIcon,
  GraduationCapIcon,
  TrophyIcon,
} from 'lucide-react';
import { useGithubCourseProgress } from '~/hooks/github-course-progress';
import type {
  GithubAchievementId,
  GithubCourseProgress,
} from '~/lib/github-learning/progress';
import { getGithubCourseCompletion } from '~/lib/github-learning/progress';

const achievementIcons = {
  'first-lesson': GraduationCapIcon,
  'first-exercise': CheckCircle2Icon,
  'branch-builder': GitBranchIcon,
  'course-complete': TrophyIcon,
} satisfies Record<GithubAchievementId, typeof AwardIcon>;

const achievementIds = Object.keys(achievementIcons) as GithubAchievementId[];

function Achievement({
  id,
  progress,
}: {
  id: GithubAchievementId;
  progress: GithubCourseProgress;
}) {
  const say = useSay();
  const unlocked = Boolean(progress.achievements[id]);
  const Icon = achievementIcons[id];
  const copy = {
    'first-lesson': {
      title: say`First lesson`,
      description: say`Complete your first Git lesson.`,
    },
    'first-exercise': {
      title: say`Hands on`,
      description: say`Complete your first simulated exercise.`,
    },
    'branch-builder': {
      title: say`Branch builder`,
      description: say`Create and switch to feature branches.`,
    },
    'course-complete': {
      title: say`Git graduate`,
      description: say`Complete all twenty-one course lessons.`,
    },
  }[id];

  return (
    <li
      className={`flex gap-3 rounded-lg border p-3 ${unlocked ? 'border-primary/40 bg-primary/5' : 'opacity-55'}`}
    >
      <Icon
        aria-hidden="true"
        className={`mt-0.5 size-5 shrink-0 ${unlocked ? 'text-primary' : 'text-muted-foreground'}`}
      />
      <div>
        <p className="font-medium text-sm">{copy.title}</p>
        <p className="text-muted-foreground text-xs">{copy.description}</p>
      </div>
    </li>
  );
}

export function GithubCourseProgressSummary() {
  const { progress } = useGithubCourseProgress();
  const completion = getGithubCourseCompletion(progress);

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-medium text-primary text-sm">
            <Say>Your progress</Say>
          </p>
          <h2 className="font-semibold text-xl">
            {completion.completed} <Say>of</Say> {completion.total}{' '}
            <Say>lessons complete</Say>
          </h2>
        </div>
        <span className="font-semibold text-primary">
          {completion.percentage}%
        </span>
      </div>
      <div
        aria-label={`${completion.percentage}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={completion.percentage}
        className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${completion.percentage}%` }}
        />
      </div>

      <h3 className="mt-6 font-medium">
        <AwardIcon
          aria-hidden="true"
          className="mr-2 inline size-5 text-primary"
        />
        <Say>Achievements</Say>
      </h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {achievementIds.map((id) => (
          <Achievement id={id} key={id} progress={progress} />
        ))}
      </ul>
    </section>
  );
}

export function GithubLessonCompletionIndicator({
  lessonId,
}: {
  lessonId: string;
}) {
  const say = useSay();
  const { progress } = useGithubCourseProgress();
  const complete = Boolean(progress.completedLessons[lessonId]);
  const Icon = complete ? CheckCircle2Icon : CircleIcon;

  return (
    <Icon
      aria-label={complete ? say`Completed` : say`Not completed`}
      className={`mt-0.5 size-5 shrink-0 ${complete ? 'text-primary' : 'text-muted-foreground'}`}
    />
  );
}
