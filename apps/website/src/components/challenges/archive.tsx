'use client';

import { Button } from '@evaluate/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@evaluate/components/card';
import { Say } from '@sayable/react';
import { CheckCircle2Icon } from 'lucide-react';
import { LocalisedLink } from '~/components/localised-link';
import { useChallengeProgress } from '~/hooks/challenge-progress';
import { challenges } from '~/lib/challenges';

export function ChallengeArchive() {
  const { progress } = useChallengeProgress();
  return (
    <div className="container space-y-6 py-10">
      <div>
        <h1 className="font-bold text-3xl text-primary">
          <Say>Challenge archive</Say>
        </h1>
        <p className="mt-2 text-muted-foreground">
          <Say>Browse practical JavaScript and Python challenges.</Say>
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {challenges.map((challenge) => {
          const completed = progress.completed[challenge.id];
          return (
            <Card key={challenge.id} className="gap-4">
              <CardHeader>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle>{challenge.title}</CardTitle>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {challenge.runtimeId} · {challenge.difficulty}
                    </p>
                  </div>
                  {completed && (
                    <CheckCircle2Icon
                      className="size-5 text-primary"
                      aria-label="Completed"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  {challenge.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <LocalisedLink
                    href={`/playgrounds/${challenge.runtimeId}?challenge=${challenge.id}`}
                  >
                    <Say>Open challenge</Say>
                  </LocalisedLink>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
