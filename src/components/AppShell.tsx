import { Link } from "@tanstack/react-router";
import { Salad, ScanLine, LayoutDashboard, Home, LogOut, LogIn, User } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/padres", label: "Vista Padres", icon: Salad },
  { to: "/quiosco", label: "Vista Quiosco", icon: ScanLine },
  { to: "/reportes", label: "Reportes", icon: LayoutDashboard },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { usuario, logout, login } = useStore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl hero-gradient text-lg shadow-sm">
              🍱
            </span>
            <span className="font-display text-xl leading-none">
              Nutri<span className="text-primary font-bold">Control</span>
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

          {/* Estado de Sesión en el Header */}
          <div className="flex items-center gap-2">
            {usuario ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs shadow-sm">
                <div className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[11px]">
                  👤
                </div>
                <span className="font-semibold text-foreground hidden sm:inline">
                  {usuario.nombre}
                </span>
                <button
                  onClick={() => {
                    logout();
                    toast.info("Sesión cerrada correctamente");
                  }}
                  title="Cerrar sesión"
                  className="ml-1 text-muted-foreground transition hover:text-destructive"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  login("padres@nutricontrol.pe", "Familia Velo");
                  toast.success("¡Sesión iniciada!");
                }}
                className="gap-1.5 rounded-full text-xs h-8"
              >
                <LogIn className="size-3.5 text-primary" />
                <span>Iniciar Sesión</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-4">
        <span>NutriControl © 2026 · Plataforma de Loncheras Escolares Saludables</span>
        <span>Piloto San Patricio · Despacho seguro por QR</span>
      </footer>
    </div>
  );
}
