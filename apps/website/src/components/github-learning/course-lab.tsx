'use client';

import { useSay } from '@sayable/react';
import { courseGitRepository } from '~/lib/github-learning';
import { CommandLearningPanel } from './command-learning-panel';

export function GithubCourseLab() {
  const say = useSay();

  return (
    <CommandLearningPanel
      graphLabels={{
        graph: say`Commit history`,
        head: 'HEAD',
        commit: say`commit`,
        authoredBy: say`Authored by`,
      }}
      initialRepository={courseGitRepository}
      labels={{
        title: say`Git practice terminal`,
        description: say`Practice Git commands safely. Everything here stays inside a simulated repository in your browser.`,
        commandInput: say`Git command`,
        commandPlaceholder: 'git status',
        runCommand: say`Run command`,
        reset: say`Reset`,
        suggestions: say`Try a command`,
        history: say`Command history`,
        emptyHistory: say`Run a command to begin.`,
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
      suggestedCommands={[
        'git status',
        'git log',
        'git switch -c feature',
        'git branch',
      ]}
    />
  );
}
