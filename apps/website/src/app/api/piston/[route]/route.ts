import { spawnSync } from 'node:child_process';
import type { NextRequest } from 'next/server';
import env from '~/env';

function matchOrigin(origin: string, pattern: string) {
  if (pattern === '*') return true;
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const regexPattern = `^${escaped.replace(/\*/g, '[^.]+')}$`;
  const regex = new RegExp(regexPattern);
  return regex.test(origin);
}

function withOriginCheck(
  handler: (
    req: NextRequest,
    ctx: RouteContext<'/api/piston/[route]'>,
  ) => Promise<Response>,
) {
  return async (req: NextRequest, ctx: RouteContext<'/api/piston/[route]'>) => {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    let isAllowed = false;

    if (!origin) {
      isAllowed = true;
    } else {
      isAllowed = env.ALLOWED_ORIGIN.some((o) => matchOrigin(origin, o));
      if (!isAllowed && host && origin.includes(host)) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return new Response(null, { status: 403 });
    }

    if (req.method === 'OPTIONS') {
      const headers = new Headers();
      if (origin) {
        headers.set('Access-Control-Allow-Origin', origin);
        headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        headers.set(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization',
        );
      }
      return new Response(null, { status: 204, headers });
    }

    const response = await handler(req, ctx);
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS',
      );
      response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
    }
    return response;
  };
}

const BASE_URL = 'https://emkc.org/api/v2/piston';

async function handleRequest(
  req: NextRequest,
  { params }: RouteContext<'/api/piston/[route]'>,
) {
  const { route } = await params;
  const url = new URL(`${BASE_URL}/${route}${req.nextUrl.search}`);

  const reqBodyText =
    req.method !== 'GET' && req.method !== 'HEAD'
      ? await req.text()
      : undefined;

  let upstream: Response | null = null;

  if (env.PISTON_API_KEY && env.PISTON_API_KEY !== 'dummy-piston-api-key') {
    try {
      upstream = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: env.PISTON_API_KEY,
        },
        body: reqBodyText,
      });
    } catch {
      upstream = null;
    }
  }

  if (route === 'execute' && (!upstream || !upstream.ok) && reqBodyText) {
    try {
      const parsedBody = JSON.parse(reqBodyText);
      const language = (parsedBody.language || '').toLowerCase();
      const files = parsedBody.files || [];
      const stdin = parsedBody.stdin || '';
      const args = parsedBody.args || [];

      const entryFile = files[0];
      const entryContent = entryFile ? entryFile.content : '';

      if (
        ['javascript', 'js', 'node', 'nodejs', 'typescript', 'ts'].includes(
          language,
        )
      ) {
        const res = spawnSync('node', ['-e', entryContent, ...args], {
          input: stdin,
          timeout: 5000,
          encoding: 'utf-8',
        });

        const stdout = res.stdout || '';
        const stderr = res.stderr || '';
        const output = stdout || stderr || '';

        return Response.json({
          language,
          version: 'local',
          run: {
            stdout,
            stderr,
            output,
            code: res.status ?? 0,
            signal: res.signal ?? null,
          },
        });
      }

      if (['python', 'py', 'python3'].includes(language)) {
        const res = spawnSync('python3', ['-c', entryContent, ...args], {
          input: stdin,
          timeout: 5000,
          encoding: 'utf-8',
        });

        const stdout = res.stdout || '';
        const stderr = res.stderr || '';
        const output = stdout || stderr || '';

        return Response.json({
          language,
          version: 'local',
          run: {
            stdout,
            stderr,
            output,
            code: res.status ?? 0,
            signal: res.signal ?? null,
          },
        });
      }

      if (['bash', 'sh', 'zsh'].includes(language)) {
        const res = spawnSync('bash', ['-c', entryContent, ...args], {
          input: stdin,
          timeout: 5000,
          encoding: 'utf-8',
        });

        const stdout = res.stdout || '';
        const stderr = res.stderr || '';
        const output = stdout || stderr || '';

        return Response.json({
          language,
          version: 'local',
          run: {
            stdout,
            stderr,
            output,
            code: res.status ?? 0,
            signal: res.signal ?? null,
          },
        });
      }

      const msg =
        '[Local Fallback Mode]\nRunning this language requires setting a valid PISTON_API_KEY in .env or self-hosting Piston.\nJavaScript, Python, and Bash can run locally without configuration.';

      return Response.json({
        language,
        version: 'local',
        run: {
          stdout: msg,
          stderr: '',
          output: msg,
          code: 0,
          signal: null,
        },
      });
    } catch (err) {
      console.error('Local fallback failed:', err);
    }
  }

  if (!upstream) {
    return Response.json(
      { message: 'Upstream request failed' },
      { status: 502 },
    );
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? '' },
  });
}

export const GET = handleRequest;
export const POST = withOriginCheck(handleRequest);
export const OPTIONS = withOriginCheck(handleRequest);
