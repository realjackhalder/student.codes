import { merge } from 'es-toolkit/object';
import type { Metadata } from 'next';
import type { Sayable } from 'sayable';
import env from '~/env';

export async function generateBaseMetadata(
  say: Sayable,
  pathname: `/${string}`,
  overrides?: (say: Sayable) => Metadata,
) {
  await say.load();
  const metadata = merge(
    {
      title: 'student.codes',
      description: say`Test code in any programming language with student.codes! Run code snippets in your browser, without installing anything.`,
      keywords: [
        say`online playground`,
        say`code playground`,
        say`code sandbox`,
        say`online compiler`,
        say`online interpreter`,
      ],
    } satisfies Metadata,
    overrides?.(say) ?? {},
  );

  return {
    metadataBase: new URL(env.WEBSITE_URL),
    ...metadata,
    openGraph: {
      type: 'website',
      title: metadata.title,
      description: metadata.description,
      locale: say.locale,
      alternateLocale: say.locales,
      siteName: metadata.title,
      url: new URL(`/${say.locale}${pathname}`, env.WEBSITE_URL),
    },
    twitter: {
      card: 'summary',
      title: metadata.title,
      description: metadata.description,
      site: '@studentcodes',
      creator: '@realjackhalder',
    },
    alternates: {
      canonical: pathname,
      languages: say.locales.reduce<Record<string, string>>((acc, locale) => {
        acc[locale] = `/${locale}${pathname}`;
        return acc;
      }, {}),
    },
  } satisfies Metadata;
}
