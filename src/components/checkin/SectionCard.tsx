import type { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  icon,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section className={`card-soft p-4 ${className}`}>
      {(title || description) && (
        <header className="mb-3 flex items-start gap-3">
          {icon && (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-foreground">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-bold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}
