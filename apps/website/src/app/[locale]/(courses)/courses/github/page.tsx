import { Button } from '@evaluate/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@evaluate/components/card';
import { Say } from '@sayable/react';
import {
  ArrowRightIcon,
  GitBranchIcon,
  ShieldCheckIcon,
  TerminalIcon,
} from 'lucide-react';
import { TeamBranchDiagram } from '~/components/github-learning/team-branch-diagram';
import { LocalisedLink } from '~/components/localised-link';
import say from '~/i18n';
import { githubCourseRoutes } from '~/lib/github-learning/navigation';
import { generateBaseMetadata } from '../../../metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/courses/github'>) {
  const { locale } = await params;
  return generateBaseMetadata(
    say.activate(locale),
    githubCourseRoutes.overview,
    (say) => ({
      title: say`Git & GitHub Course | student.codes`,
      description: say`Learn Git, GitHub, and safe publishing environments with visual branches and a simulated repository.`,
    }),
  );
}

const features = [
  {
    id: 'visual',
    icon: GitBranchIcon,
    title: <Say key="visual">Visual repository</Say>,
    description: (
      <Say key="visual-description">
        See commits, branches, HEAD, and remote references change as you learn.
      </Say>
    ),
  },
  {
    id: 'practice',
    icon: TerminalIcon,
    title: <Say key="practice">Safe command practice</Say>,
    description: (
      <Say key="practice-description">
        Run learning commands without touching files or repositories on your
        computer.
      </Say>
    ),
  },
  {
    id: 'local',
    icon: ShieldCheckIcon,
    title: <Say key="local">Local-first</Say>,
    description: (
      <Say key="local-description">
        Learn without an account, API key, backend, or GitHub access token.
      </Say>
    ),
  },
];

export default function GithubCoursePage() {
  return (
    <div className="space-y-10 pb-10">
      <section className="max-w-3xl space-y-5 py-8">
        <h1 className="text-balance font-bold text-4xl text-primary tracking-tight md:text-5xl">
          <Say>Learn Git without risking a real repository</Say>
        </h1>
        <p className="text-balance text-lg text-muted-foreground">
          <Say>
            Build confidence with a visual commit graph and an interactive
            command terminal that runs entirely in your browser.
          </Say>
        </p>
        <Button asChild size="lg">
          <LocalisedLink href={githubCourseRoutes.sandbox}>
            <Say>Open practice lab</Say>
            <ArrowRightIcon aria-hidden="true" />
          </LocalisedLink>
        </Button>
      </section>

      <TeamBranchDiagram />

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ id, icon: Icon, title, description }) => (
          <Card key={id} className="gap-4">
            <CardHeader>
              <Icon aria-hidden="true" className="size-6 text-primary" />
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-dashed p-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h2 className="font-semibold text-xl">
            <Say>21 guided lessons</Say>
          </h2>
          <p className="mt-2 text-muted-foreground">
            <Say>
              Follow the full path from your first Git snapshot through team
              collaboration and safe publishing environments.
            </Say>
          </p>
        </div>
        <Button asChild variant="outline">
          <LocalisedLink href={githubCourseRoutes.lessons}>
            <Say>Browse lessons</Say>
            <ArrowRightIcon aria-hidden="true" />
          </LocalisedLink>
        </Button>
      </section>
    </div>
  );
}
