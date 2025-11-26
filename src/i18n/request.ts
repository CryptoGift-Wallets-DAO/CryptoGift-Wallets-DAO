import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'es'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;

  // Use default locale if requested is undefined or invalid
  const locale: Locale = (requested && locales.includes(requested as Locale))
    ? (requested as Locale)
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
    timeZone: 'America/Mexico_City'
  };
});
