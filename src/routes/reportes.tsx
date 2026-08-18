import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PRODUCTOS, metaKcalRecreo } from "@/lib/lonchera-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes y demanda — Analítica nutricional | LoncheraQR" },
      {
        name: "description",
        content:
          "Dashboard descriptivo y predictivo: consumo de macronutrientes, velocidad de despacho y previsión de demanda del quiosco escolar.",
      },
      { property: "og:title", content: "Reportes — LoncheraQR" },
      {
        property: "og:description",
        content: "Consumo calórico, eficiencia de despacho y previsión de demanda diaria.",
      },
    ],
  }),
  component: ReportesPage,
});

const semana = [
  { dia: "Lun", kcal: 420, meta: 430, despacho: 12 },
  { dia: "Mar", kcal: 455, meta: 430, despacho: 10 },
  { dia: "Mié", kcal: 398, meta: 430, despacho: 9 },
  { dia: "Jue", kcal: 441, meta: 430, despacho: 8 },
  { dia: "Vie", kcal: 470, meta: 430, despacho: 7 },
];

const prevision = [
  { dia: "Lun", raciones: 128 },
  { dia: "Mar", raciones: 134 },
  { dia: "Mié", raciones: 121 },
  { dia: "Jue", raciones: 142 },
  { dia: "Vie", raciones: 156 },
];

function ReportesPage() {
  const { estudiantes, pedidos } = useStore();

  const macros = pedidos.flatMap((p) => p.items.map((id) => PRODUCTOS.find((x) => x.id === id)!));
  const suma = (k: "proteina" | "carbos" | "grasa" | "azucar") =>
    macros.reduce((s, m) => s + m[k], 0);
  const totalMacros = suma("proteina") + suma("carbos") + suma("grasa") || 1;

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Analítica · Dirección y padres
        </p>
        <h1 className="text-3xl">Reportes de consumo y operación</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h2 className="text-lg">Consumo calórico vs. meta (descriptivo)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semana}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="dia" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="kcal" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="meta" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-lg">Previsión de raciones (predictivo)</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prevision}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="dia" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="raciones"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Viernes con evento deportivo: +14% de demanda proyectada.
          </p>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-lg">Distribución de macronutrientes</h2>
          <div className="mt-4 space-y-4">
            {(
              [
                ["Proteínas", suma("proteina")],
                ["Carbohidratos", suma("carbos")],
                ["Grasas", suma("grasa")],
              ] as const
            ).map(([l, v]) => (
              <div key={l}>
                <div className="flex justify-between text-sm">
                  <span>{l}</span>
                  <span className="font-semibold">{v} g</span>
                </div>
                <Progress className="mt-1" value={(v / totalMacros) * 100} />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Azúcar total acumulada: {suma("azucar")} g · 0 productos ultraprocesados en las
              preórdenes.
            </p>
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-lg">Indicadores del piloto</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Despacho promedio", "8.4 s", "meta < 10s"],
              ["Adopción QR", "78%", "3ro y 4to primaria"],
              ["Merma perecibles", "-31%", "vs. mes anterior"],
              ["Incidentes por alergia", "0", "filtrado preventivo"],
            ].map(([l, v, s]) => (
              <div key={l} className="rounded-2xl bg-secondary/40 p-4">
                <p className="text-xs text-muted-foreground">{l}</p>
                <p className="font-display text-2xl">{v}</p>
                <Badge variant="outline" className="mt-1">
                  {s}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {estudiantes.map((e) => (
              <div key={e.id} className="flex justify-between rounded-xl border border-border p-3">
                <span className="font-semibold">{e.nombre}</span>
                <span className="text-muted-foreground">
                  Meta recreo: {metaKcalRecreo(e)} kcal ·{" "}
                  {pedidos.filter((p) => p.estudianteId === e.id).length} preórdenes
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
