import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface PhoneShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  backTo?: string;
  showBack?: boolean;
  showNav?: boolean;
  rightSlot?: ReactNode;
  bare?: boolean; // no header
}

export function PhoneShell({
  children,
  title,
  subtitle,
  backTo,
  showBack = true,
  showNav = true,
  rightSlot,
  bare = false,
}: PhoneShellProps) {
  const router = useRouter();
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
        {!bare && (
          <header className="sticky top-0 z-30 bg-background/95 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
              {showBack ? (
                backTo ? (
                  <Link
                    to={backTo}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground hover:bg-accent"
                    aria-label="返回"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => router.history.back()}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground hover:bg-accent"
                    aria-label="返回"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )
              ) : (
                <span className="h-10 w-10" />
              )}
              <div className="min-w-0 text-center">
                {title && (
                  <h1 className="truncate text-base font-bold text-foreground">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="truncate text-xs text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-end">
                {rightSlot}
              </div>
            </div>
          </header>
        )}

        <main
          className={`flex-1 px-4 pt-2 ${showNav ? "pb-28" : "pb-8"}`}
        >
          {children}
        </main>

        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
