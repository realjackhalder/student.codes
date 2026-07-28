import { type NextRequest, NextResponse } from 'next/server';

const REDIRECTS: Record<string, string> = {
  'discord-bot': 'https://discord.gg/WMuCvVn5uh',
  'chrome-extension': 'https://chromewebstore.google.com/search/student.codes',
  'firefox-extension':
    'https://addons.mozilla.org/en-US/firefox/search/?q=student.codes',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ link: string }> },
) {
  const { link } = await params;
  const target = REDIRECTS[link];

  if (target) {
    return NextResponse.redirect(target);
  }

  return NextResponse.redirect(new URL('/', request.url));
}
