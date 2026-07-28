import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@evaluate/components/card';
import { Say } from '@sayable/react';
import { ArrowRightIcon } from 'lucide-react';
import {
  GithubCourseProgressSummary,
  GithubLessonCompletionIndicator,
} from '~/components/github-learning/course-progress';
import { LocalisedLink } from '~/components/localised-link';
import say from '~/i18n';
import { getGithubCourse } from '~/lib/github-learning/lessons';
import { githubCourseRoutes } from '~/lib/github-learning/navigation';
import { generateBaseMetadata } from '../../../../metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/courses/github/lessons'>) {
  const { locale } = await params;
  return generateBaseMetadata(
    say.activate(locale),
    githubCourseRoutes.lessons,
    (say) => ({
      title: say`Git & GitHub Lessons | student.codes`,
      description: say`Follow twenty-one visual lessons covering Git fundamentals, parallel branches, publishing environments, and GitHub collaboration.`,
    }),
  );
}

export default async function GithubLessonsPage({
  params,
}: PageProps<'/[locale]/courses/github/lessons'>) {
  const { locale } = await params;
  await say.load(locale);
  say.activate(locale);
  const course = getGithubCourse(say);

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="font-bold text-3xl tracking-tight">
          <Say>Course lessons</Say>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {course.description}
        </p>
      </header>

      <GithubCourseProgressSummary />

      <div className="space-y-8">
        {course.modules.map((module, moduleIndex) => (
          <section key={module.id}>
            <div className="mb-3">
              <p className="font-medium text-primary text-sm">
                <Say>Module</Say> {moduleIndex + 1}
              </p>
              <h2 className="font-semibold text-xl">{module.title}</h2>
              <p className="text-muted-foreground text-sm">
                {module.description}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {module.lessons.map((lesson) => (
                <LocalisedLink
                  className="group"
                  href={githubCourseRoutes.lesson(lesson.id)}
                  key={lesson.id}
                >
                  <Card className="h-full gap-3 transition-colors group-hover:border-primary/60">
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between gap-3">
                        {lesson.title}
                        <span className="flex items-center gap-2">
                          <GithubLessonCompletionIndicator
                            lessonId={lesson.id}
                          />
                          <ArrowRightIcon
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        {lesson.objective}
                      </p>
                      <p className="mt-3 font-medium text-primary text-xs">
                        {lesson.estimatedMinutes} <Say>minutes</Say>
                      </p>
                    </CardContent>
                  </Card>
                </LocalisedLink>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
