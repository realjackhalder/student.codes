'use client';

import { Button } from '@evaluate/components/button';
import { Say } from '@sayable/react';
import { CheckCircle2Icon, CircleIcon } from 'lucide-react';
import { useGithubCourseProgress } from '~/hooks/github-course-progress';
import {
  type GithubLessonId,
  isGithubLessonId,
} from '~/lib/github-learning/curriculum';

export function GithubLessonProgress({
  lessonId,
  requiresExercise,
}: {
  lessonId: string;
  requiresExercise: boolean;
}) {
  const { progress, completeLesson } = useGithubCourseProgress();
  if (!isGithubLessonId(lessonId)) return null;

  const complete = Boolean(progress.completedLessons[lessonId]);
  return (
    <section className="flex max-w-3xl flex-wrap items-center gap-3 rounded-xl border p-4">
      {complete ? (
        <>
          <CheckCircle2Icon
            aria-hidden="true"
            className="size-5 text-primary"
          />
          <p className="font-medium text-primary">
            <Say>Lesson completed</Say>
          </p>
        </>
      ) : (
        <>
          <CircleIcon
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
          <p className="mr-auto text-muted-foreground text-sm">
            {requiresExercise ? (
              <Say>Complete the exercise to finish this lesson.</Say>
            ) : (
              <Say>Finished reading this lesson?</Say>
            )}
          </p>
          {!requiresExercise && (
            <Button
              onClick={() => completeLesson(lessonId as GithubLessonId)}
              size="sm"
            >
              <Say>Mark lesson complete</Say>
            </Button>
          )}
        </>
      )}
    </section>
  );
}
