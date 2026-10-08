/**
 * Catégories de l'espace privé. Les fichiers Markdown les citent par leur
 * clé (`categories: [wadibu, sante]`) ; une clé inconnue est ignorée.
 */
export const ARTICLE_CATEGORIES = {
  entrepreneuriat: "Entrepreneuriat",
  wadibu: "Wadibu",
  "developpement-personnel": "Développement personnel",
  sante: "Santé et bien-être",
  experiences: "Expériences",
  lecons: "Leçons apprises",
  coulisses: "Coulisses",
} as const;

export const JOURNAL_CATEGORIES = {
  sante: { emoji: "🦷", label: "Santé" },
  wadibu: { emoji: "🚀", label: "Wadibu" },
  confiance: { emoji: "🧠", label: "Confiance" },
  business: { emoji: "💼", label: "Business" },
  technologie: { emoji: "💻", label: "Technologie" },
  lecons: { emoji: "📚", label: "Leçons" },
} as const;

export type ArticleCategory = keyof typeof ARTICLE_CATEGORIES;
export type JournalCategory = keyof typeof JOURNAL_CATEGORIES;

export const isArticleCategory = (k: string): k is ArticleCategory => k in ARTICLE_CATEGORIES;
export const isJournalCategory = (k: string): k is JournalCategory => k in JOURNAL_CATEGORIES;
