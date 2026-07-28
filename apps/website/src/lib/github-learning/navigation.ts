export const githubCourseRoutes = {
  overview: '/courses/github',
  lessons: '/courses/github/lessons',
  lesson: (lessonId: string) => `/courses/github/lessons/${lessonId}`,
  sandbox: '/courses/github/sandbox',
  repository: '/courses/github/repository',
} as const;
