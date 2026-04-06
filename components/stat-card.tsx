export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="travel-panel rounded-[30px] p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--ink-muted)]">
        {label}
      </p>
      <p className="display-type mt-4 text-4xl leading-none text-[var(--ink-strong)]">
        {value}
      </p>
      <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{helper}</p>
    </div>
  );
}
