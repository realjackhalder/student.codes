import { Sayable } from 'sayable';

const say = new Sayable({
  en: () =>
    import('./locales/en/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  es: () =>
    import('./locales/es/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  fr: () =>
    import('./locales/fr/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  de: () =>
    import('./locales/de/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  ja: () =>
    import('./locales/ja/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  zh: () =>
    import('./locales/zh/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  pt: () =>
    import('./locales/pt/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  th: () =>
    import('./locales/th/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  my: () =>
    import('./locales/my/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  ko: () =>
    import('./locales/ko/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  ar: () =>
    import('./locales/ar/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
  bn: () =>
    import('./locales/bn/messages.json', { with: { type: 'json' } }) //
      .then((m) => m.default),
});

await say.load();
say.activate(say.locales[0]!);

export default say;
