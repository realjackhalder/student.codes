'use client';

import { Button } from '@evaluate/components/button';
import { Say } from '@sayable/react';
import {
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  XCircleIcon,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { Runtime } from 'piston.ts';
import { useState } from 'react';
import type { File } from 'virtual-file-explorer-backend';
import { useExplorer } from '~/components/explorer/use';
import { useChallengeProgress } from '~/hooks/challenge-progress';
import { getChallenge } from '~/lib/challenges';
import piston from '~/services/piston';

type CheckResult = { passed: boolean; output: string };

function normaliseOutput(value: string) {
  return value.replaceAll('\r\n', '\n').trim();
}

export function ChallengeChecks({
  runtime,
}: {
  runtime: typeof Runtime._output;
}) {
  const explorer = useExplorer();
  const challenge = getChallenge(useSearchParams().get('challenge'));
  const [results, setResults] = useState<CheckResult[]>();
  const [isRunning, setIsRunning] = useState(false);
  const { markComplete } = useChallengeProgress();

  if (!challenge || challenge.runtimeId !== runtime.id) return null;
  const activeChallenge = challenge;

  async function runChecks() {
    const files = explorer.descendants.filter(
      (item): item is File => item.type === 'file',
    );
    const entry = files.find((file) => Reflect.get(file, 'entry'))?.path;
    if (!entry) return;

    const projectFiles = Object.fromEntries(
      files.map((file) => [file.path, file.content]),
    );
    setIsRunning(true);
    setResults(undefined);
    try {
      const next = [];
      for (const check of activeChallenge.checks) {
        const result = await piston.execute(runtime, {
          files: { ...projectFiles, '::input::': check.stdin },
          entry,
        });
        next.push({
          passed:
            result.success &&
            normaliseOutput(result.run.output) ===
              normaliseOutput(check.expectedOutput),
          output: result.output ?? '',
        });
      }
      setResults(next);
      if (next.every((result) => result.passed))
        markComplete(activeChallenge.id);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-medium">
            <Say>Challenge checks</Say>
          </h2>
          <p className="text-muted-foreground text-sm">
            <Say>Run your current code against the challenge cases.</Say>
          </p>
        </div>
        <Button onClick={runChecks} disabled={isRunning}>
          {isRunning && <Loader2Icon className="size-4 animate-spin" />}
          <Say>Run checks</Say>
        </Button>
      </div>
      <ul className="mt-5 space-y-2">
        {activeChallenge.checks.map((check, index) => {
          const result = results?.[index];
          return (
            <li key={check.name} className="rounded-lg border p-3">
              <div className="flex items-center gap-2 font-medium text-sm">
                {!result ? (
                  <CircleIcon className="size-4 text-muted-foreground" />
                ) : result.passed ? (
                  <CheckCircle2Icon className="size-4 text-primary" />
                ) : (
                  <XCircleIcon className="size-4 text-destructive" />
                )}
                {check.name}
                {result && (
                  <span className="ml-auto text-muted-foreground">
                    {result.passed ? <Say>Passed</Say> : <Say>Try again</Say>}
                  </span>
                )}
              </div>
              {result && !result.passed && (
                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                  {result.output || <Say>No output</Say>}
                </pre>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
