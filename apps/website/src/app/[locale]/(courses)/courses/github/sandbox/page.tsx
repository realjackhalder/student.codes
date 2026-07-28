import { Say } from '@sayable/react';
import { GithubCourseLab } from '~/components/github-learning/course-lab';
import say from '~/i18n';
import { githubCourseRoutes } from '~/lib/github-learning/navigation';
import { generateBaseMetadata } from '../../../../metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/courses/github/sandbox'>) {
  const { locale } = await params;
  return generateBaseMetadata(
    say.activate(locale),
    githubCourseRoutes.sandbox,
    (say) => ({
      title: say`Git Practice Lab | student.codes`,
      description: say`Practice Git commands in a safe browser-based simulated repository.`,
    }),
  );
}

export default function GithubCourseSandboxPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">
          <Say>Practice lab</Say>
        </h1>
        <p className="mt-2 text-muted-foreground">
          <Say>
            Experiment freely. Reset the simulation whenever you want to start
            again.
          </Say>
        </p>
      </div>
      <GithubCourseLab />
    </div>
  );
}
