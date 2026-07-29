import { Button } from '@evaluate/components/button';
import { Say } from '@sayable/react';
import {
  ArrowRightIcon,
  BotIcon,
  Code2Icon,
  PuzzleIcon,
  SparklesIcon,
} from 'lucide-react';
import Link from 'next/link';
import say from '~/i18n';
import { generateBaseMetadata } from './metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  return generateBaseMetadata(say.activate(locale), '/');
}

export default function HomePage() {
  return (
    <div className="container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-10 py-12 text-center">
      {/* Coming Soon Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm">
        <SparklesIcon className="size-3.5 animate-pulse" />
        <Say>student.codes Platform</Say>
        <span className="rounded-full bg-primary px-2 py-0.5 font-bold text-[10px] text-primary-foreground">
          <Say>Coming Soon</Say>
        </span>
      </div>

      {/* Hero Title */}
      <div className="max-w-3xl space-y-4">
        <h1 className="font-bold text-4xl tracking-tight sm:text-6xl md:text-7xl">
          <Say>The Next-Gen</Say>{' '}
          <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-300 bg-clip-text text-transparent">
            <Say>Code Sandbox</Say>
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-balance text-muted-foreground text-base sm:text-lg">
          <Say>
            We are working hard to bring you the ultimate online platform for
            testing, sharing, and running code snippets across 70+ programming
            languages.
          </Say>
        </p>
      </div>

      {/* Product Cards */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/playgrounds"
          className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-6 text-card-foreground transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Code2Icon className="size-6" />
          </div>
          <h3 className="font-bold text-lg">
            <Say>Playgrounds</Say>
          </h3>
          <p className="text-balance text-muted-foreground text-xs">
            <Say>
              Explore interactive code environments directly in your browser.
            </Say>
          </p>
          <span className="mt-auto flex items-center gap-1 font-semibold text-primary text-xs group-hover:underline">
            <Say>Explore Playgrounds</Say>
            <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/products/browser-extension"
          className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-6 text-card-foreground transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <PuzzleIcon className="size-6" />
          </div>
          <h3 className="font-bold text-lg">
            <Say>Browser Extension</Say>
          </h3>
          <p className="text-balance text-muted-foreground text-xs">
            <Say>
              Execute code snippets instantly while browsing Chrome or Firefox.
            </Say>
          </p>
          <span className="mt-auto flex items-center gap-1 font-semibold text-primary text-xs group-hover:underline">
            <Say>Get Extension</Say>
            <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/products/discord-bot"
          className="group relative flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-6 text-card-foreground transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <BotIcon className="size-6" />
          </div>
          <h3 className="font-bold text-lg">
            <Say>Discord Bot</Say>
          </h3>
          <p className="text-balance text-muted-foreground text-xs">
            <Say>
              Run code snippets directly in your Discord servers with friends.
            </Say>
          </p>
          <span className="mt-auto flex items-center gap-1 font-semibold text-primary text-xs group-hover:underline">
            <Say>Add Discord Bot</Say>
            <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>

      {/* Primary Action Button */}
      <div className="flex items-center justify-center gap-4">
        <Button
          size="lg"
          className="gap-2 rounded-full font-semibold shadow-lg shadow-primary/20"
          asChild
        >
          <Link href="/playgrounds">
            <Say>Try Playgrounds Now</Say>
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
