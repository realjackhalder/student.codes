import { Say } from '@sayable/react';
import { GithubRepositoryBridge } from '~/components/github-learning/repository-bridge';
import say from '~/i18n';
import { githubCourseRoutes } from '~/lib/github-learning/navigation';
import { generateBaseMetadata } from '../../../../metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateBaseMetadata(
    say.activate(locale),
    githubCourseRoutes.repository,
    (say) => ({
      title: say`Repository Viewer | Git & GitHub Course`,
      description: say`Explore the recent commit graph of a public GitHub repository in a safe, read-only viewer.`,
    }),
  );
}

export default function GithubRepositoryPage() {
  return (
    <div className="space-y-8 pb-10">
      <header className="max-w-3xl space-y-3 py-4">
        <p className="font-medium text-primary text-sm">
          <Say>Optional real-repository bridge</Say>
        </p>
        <h1 className="text-balance font-bold text-3xl tracking-tight md:text-4xl">
          <Say>Explore a public GitHub repository</Say>
        </h1>
        <p className="text-muted-foreground">
          <Say>
            Connect the visual concepts from the course to recent history from a
            real public project, without granting write access.
          </Say>
        </p>
      </header>
      <GithubRepositoryBridge />
    </div>
  );
}
