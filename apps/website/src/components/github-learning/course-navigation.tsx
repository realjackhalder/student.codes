'use client';

import { Button } from '@evaluate/components/button';
import { Say, useSay } from '@sayable/react';
import { BookOpenIcon, GithubIcon, ListIcon, TerminalIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { LocalisedLink } from '~/components/localised-link';
import { githubCourseRoutes } from '~/lib/github-learning/navigation';

const links = [
  {
    href: githubCourseRoutes.overview,
    icon: BookOpenIcon,
    label: <Say key="overview">Overview</Say>,
  },
  {
    href: githubCourseRoutes.lessons,
    icon: ListIcon,
    label: <Say key="lessons">Lessons</Say>,
  },
  {
    href: githubCourseRoutes.sandbox,
    icon: TerminalIcon,
    label: <Say key="practice">Practice lab</Say>,
  },
  {
    href: githubCourseRoutes.repository,
    icon: GithubIcon,
    label: <Say key="repository">Repository viewer</Say>,
  },
];

export function GithubCourseNavigation() {
  const pathname = usePathname();
  const say = useSay();

  return (
    <nav
      aria-label={say`GitHub Learning Course`}
      className="flex flex-wrap gap-2"
    >
      {links.map(({ href, icon: Icon, label }) => {
        const current =
          href === githubCourseRoutes.overview
            ? pathname.endsWith(href)
            : pathname.includes(href);

        return (
          <Button
            asChild
            key={href}
            size="sm"
            variant={current ? 'secondary' : 'ghost'}
          >
            <LocalisedLink
              aria-current={current ? 'page' : undefined}
              href={href}
            >
              <Icon aria-hidden="true" />
              {label}
            </LocalisedLink>
          </Button>
        );
      })}
    </nav>
  );
}
