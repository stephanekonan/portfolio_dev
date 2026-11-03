export default function SectionHead({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative mb-10 grid grid-cols-1 gap-4 pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      {/* Le filet est un élément à part : il se trace à l'arrivée (ScrollMotion). */}
      <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-px origin-left bg-ink" />
      <div>
        <h2 data-split className="font-display text-[1.75rem] leading-[1.1] font-bold [font-stretch:112%] sm:text-2xl sm:[font-stretch:125%]">{title}</h2>
        {lead && <p data-reveal className="mt-3 max-w-[60ch] text-ink-2">{lead}</p>}
      </div>
      {children}
    </div>
  );
}
