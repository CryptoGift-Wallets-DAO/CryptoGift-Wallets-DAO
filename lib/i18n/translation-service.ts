/**
 * 🌐 AUTOMATIC TRANSLATION SERVICE
 *
 * Uses Lingva Translate API for free, unlimited translations.
 * Lingva is an open-source alternative frontend for Google Translate.
 *
 * Features:
 * - Free, no API key required
 * - No rate limits
 * - High quality translations (uses Google Translate backend)
 * - Simple REST API
 *
 * @see https://github.com/thedaviddelta/lingva-translate
 */

// Available Lingva instances (fallback if one is down)
const LINGVA_INSTANCES = [
  'https://lingva.ml',
  'https://translate.plausibility.cloud',
  'https://lingva.garuber.eu',
];

// In-memory cache for translations (per session)
const translationCache = new Map<string, string>();

/**
 * Generate cache key for a translation
 */
function getCacheKey(text: string, from: string, to: string): string {
  return `${from}:${to}:${text.substring(0, 100)}`;
}

/**
 * Detect if text is likely in Spanish
 * Simple heuristic based on common Spanish words/patterns
 */
export function detectLanguage(text: string): 'es' | 'en' | 'unknown' {
  const spanishIndicators = [
    /\b(el|la|los|las|un|una|unos|unas)\b/i,
    /\b(que|de|en|por|para|con|sin)\b/i,
    /\b(es|son|está|están|ser|tener)\b/i,
    /\b(tu|tus|su|sus|mi|mis)\b/i,
    /[áéíóúüñ]/i,
  ];

  const englishIndicators = [
    /\b(the|a|an)\b/i,
    /\b(is|are|was|were|be|been)\b/i,
    /\b(you|your|their|our)\b/i,
    /\b(and|or|but|if|then)\b/i,
    /\b(with|from|into|that)\b/i,
  ];

  const spanishScore = spanishIndicators.filter(r => r.test(text)).length;
  const englishScore = englishIndicators.filter(r => r.test(text)).length;

  if (spanishScore > englishScore + 1) return 'es';
  if (englishScore > spanishScore + 1) return 'en';
  return 'unknown';
}

/**
 * Translate text using Lingva Translate API
 *
 * @param text - Text to translate
 * @param from - Source language code (e.g., 'en', 'es', 'auto')
 * @param to - Target language code (e.g., 'en', 'es')
 * @returns Translated text or original if translation fails
 */
export async function translateText(
  text: string,
  from: string = 'auto',
  to: string = 'es'
): Promise<string> {
  // Don't translate empty text
  if (!text || text.trim().length === 0) {
    return text;
  }

  // Don't translate if source and target are the same
  if (from === to) {
    return text;
  }

  // Check cache first
  const cacheKey = getCacheKey(text, from, to);
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Try each Lingva instance until one works
  for (const baseUrl of LINGVA_INSTANCES) {
    try {
      const encodedText = encodeURIComponent(text);
      const url = `${baseUrl}/api/v1/${from}/${to}/${encodedText}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // 5 second timeout
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.warn(`Lingva instance ${baseUrl} returned ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data.translation) {
        // Cache the result
        translationCache.set(cacheKey, data.translation);
        return data.translation;
      }
    } catch (error) {
      console.warn(`Lingva instance ${baseUrl} failed:`, error);
      // Try next instance
      continue;
    }
  }

  // All instances failed, return original text
  console.error('All Lingva instances failed, returning original text');
  return text;
}

/**
 * Translate text to match the target locale
 * Automatically detects source language
 *
 * @param text - Text to translate
 * @param targetLocale - Target locale ('en' or 'es')
 * @returns Translated text or original if already in target language
 */
export async function translateToLocale(
  text: string,
  targetLocale: 'en' | 'es'
): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }

  // Detect source language
  const sourceLanguage = detectLanguage(text);

  // If already in target language, return as-is
  if (sourceLanguage === targetLocale) {
    return text;
  }

  // If unknown, assume it's the opposite of target
  const from = sourceLanguage === 'unknown'
    ? (targetLocale === 'es' ? 'en' : 'es')
    : sourceLanguage;

  return translateText(text, from, targetLocale);
}

/**
 * Clear translation cache
 * Useful for testing or memory management
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * Get cache statistics
 */
export function getTranslationCacheStats(): { size: number; keys: string[] } {
  return {
    size: translationCache.size,
    keys: Array.from(translationCache.keys()),
  };
}
