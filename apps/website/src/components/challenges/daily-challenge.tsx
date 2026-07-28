'use client';

import { Button } from '@evaluate/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@evaluate/components/card';
import { Say, useSay } from '@sayable/react';
import { ArrowRightIcon, LightbulbIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LocalisedLink } from '~/components/localised-link';
import { useChallengeProgress } from '~/hooks/challenge-progress';
import { type Challenge, getDailyChallenge } from '~/lib/challenges';

export function DailyChallenge({ compact = false }: { compact?: boolean }) {
  const say = useSay();
  const [challenge, setChallenge] = useState<Challenge>();
  const { progress } = useChallengeProgress();

  useEffect(() => setChallenge(getDailyChallenge()), []);

  if (!challenge) return null;

  const destination = compact
    ? '/challenges'
    : `/playgrounds/${challenge.runtimeId}?challenge=${challenge.id}`;
  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-primary text-sm">
          <Say>Today&apos;s challenge</Say>
        </p>
        <CardTitle level={compact ? 3 : 1}>{challenge.title}</CardTitle>
        <p className="text-muted-foreground text-sm">{challenge.description}</p>
      </CardHeader>
      {!compact && (
        <CardContent className="space-y-5">
          <div>
            <h2 className="font-medium text-sm">
              <Say>Your task</Say>
            </h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground text-sm">
              {challenge.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="flex items-center gap-2 font-medium text-sm">
              <LightbulbIcon className="size-4 text-primary" />
              <Say>Hints</Say>
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground text-sm">
              {challenge.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
      <CardFooter>
        <div className="flex w-full flex-wrap gap-2">
          <Button asChild className="flex-1 sm:flex-none">
            <LocalisedLink href={destination}>
              {compact ? (
                <Say>View today&apos;s challenge</Say>
              ) : (
                say`Open playground`
              )}
              <ArrowRightIcon className="size-4" />
            </LocalisedLink>
          </Button>
          {!compact && (
            <Button asChild variant="secondary">
              <LocalisedLink href="/challenges/archive">
                <Say>Browse archive</Say>
              </LocalisedLink>
            </Button>
          )}
          {progress.completed[challenge.id] && (
            <span className="self-center text-primary text-sm">
              <Say>Completed</Say>
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
