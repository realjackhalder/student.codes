import { Button } from '@evaluate/components/button';
import { Say } from '@sayable/react';
import { ArrowRightIcon, GitBranchIcon } from 'lucide-react';
import { DailyChallenge } from '~/components/challenges/daily-challenge';
import { LocalisedLink } from '~/components/localised-link';
import say from '~/i18n';
import { githubCourseRoutes } from '~/lib/github-learning/navigation';
import piston from '~/services/piston';
import { generateBaseMetadata } from '../../metadata';
import { PlaygroundCardList } from './playground-card-list';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/playgrounds'>) {
  const { locale } = await params;
  return generateBaseMetadata(say.activate(locale), '/playgrounds');
}

export default async function PlaygroundsPage() {
  const runtimes = await piston.runtimes();

  return (
    <div className="container flex flex-col gap-6 py-6">
      <div className="space-y-6 py-24 text-center">
        <h1 className="font-bold text-3xl text-primary tracking-tight md:text-5xl">
          <Say>Playgrounds</Say>
        </h1>
        <p className="text-balance text-sm md:text-base">
          <Say>
            Explore and run code in different programming languages and
            runtimes.
          </Say>
          <br />
          <span className="opacity-70">
            <Say>
              Powered by the{' '}
              <a
                href="https://github.com/engineer-man/piston"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-primary transition-colors"
              >
                Piston
              </a>{' '}
              execution engine.
            </Say>
          </span>
        </p>
      </div>

      <DailyChallenge compact />

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-6 sm:flex-row sm:items-center">
        <GitBranchIcon
          aria-hidden="true"
          className="size-9 shrink-0 text-primary"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-xl">
            <Say>Learn Git visually</Say>
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            <Say>
              Practice branches and commands safely in an interactive simulated
              repository.
            </Say>
          </p>
        </div>
        <Button asChild>
          <LocalisedLink href={githubCourseRoutes.overview}>
            <Say>Explore course</Say>
            <ArrowRightIcon aria-hidden="true" />
          </LocalisedLink>
        </Button>
      </section>

      <PlaygroundCardList initialRuntimes={runtimes} />
    </div>
  );
}
