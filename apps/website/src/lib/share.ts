'use client';

import { ExecuteOptions } from 'piston.ts';
import { compress, decompress } from 'piston.ts/evaluate';

const MAX_SHARED_PAYLOAD_LENGTH = 100_000;

type SharedProject = {
  version: 1;
  options: typeof ExecuteOptions._output & { focused?: string };
};

export function encodeSharedProject(options: typeof ExecuteOptions._input) {
  return compress({ version: 1, options: ExecuteOptions.parse(options) });
}

export function decodeSharedProject(value: string) {
  if (!value || value.length > MAX_SHARED_PAYLOAD_LENGTH) return undefined;
  try {
    const decoded = decompress<SharedProject | typeof ExecuteOptions._output>(
      value,
    );
    const options =
      typeof decoded === 'object' && decoded !== null && 'version' in decoded
        ? decoded.options
        : decoded;
    const parsed = ExecuteOptions.safeParse(options);
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

export function makeSharedUrl(options: typeof ExecuteOptions._input) {
  const url = new URL(window.location.href);
  url.searchParams.delete('library');
  url.hash = encodeSharedProject(options);
  return url.toString();
}
