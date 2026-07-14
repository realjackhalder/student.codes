import type { NextRequest } from 'next/server';
import env from '~/env';
import { spawnSync } from 'node:child_process';

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
    const origin = req.headers.get('origin') ?? '';
    const allowed = env.ALLOWED_ORIGIN.some((o) => matchOrigin(origin, o));
    if (!origin || !allowed) return new Response(null, { status: 403 });
    return handler(req, ctx);
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

  const upstream = await fetch(url, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: env.PISTON_API_KEY,
    },
    body: reqBodyText,
  });

  if (route === 'execute' && (upstream.status === 401 || env.PISTON_API_KEY === 'dummy-piston-api-key') && reqBodyText) {
    try {
      const parsedBody = JSON.parse(reqBodyText);
      const language = parsedBody.language?.toLowerCase();
      const files = parsedBody.files || [];
      const stdin = parsedBody.stdin || '';
      const args = parsedBody.args || [];
      
      const entryFile = files[0];
      const entryContent = entryFile ? entryFile.content : '';

      if (['javascript', 'js', 'node', 'nodejs'].includes(language)) {
        const res = spawnSync('node', ['-e', entryContent, ...args], {
          input: stdin,
          timeout: 5000,
          encoding: 'utf-8',
        });
        
        return Response.json({
          run: {
            output: res.stdout || res.stderr || '',
            code: res.status ?? 0,
            signal: res.signal,
          }
        });
      } else if (['python', 'py', 'python3'].includes(language)) {
        const res = spawnSync('python3', ['-c', entryContent, ...args], {
          input: stdin,
          timeout: 5000,
          encoding: 'utf-8',
        });
        
        return Response.json({
          run: {
            output: res.stdout || res.stderr || '',
            code: res.status ?? 0,
            signal: res.signal,
          }
        });
      } else {
        return Response.json({
          run: {
            output: `[Local Fallback Mode]\nRunning "${language}" locally requires self-hosting Piston or setting a valid PISTON_API_KEY in .env.\nJavaScript & Python can run locally without any configuration.`,
            code: 1,
            signal: null
          }
        });
      }
    } catch (err) {
      console.error('Local fallback failed:', err);
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? '' },
  });
}

export const GET = handleRequest;
export const POST = withOriginCheck(handleRequest);
export const OPTIONS = withOriginCheck(handleRequest);
