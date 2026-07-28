import { defineConfig } from '@sayable/config';

export default defineConfig({
  sourceLocale: 'en',
  locales: [
    'en',
    'es',
    'fr',
    'de',
    'ja',
    'zh',
    'pt',
    'th',
    'my',
    'ko',
    'ar',
    'bn',
  ],
  catalogues: [
    {
      include: ['src/**/*.ts'],
      output: 'src/locales/{locale}/messages.{extension}',
    },
  ],
});
