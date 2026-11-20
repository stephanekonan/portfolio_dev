/**
 * La marque du site : des chevrons de code autour d'une barre, en bleu.
 * Dans l'en-tête à côté du nom, et seule dans sa pastille au centre de
 * l'accueil.
 */
export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={`text-signal ${className}`}
    >
      <path
        d="M10.5 9 4 16l6.5 7M21.5 9 28 16l-6.5 7"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="14.2" y="6.5" width="3.6" height="19" rx="1.8" fill="currentColor" transform="rotate(16 16 16)" />
    </svg>
  );
}
