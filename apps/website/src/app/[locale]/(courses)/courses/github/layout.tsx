import { Say } from '@sayable/react';
import { GithubCourseNavigation } from '~/components/github-learning/course-navigation';

export default function GithubCourseLayout({
  children,
}: LayoutProps<'/[locale]/courses/github'>) {
  return (
    <div className="container space-y-8 py-8">
      <header className="flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-medium text-primary text-sm">
            <Say>Interactive course</Say>
          </p>
          <p className="font-bold text-2xl tracking-tight">
            <Say>Git &amp; GitHub</Say>
          </p>
        </div>
        <GithubCourseNavigation />
      </header>
      {children}
    </div>
  );
}
