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
    <div className="travel-panel rounded-[28px] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--ink-muted)]">
        {label}
      </p>
      <p className="mt-4 text-3xl font-semibold text-[var(--ink-strong)]">
        {value}
      </p>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">{helper}</p>
    </div>
  );
}
