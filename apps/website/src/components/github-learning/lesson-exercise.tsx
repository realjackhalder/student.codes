'use client';

import { Say, useSay } from '@sayable/react';
import {
  CheckCircle2Icon,
  CircleIcon,
  LightbulbIcon,
  TrophyIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGithubCourseProgress } from '~/hooks/github-course-progress';
import {
  evaluateRepositoryAssertions,
  type RepositoryAssertionResult,
} from '~/lib/github-learning/assertions';
import { isGithubExerciseId } from '~/lib/github-learning/curriculum';
import type {
  CourseExercise,
  GitRepositoryState,
  RepositoryAssertion,
} from '~/lib/github-learning/schemas';
import { CommandLearningPanel } from './command-learning-panel';

const getSuggestedCommands = (exercise: CourseExercise) => {
  const commands = new Set<string>(['git status']);

  for (const assertion of exercise.successAssertions)
    switch (assertion.type) {
      case 'file-status':
        if (
          assertion.status === 'staged' &&
          !exercise.initialRepository.stagingArea[assertion.path]
        )
          commands.add(`git add ${assertion.path}`);
        break;
      case 'commit-count':
        if (
          Object.keys(exercise.initialRepository.commits).length !==
          assertion.count
        ) {
          for (const path of Object.keys(
            exercise.initialRepository.workingTree,
          ))
            commands.add(`git add ${path}`);
          commands.add('git commit -m "Complete exercise"');
        }
        break;
      case 'branch-exists':
        if (
          !exercise.initialRepository.branches[assertion.branch] &&
          !exercise.successAssertions.some(
            (candidate) =>
              candidate.type === 'current-branch' &&
              candidate.branch === assertion.branch,
          )
        )
          commands.add(`git branch ${assertion.branch}`);
        else if (
          assertion.target &&
          exercise.initialRepository.branches[assertion.branch]?.target !==
            assertion.target
        ) {
          const matchingRemote = Object.values(
            exercise.initialRepository.remotes,
          ).find(
            (remote) => remote.branches[assertion.branch] === assertion.target,
          );
          if (matchingRemote)
            commands.add(`git pull ${matchingRemote.name} ${assertion.branch}`);
        }
        break;
      case 'current-branch':
        if (
          exercise.initialRepository.head.type !== 'branch' ||
          exercise.initialRepository.head.branch !== assertion.branch
        )
          commands.add(
            exercise.initialRepository.branches[assertion.branch]
              ? `git switch ${assertion.branch}`
              : `git switch -c ${assertion.branch}`,
          );
        break;
      case 'remote-branch-exists':
        if (
          !exercise.initialRepository.remotes[assertion.remote]?.branches[
            assertion.branch
          ]
        )
          commands.add(`git push -u ${assertion.remote} ${assertion.branch}`);
        break;
      case 'working-tree-clean':
      case 'staging-area-empty':
        break;
    }

  return [...commands];
};

export function GithubLessonExercise({
  exercise,
}: {
  exercise: CourseExercise;
}) {
  const say = useSay();
  const { completeExercise } = useGithubCourseProgress();
  const [results, setResults] = useState<RepositoryAssertionResult[]>(() =>
    evaluateRepositoryAssertions(
      exercise.initialRepository,
      exercise.successAssertions,
    ),
  );
  const complete = results.every((result) => result.passed);
  const suggestedCommands = useMemo(
    () => getSuggestedCommands(exercise),
    [exercise],
  );
  const updateResults = useCallback(
    (repository: GitRepositoryState) =>
      setResults(
        evaluateRepositoryAssertions(repository, exercise.successAssertions),
      ),
    [exercise.successAssertions],
  );

  useEffect(() => {
    if (complete && isGithubExerciseId(exercise.id))
      completeExercise(exercise.id);
  }, [complete, completeExercise, exercise.id]);

  const describeAssertion = (assertion: RepositoryAssertion) => {
    switch (assertion.type) {
      case 'current-branch':
        return say`Current branch is ${assertion.branch}`;
      case 'branch-exists':
        return say`Branch ${assertion.branch} exists`;
      case 'commit-count':
        return say`Repository has ${assertion.count} commits`;
      case 'working-tree-clean':
        return say`Working tree is clean`;
      case 'staging-area-empty':
        return say`Staging area is empty`;
      case 'remote-branch-exists':
        return say`Remote branch ${assertion.remote}/${assertion.branch} exists`;
      case 'file-status':
        return say`${assertion.path} is ${assertion.status}`;
    }
  };

  return (
    <section className="space-y-6 border-t pt-8">
      <div>
        <p className="font-medium text-primary text-sm">
          <Say>Interactive exercise</Say>
        </p>
        <h2 className="mt-1 font-semibold text-2xl">{exercise.title}</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted-foreground">
          {exercise.instructions.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border p-4">
        <h3 className="font-medium">
          <Say>Success checklist</Say>
        </h3>
        <ul className="mt-3 space-y-2">
          {results.map((result, index) => (
            <li
              className="flex items-center gap-2 text-sm"
              key={`${result.assertion.type}-${index}`}
            >
              {result.passed ? (
                <CheckCircle2Icon
                  aria-label={say`Passed`}
                  className="size-5 text-primary"
                />
              ) : (
                <CircleIcon
                  aria-label={say`Not complete`}
                  className="size-5 text-muted-foreground"
                />
              )}
              {describeAssertion(result.assertion)}
            </li>
          ))}
        </ul>
        {complete && (
          <p
            className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 p-3 font-medium text-primary"
            role="status"
          >
            <TrophyIcon aria-hidden="true" className="size-5" />
            <Say>Exercise complete</Say>
          </p>
        )}
      </div>

      {exercise.hints.length > 0 && (
        <details className="rounded-xl border p-4">
          <summary className="flex cursor-pointer items-center gap-2 font-medium">
            <LightbulbIcon aria-hidden="true" className="size-4 text-primary" />
            <Say>Show hints</Say>
          </summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground text-sm">
            {exercise.hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </details>
      )}

      <CommandLearningPanel
        graphLabels={{
          graph: say`Exercise repository history`,
          head: 'HEAD',
          commit: say`commit`,
          authoredBy: say`Authored by`,
        }}
        initialRepository={exercise.initialRepository}
        labels={{
          title: say`Exercise terminal`,
          description: say`Commands run only in this browser-based simulated repository.`,
          commandInput: say`Git command`,
          commandPlaceholder: 'git status',
          runCommand: say`Run command`,
          reset: say`Reset exercise`,
          suggestions: say`Suggested commands`,
          history: say`Command history`,
          emptyHistory: say`Run a command to begin the exercise.`,
          feedback: say`Try another command`,
          replay: say`Replay command`,
          previousCommand: say`Previous`,
          nextCommand: say`Next`,
          step: say`Step`,
          goToStep: say`Go to step`,
          before: say`Before`,
          after: say`After`,
          currentHead: say`Current HEAD`,
          commits: say`Commits`,
          branches: say`Branches`,
          stagedFiles: say`Staged files`,
          workingChanges: say`Working changes`,
          remoteBranches: say`Remote branches`,
          noRepositoryChange: say`No repository state change`,
        }}
        onRepositoryChange={updateResults}
        suggestedCommands={suggestedCommands}
      />
    </section>
  );
}
