import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "@/components/QrCode";
import { Salad, ScanLine, LayoutDashboard, Clock, ShieldCheck, Wallet } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LoncheraQR — Loncheras saludables preordenadas con despacho por QR" },
      {
        name: "description",
        content:
          "Mockup de plataforma escolar: los padres preordenan loncheras según el perfil nutricional del alumno y el quiosco despacha en segundos escaneando un QR.",
      },
      { property: "og:title", content: "LoncheraQR — Nutrición escolar sin colas ni efectivo" },
      {
        property: "og:description",
        content:
          "Perfil nutricional, recomendador de combos, preorden sin efectivo y despacho express por QR en el recreo.",
      },
    ],
  }),
  component: Index,
});

const roles = [
  {
    to: "/padres",
    icon: Salad,
    titulo: "Vista Padres",
    desc: "Perfil de salud, combos recomendados, preorden y carnet QR del alumno.",
  },
  {
    to: "/quiosco",
    icon: ScanLine,
    titulo: "Vista Quiosco",
    desc: "Escaneo de QR, validación del pedido, alertas de alergias y cola de preparación.",
  },
  {
    to: "/reportes",
    icon: LayoutDashboard,
    titulo: "Reportes",
    desc: "Consumo de macronutrientes, velocidad de despacho y previsión de demanda.",
  },
] as const;

function Index() {
  return (
    <AppShell>
      <section className="surface-card overflow-hidden">
        <div className="grid gap-8 p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
          <div>
            <Badge variant="secondary">Mockup · Piloto escolar</Badge>
            <h1 className="mt-4 text-4xl leading-tight md:text-5xl">
              Loncheras saludables preordenadas,{" "}
              <span className="text-primary">entregadas en segundos</span>
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Los padres arman la lonchera según el perfil nutricional de su hijo; el quiosco
              escanea el QR del fotocheck y entrega el pack listo. Sin efectivo, sin colas, sin
              ultraprocesados.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/padres">Entrar como padre</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/quiosco">Entrar como quiosco</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { i: Clock, l: "< 10 s", d: "despacho por alumno" },
                { i: Wallet, l: "0 efectivo", d: "presupuesto controlado" },
                { i: ShieldCheck, l: "0 alergias", d: "filtrado preventivo" },
              ].map((k) => (
                <div key={k.l} className="rounded-2xl bg-secondary/40 p-4">
                  <k.i className="size-5 text-primary" />
                  <p className="mt-2 font-display text-xl leading-none">{k.l}</p>
                  <p className="text-xs text-muted-foreground">{k.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-gradient flex flex-col items-center justify-center gap-4 rounded-3xl p-8 text-primary-foreground">
            <QrCode value="LNC-3B-0281" size={180} />
            <p className="font-mono text-sm">LNC-3B-0281</p>
            <p className="text-center text-sm opacity-90">
              Un código por alumno: identidad, pedido del día y pago prepagado.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {roles.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className="surface-card group p-6 transition-transform hover:-translate-y-1"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <r.icon className="size-5" />
            </span>
            <h2 className="mt-4 text-xl">{r.titulo}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-primary">
              Abrir vista →
            </span>
          </Link>
        ))}
      </section>

      <section className="surface-card mt-8 p-6">
        <h2 className="text-xl">Cómo funciona el flujo</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            ["1. Perfil", "Edad, peso, actividad, alergias y presupuesto diario."],
            ["2. Recomendador", "Combos optimizados por balance calórico, gustos y costo."],
            ["3. Preorden", "El quiosco conoce la demanda exacta antes del recreo."],
            ["4. Escaneo QR", "Validación instantánea y entrega del pack en segundos."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-2xl border border-border p-4">
              <p className="font-display text-lg">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
}
