'use client';

import { Button } from '@evaluate/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@evaluate/components/card';
import { Input } from '@evaluate/components/input';
import { useSay } from '@sayable/react';
import {
  ExternalLinkIcon,
  GitForkIcon,
  LoaderCircleIcon,
  LockKeyholeIcon,
  StarIcon,
} from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';
import {
  adaptGithubSnapshotToRepository,
  type GithubRepositorySnapshot,
  githubRepositorySnapshotSchema,
  parseGithubRepositoryReference,
} from '~/lib/github-learning';
import { CommitGraph } from './commit-graph';

type LoadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; snapshot: GithubRepositorySnapshot };

export function GithubRepositoryBridge() {
  const say = useSay();
  const repositoryInputId = useId();
  const [reference, setReference] = useState('facebook/react');
  const [state, setState] = useState<LoadState>({ status: 'idle' });

  const loadRepository = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedReference = parseGithubRepositoryReference(reference);
    if (!parsedReference) {
      setState({
        status: 'error',
        message: say`Enter a repository as owner/name or a github.com URL.`,
      });
      return;
    }

    setState({ status: 'loading' });
    try {
      const parameters = new URLSearchParams(parsedReference);
      const response = await fetch(`/api/github/repository?${parameters}`);
      const body: unknown = await response.json();
      if (!response.ok) {
        const errorCode =
          typeof body === 'object' &&
          body !== null &&
          'error' in body &&
          typeof body.error === 'string'
            ? body.error
            : 'unknown';
        const message =
          errorCode === 'not-found'
            ? say`Repository not found. Only public repositories can be loaded.`
            : errorCode === 'invalid-response'
              ? say`GitHub returned repository data in an unexpected format.`
              : errorCode === 'unavailable'
                ? say`GitHub could not be reached. Try again in a moment.`
                : say`The repository could not be loaded.`;
        setState({ status: 'error', message });
        return;
      }

      const snapshot = githubRepositorySnapshotSchema.safeParse(body);
      if (!snapshot.success) {
        setState({
          status: 'error',
          message: say`GitHub returned repository data in an unexpected format.`,
        });
        return;
      }
      setState({ status: 'loaded', snapshot: snapshot.data });
    } catch {
      setState({
        status: 'error',
        message: say`GitHub could not be reached. Try again in a moment.`,
      });
    }
  };

  const repository =
    state.status === 'loaded'
      ? adaptGithubSnapshotToRepository(state.snapshot)
      : undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <LockKeyholeIcon
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-primary"
            />
            <div className="space-y-1">
              <CardTitle>{say`Read-only repository viewer`}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {say`Load public repository metadata and recent commit history. This viewer cannot change the repository and never asks for a GitHub token.`}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={loadRepository}
          >
            <label className="flex-1 space-y-2" htmlFor={repositoryInputId}>
              <span className="font-medium text-sm">{say`Public repository`}</span>
              <Input
                autoCapitalize="none"
                autoComplete="off"
                id={repositoryInputId}
                onChange={(event) => setReference(event.target.value)}
                placeholder="owner/repository"
                spellCheck={false}
                value={reference}
              />
            </label>
            <Button
              className="sm:self-end"
              disabled={state.status === 'loading'}
              type="submit"
            >
              {state.status === 'loading' && (
                <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
              )}
              {state.status === 'loading'
                ? say`Loading repository`
                : say`Load repository`}
            </Button>
          </form>
          {state.status === 'error' && (
            <p
              aria-live="polite"
              className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-destructive text-sm"
              role="alert"
            >
              {state.message}
            </p>
          )}
        </CardContent>
      </Card>

      {state.status === 'loaded' && repository && (
        <section aria-live="polite" className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <CardTitle className="break-words">
                    {state.snapshot.repository.full_name}
                  </CardTitle>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {state.snapshot.repository.description ??
                      say`No repository description.`}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a
                    href={state.snapshot.repository.html_url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {say`Open on GitHub`}
                    <ExternalLinkIcon aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5">
                <StarIcon aria-hidden="true" className="size-4" />
                {state.snapshot.repository.stargazers_count} {say`stars`}
              </span>
              <span className="flex items-center gap-1.5">
                <GitForkIcon aria-hidden="true" className="size-4" />
                {state.snapshot.repository.forks_count} {say`forks`}
              </span>
              <span>
                {state.snapshot.commits.length} {say`recent commits`}
              </span>
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-3 font-semibold text-xl">
              {say`Recent commit graph`}
            </h2>
            <CommitGraph
              labels={{
                graph: say`Read-only GitHub commit history`,
                head: 'HEAD',
                commit: say`commit`,
                authoredBy: say`Authored by`,
              }}
              repository={repository}
            />
          </div>

          <p className="rounded-lg border border-dashed p-4 text-muted-foreground text-sm">
            {say`This is a limited snapshot of recent public history. Missing older parent commits and branches outside the snapshot are intentionally omitted.`}
          </p>
        </section>
      )}
    </div>
  );
}
