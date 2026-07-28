import { Say } from '@sayable/react';
import { InfoIcon, LightbulbIcon, TriangleAlertIcon } from 'lucide-react';
import type { CourseLesson } from '~/lib/github-learning/schemas';

const calloutStyles = {
  information: {
    icon: InfoIcon,
    className: 'border-blue-500/40 bg-blue-500/5',
  },
  tip: {
    icon: LightbulbIcon,
    className: 'border-primary/40 bg-primary/5',
  },
  warning: {
    icon: TriangleAlertIcon,
    className: 'border-amber-500/40 bg-amber-500/5',
  },
};

export function GithubLessonContent({ lesson }: { lesson: CourseLesson }) {
  return (
    <article className="max-w-3xl space-y-7">
      <header className="space-y-3">
        <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground text-xs">
          {lesson.estimatedMinutes}&nbsp;<Say>min</Say>
        </span>
        <h1 className="text-balance font-bold text-3xl text-primary tracking-tight md:text-4xl">
          {lesson.title}
        </h1>
        <p className="text-lg text-muted-foreground">{lesson.objective}</p>
      </header>

      <div className="space-y-5">
        {lesson.content.map((block, index) => {
          if (block.type === 'text')
            return (
              <p className="text-base leading-7" key={`${block.type}-${index}`}>
                {block.body}
              </p>
            );

          if (block.type === 'command')
            return (
              <div
                className="overflow-hidden rounded-xl border bg-zinc-950"
                key={`${block.type}-${index}`}
              >
                <pre className="overflow-x-auto p-4 text-emerald-400">
                  <code>$ {block.command}</code>
                </pre>
                <p className="border-zinc-800 border-t px-4 py-3 text-sm text-zinc-400">
                  {block.explanation}
                </p>
              </div>
            );

          const style = calloutStyles[block.tone];
          const Icon = style.icon;
          return (
            <aside
              className={`flex gap-3 rounded-xl border p-4 ${style.className}`}
              key={`${block.type}-${index}`}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p className="text-sm leading-6">{block.body}</p>
            </aside>
          );
        })}
      </div>
    </article>
  );
}
