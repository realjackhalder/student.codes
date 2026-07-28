import { Button } from '@evaluate/components/button';
import { Say } from '@sayable/react';
import { ArrowLeftIcon, ArrowRightIcon, TerminalIcon } from 'lucide-react';
import { notFound } from 'next/navigation';
import {
  EnvironmentPipeline,
  type PublishingEnvironment,
} from '~/components/github-learning/environment-pipeline';
import { GithubLessonContent } from '~/components/github-learning/lesson-content';
import { GithubLessonExercise } from '~/components/github-learning/lesson-exercise';
import { GithubLessonProgress } from '~/components/github-learning/lesson-progress';
import { LocalisedLink } from '~/components/localised-link';
import say from '~/i18n';
import {
  getGithubCourse,
  getGithubLessons,
} from '~/lib/github-learning/lessons';
import { githubCourseRoutes } from '~/lib/github-learning/navigation';
import { generateBaseMetadata } from '../../../../../metadata';

const publishingEnvironmentByLesson: Record<
  string,
  PublishingEnvironment | undefined
> = {
  'development-environment': 'dev',
  'uat-environment': 'uat',
  'production-environment': 'prod',
  'promote-between-environments': 'dev',
};

export async function generateStaticParams() {
  await say.load('en');
  say.activate('en');
  return getGithubLessons(getGithubCourse(say)).map((lesson) => ({
    lesson: lesson.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/courses/github/lessons/[lesson]'>) {
  const { locale } = await params;
  return generateBaseMetadata(
    say.activate(locale),
    githubCourseRoutes.lessons,
    (say) => ({
      title: say`Git & GitHub Lesson | student.codes`,
      description: say`Learn Git and GitHub with a visual, browser-based course.`,
    }),
  );
}

export default async function GithubLessonPage({
  params,
}: PageProps<'/[locale]/courses/github/lessons/[lesson]'>) {
  const { locale, lesson: lessonId } = await params;
  await say.load(locale);
  say.activate(locale);
  const lessons = getGithubLessons(getGithubCourse(say));
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) notFound();

  const lesson = lessons[index];
  if (!lesson) notFound();
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  const publishingEnvironment = publishingEnvironmentByLesson[lesson.id];

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-10">
      <LocalisedLink
        className="inline-flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground"
        href={githubCourseRoutes.lessons}
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        <Say>All lessons</Say>
      </LocalisedLink>

      <GithubLessonContent lesson={lesson} />

      {publishingEnvironment && (
        <EnvironmentPipeline
          initialEnvironment={publishingEnvironment}
          key={lesson.id}
        />
      )}

      <GithubLessonProgress
        lessonId={lesson.id}
        requiresExercise={lesson.exercises.length > 0}
      />

      {lesson.exercises.map((exercise) => (
        <GithubLessonExercise exercise={exercise} key={exercise.id} />
      ))}

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        {previous && (
          <Button asChild variant="outline">
            <LocalisedLink href={githubCourseRoutes.lesson(previous.id)}>
              <ArrowLeftIcon aria-hidden="true" />
              {previous.title}
            </LocalisedLink>
          </Button>
        )}
        {next ? (
          <Button asChild className="ml-auto">
            <LocalisedLink href={githubCourseRoutes.lesson(next.id)}>
              {next.title}
              <ArrowRightIcon aria-hidden="true" />
            </LocalisedLink>
          </Button>
        ) : (
          <Button asChild className="ml-auto">
            <LocalisedLink href={githubCourseRoutes.sandbox}>
              <TerminalIcon aria-hidden="true" />
              <Say>Open practice lab</Say>
            </LocalisedLink>
          </Button>
        )}
      </div>
    </div>
  );
}
