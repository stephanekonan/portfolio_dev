export default function SectionHead({
  index,
  title,
  lead,
  children,
}: {
  /** Numéro de section, en pastille (« 01 »), recomposé à l'arrivée. */
  index?: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-12 grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div>
        {index && (
          <p className="mb-5">
            <span data-scramble-in aria-hidden className="chip chip-signal font-mono">
              {index}
            </span>
          </p>
        )}
        <h2
          data-split
          className="max-w-[22ch] font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.04em]"
        >
          {title}
        </h2>
        {lead && (
          <p data-reveal className="mt-5 max-w-[58ch] text-lg text-ink-2">
            {lead}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
