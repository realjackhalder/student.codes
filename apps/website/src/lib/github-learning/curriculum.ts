export const GITHUB_LESSON_IDS = [
  'how-git-thinks',
  'inspect-your-work',
  'stage-changes',
  'create-commits',
  'read-history',
  'create-branches',
  'switch-branches',
  'understand-remotes',
  'share-branches',
  'submit-code-github',
  'pull-requests',
  'review-and-merge',
  'safe-daily-workflow',
  'parallel-branch-history',
  'continue-feature-branch',
  'continue-hotfix-branch',
  'publish-team-branches',
  'development-environment',
  'uat-environment',
  'production-environment',
  'promote-between-environments',
] as const;

export type GithubLessonId = (typeof GITHUB_LESSON_IDS)[number];

export const isGithubLessonId = (value: string): value is GithubLessonId =>
  GITHUB_LESSON_IDS.includes(value as GithubLessonId);

export const GITHUB_EXERCISE_LESSONS = {
  'stage-notes': 'stage-changes',
  'commit-notes': 'create-commits',
  'create-feature-branch': 'create-branches',
  'switch-to-feature': 'switch-branches',
  'pull-latest-main': 'understand-remotes',
  'publish-feature': 'share-branches',
  'submit-branch-code': 'submit-code-github',
  'daily-work-branch': 'safe-daily-workflow',
  'inspect-parallel-branches': 'parallel-branch-history',
  'continue-profile-branch': 'continue-feature-branch',
  'continue-login-hotfix': 'continue-hotfix-branch',
  'publish-parallel-branches': 'publish-team-branches',
  'publish-environment-branches': 'promote-between-environments',
} as const satisfies Record<string, GithubLessonId>;

export type GithubExerciseId = keyof typeof GITHUB_EXERCISE_LESSONS;

export const isGithubExerciseId = (value: string): value is GithubExerciseId =>
  value in GITHUB_EXERCISE_LESSONS;
