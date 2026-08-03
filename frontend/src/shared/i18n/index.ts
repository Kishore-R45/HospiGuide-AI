import en from './en.json';
import ta from './ta.json';

export type Language = 'en' | 'ta';

const translations: Record<Language, typeof en> = { en, ta };

/**
 * Get a nested translation value by dot-path key.
 * Supports template interpolation: {{variable}}
 */
export function getTranslation(
  lang: Language,
  key: string,
  params?: Record<string, string>
): string {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[lang];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English
      value = translations.en;
      for (const fk of keys) {
        if (value && typeof value === 'object' && fk in value) {
          value = value[fk];
        } else {
          return key; // Return the key itself if not found
        }
      }
      break;
    }
  }

  if (typeof value !== 'string') return key;

  // Template interpolation
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) => params[paramKey] || '');
  }

  return value;
}

export { en, ta };
