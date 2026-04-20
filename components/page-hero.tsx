import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  action,
  children,
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("page-hero travel-panel", className)}>
      <div className="page-hero__top">
        <div className="page-hero__copy">
          <p className="page-hero__eyebrow">{eyebrow}</p>
          <h1 className="page-hero__title">{title}</h1>
          <p className="page-hero__description">{description}</p>
        </div>

        {action ? <div className="page-hero__action">{action}</div> : null}
      </div>

      {children ? <div className="page-hero__content">{children}</div> : null}
    </section>
  );
}
