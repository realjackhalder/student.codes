import { NextResponse } from 'next/server';
import {
  githubRepositoryReferenceSchema,
  githubRepositorySnapshotSchema,
} from '~/lib/github-learning/repository-bridge';

const GITHUB_API = 'https://api.github.com';
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'student.codes-github-learning',
  'X-GitHub-Api-Version': '2022-11-28',
};

const githubRequest = async (path: string) => {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers,
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const error = new Error(`GitHub request failed with ${response.status}.`);
    Object.assign(error, { status: response.status });
    throw error;
  }
  return response.json();
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = githubRepositoryReferenceSchema.safeParse({
    owner: url.searchParams.get('owner'),
    repository: url.searchParams.get('repository'),
  });
  if (!reference.success)
    return NextResponse.json({ error: 'invalid-reference' }, { status: 400 });

  const { owner, repository } = reference.data;
  const basePath = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;

  try {
    const [metadata, branches, commits] = await Promise.all([
      githubRequest(basePath),
      githubRequest(`${basePath}/branches?per_page=20`),
      githubRequest(`${basePath}/commits?per_page=30`),
    ]);
    const snapshot = githubRepositorySnapshotSchema.safeParse({
      repository: metadata,
      branches,
      commits,
    });
    if (!snapshot.success)
      return NextResponse.json({ error: 'invalid-response' }, { status: 502 });

    return NextResponse.json(snapshot.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    const status =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      error.status === 404
        ? 404
        : 502;
    return NextResponse.json(
      {
        error: status === 404 ? 'not-found' : 'unavailable',
      },
      { status },
    );
  }
}
