export {
  evaluateRepositoryAssertion,
  evaluateRepositoryAssertions,
  type RepositoryAssertionResult,
} from './assertions';
export {
  type CommandHistoryEntry,
  createGitCommandSession,
  type GitCommandSession,
  resetGitCommandSession,
  runGitCommand,
} from './command-session';
export {
  GITHUB_EXERCISE_LESSONS,
  GITHUB_LESSON_IDS,
  type GithubExerciseId,
  type GithubLessonId,
  isGithubExerciseId,
  isGithubLessonId,
} from './curriculum';
export {
  courseGitRepository,
  initialGitRepository,
  parallelGitRepository,
} from './fixtures';
export {
  buildGitGraphLayout,
  type GitGraphEdge,
  type GitGraphLayout,
  type GitGraphNode,
} from './graph-layout';
export { getGithubCourse, getGithubLessons } from './lessons';
export { githubCourseRoutes } from './navigation';
export {
  completeGithubExercise,
  completeGithubLesson,
  emptyGithubCourseProgress,
  GITHUB_PROGRESS_STORAGE_KEY,
  type GithubAchievementId,
  type GithubCourseProgress,
  getGithubCourseCompletion,
  githubAchievementIdSchema,
  githubCourseProgressSchema,
  parseGithubCourseProgress,
} from './progress';
export {
  adaptGithubSnapshotToRepository,
  type GithubRepositoryReference,
  type GithubRepositorySnapshot,
  githubBranchSchema,
  githubCommitSchema,
  githubRepositoryReferenceSchema,
  githubRepositorySchema,
  githubRepositorySnapshotSchema,
  parseGithubRepositoryReference,
} from './repository-bridge';
export {
  type Course,
  type CourseContentBlock,
  type CourseExercise,
  type CourseLesson,
  type CourseModule,
  courseContentBlockSchema,
  courseExerciseSchema,
  courseLessonSchema,
  courseModuleSchema,
  courseSchema,
  type GitBranch,
  type GitCommit,
  type GitHead,
  type GitRemote,
  type GitRepositoryState,
  type GitStagedFile,
  type GitWorkingFile,
  gitBranchSchema,
  gitCommitSchema,
  gitHeadSchema,
  gitRemoteSchema,
  gitRepositoryStateSchema,
  gitStagedFileSchema,
  gitWorkingFileSchema,
  type RepositoryAssertion,
  repositoryAssertionSchema,
} from './schemas';
export {
  GitSimulator,
  type GitSimulatorErrorCode,
  type GitSimulatorResult,
} from './simulator';
