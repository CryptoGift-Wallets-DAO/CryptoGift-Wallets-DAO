/**
 * 🌐 Task Translation Utilities
 *
 * Helper functions to translate task content from Supabase
 * based on the current locale using static translations.
 */

import { useTranslations } from 'next-intl'

/**
 * Convert a task title to a translation key
 * Example: "RC-1155 Tokenbone Protocol & Reference" -> "rc_1155_tokenbone_protocol_reference"
 */
export function titleToKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[&+→]/g, '') // Remove special chars
    .replace(/[^a-z0-9\s]/g, '') // Keep only alphanumeric and spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
}

/**
 * Hook to get translated task content
 * Returns a function that takes a task and returns translated title/description
 */
export function useTaskTranslation() {
  const t = useTranslations('taskData')

  return {
    /**
     * Get translated title for a task
     * Falls back to original title if no translation found
     */
    getTitle: (originalTitle: string): string => {
      const key = titleToKey(originalTitle)
      try {
        const translated = t(`${key}.title`)
        // If the translation key doesn't exist, next-intl returns the key itself
        // Check if we got a valid translation
        if (translated && !translated.includes('.title')) {
          return translated
        }
      } catch {
        // Translation not found, fall back to original
      }
      return originalTitle
    },

    /**
     * Get translated description for a task
     * Falls back to original description if no translation found
     */
    getDescription: (originalTitle: string, originalDescription: string | null): string | null => {
      if (!originalDescription) return null

      const key = titleToKey(originalTitle)
      try {
        const translated = t(`${key}.description`)
        // Check if we got a valid translation
        if (translated && !translated.includes('.description')) {
          return translated
        }
      } catch {
        // Translation not found, fall back to original
      }
      return originalDescription
    },

    /**
     * Get both title and description translated
     */
    translate: (originalTitle: string, originalDescription: string | null): { title: string; description: string | null } => {
      const key = titleToKey(originalTitle)
      let title = originalTitle
      let description = originalDescription

      try {
        const translatedTitle = t(`${key}.title`)
        if (translatedTitle && !translatedTitle.includes('.title')) {
          title = translatedTitle
        }
      } catch {
        // Use original
      }

      try {
        const translatedDesc = t(`${key}.description`)
        if (translatedDesc && !translatedDesc.includes('.description')) {
          description = translatedDesc
        }
      } catch {
        // Use original
      }

      return { title, description }
    }
  }
}

/**
 * Non-hook version for server-side usage
 * Takes the translations object directly
 */
export function translateTask(
  t: (key: string) => string,
  originalTitle: string,
  originalDescription: string | null
): { title: string; description: string | null } {
  const key = titleToKey(originalTitle)
  let title = originalTitle
  let description = originalDescription

  try {
    const translatedTitle = t(`${key}.title`)
    if (translatedTitle && !translatedTitle.includes('.title')) {
      title = translatedTitle
    }
  } catch {
    // Use original
  }

  try {
    const translatedDesc = t(`${key}.description`)
    if (translatedDesc && !translatedDesc.includes('.description')) {
      description = translatedDesc
    }
  } catch {
    // Use original
  }

  return { title, description }
}
