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
    <div className="mb-10 grid grid-cols-1 gap-4 border-t border-ink pt-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div>
        <h2 className="font-display text-[1.75rem] leading-[1.1] font-bold [font-stretch:112%] sm:text-2xl sm:[font-stretch:125%]">{title}</h2>
        {lead && <p className="mt-3 max-w-[60ch] text-ink-2">{lead}</p>}
      </div>
      {children}
    </div>
  );
}
