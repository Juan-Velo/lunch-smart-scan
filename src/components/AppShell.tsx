import { Link } from "@tanstack/react-router";
import { Salad, ScanLine, LayoutDashboard, Home } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/padres", label: "Vista Padres", icon: Salad },
  { to: "/quiosco", label: "Vista Quiosco", icon: ScanLine },
  { to: "/reportes", label: "Reportes", icon: LayoutDashboard },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="mr-auto flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl hero-gradient text-lg">
              🍱
            </span>
            <span className="font-display text-xl leading-none">
              Nutri<span className="text-primary">Control</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
                activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted-foreground">
        Mockup demostrativo · Datos simulados · Piloto 3ro y 4to de primaria
      </footer>
    </div>
  );
}
