import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PRODUCTOS } from "@/lib/lonchera-data";
import { useStore } from "@/lib/store";
import { AlertTriangle, CheckCircle2, ScanLine, Timer } from "lucide-react";

export const Route = createFileRoute("/quiosco")({
  head: () => ({
    meta: [
      { title: "POS Quiosco — Despacho express por QR | NutriControl" },
      {
        name: "description",
        content:
          "Módulo de quiosco escolar: escanea el QR del alumno, valida la preorden y entrega la lonchera en segundos.",
      },
      { property: "og:title", content: "POS Quiosco — NutriControl" },
      {
        property: "og:description",
        content: "Escaneo de QR, validación de preorden y despacho en menos de 10 segundos.",
      },
    ],
  }),
  component: QuioscoPage,
});

function QuioscoPage() {
  const { estudiantes, pedidos, entregarPedido } = useStore();
  const [codigo, setCodigo] = useState("");
  const [activo, setActivo] = useState<string | null>(null);

  const pendientes = pedidos.filter((p) => p.estado !== "entregado");
  const entregados = pedidos.filter((p) => p.estado === "entregado");
  const promedio =
    entregados.length > 0
      ? Math.round(
          entregados.reduce((s, p) => s + (p.segundosDespacho ?? 8), 0) / entregados.length,
        )
      : 8;

  const escanear = (qr: string) => {
    const est = estudiantes.find((e) => e.qr.toUpperCase() === qr.trim().toUpperCase());
    const pedido = est && pendientes.find((p) => p.estudianteId === est.id);
    if (!pedido) {
      toast.error("QR sin preorden activa");
      setActivo(null);
      return;
    }
    setActivo(pedido.id);
    setCodigo("");
    toast.success(`Pedido de ${est!.nombre} validado`);
  };

  const pedidoActivo = pedidos.find((p) => p.id === activo);
  const estActivo = estudiantes.find((e) => e.id === pedidoActivo?.estudianteId);

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Módulo POS · Concesionario
        </p>
        <h1 className="text-3xl">Despacho express del recreo</h1>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { l: "Preórdenes pendientes", v: pendientes.length, i: ScanLine },
          { l: "Entregados hoy", v: entregados.length, i: CheckCircle2 },
          { l: "Tiempo prom. despacho", v: `${promedio}s`, i: Timer },
        ].map((k) => (
          <div key={k.l} className="surface-card flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <k.i className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{k.l}</p>
              <p className="font-display text-2xl leading-none">{k.v}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="surface-card p-5">
          <h2 className="text-lg">Escáner QR</h2>
          <div className="mt-4 flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-secondary/30">
            <div className="text-center">
              <ScanLine className="mx-auto size-14 animate-pulse text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">
                Apunta la cámara al fotocheck del alumno
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Código manual (ej. LNC-3B-0281)"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && escanear(codigo)}
            />
            <Button onClick={() => escanear(codigo)}>Validar</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {estudiantes.map((e) => (
              <Button key={e.id} size="sm" variant="outline" onClick={() => escanear(e.qr)}>
                Simular escaneo · {e.nombre.split(" ")[0]}
              </Button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          {pedidoActivo && estActivo && (
            <div className="surface-card overflow-hidden">
              <div className="hero-gradient flex items-center gap-2 p-4 text-primary-foreground">
                <CheckCircle2 className="size-5" />
                <span className="font-display text-lg">Pedido validado</span>
              </div>
              <div className="space-y-3 p-5">
                <div>
                  <p className="font-display text-xl">{estActivo.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {estActivo.grado} · {estActivo.qr}
                  </p>
                </div>
                {estActivo.alergias.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertTriangle className="size-4" />
                    Alergias: {estActivo.alergias.join(", ")}
                  </div>
                )}
                <ul className="space-y-2">
                  {pedidoActivo.items.map((id) => {
                    const p = PRODUCTOS.find((x) => x.id === id)!;
                    return (
                      <li
                        key={id}
                        className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3 text-sm"
                      >
                        <span className="text-xl">{p.emoji}</span>
                        <span className="flex-1 font-semibold">{p.nombre}</span>
                        <span className="text-muted-foreground">{p.kcal} kcal</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex items-center justify-between text-sm">
                  <span>Total prepagado</span>
                  <span className="font-display text-lg">
                    S/ {pedidoActivo.total.toFixed(2)}
                  </span>
                </div>
                {pedidoActivo.estado === "entregado" ? (
                  <Badge variant="secondary">
                    Entregado en {pedidoActivo.segundosDespacho}s
                  </Badge>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      const s = 6 + Math.floor(Math.random() * 5);
                      entregarPedido(pedidoActivo.id, s);
                      toast.success(`Entregado en ${s} segundos`);
                    }}
                  >
                    Marcar como entregado
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="surface-card p-5">
            <h2 className="text-lg">Cola de preparación</h2>
            <ul className="mt-3 space-y-2">
              {pendientes.length === 0 && (
                <li className="text-sm text-muted-foreground">Sin pedidos pendientes.</li>
              )}
              {pendientes.map((p) => {
                const e = estudiantes.find((x) => x.id === p.estudianteId);
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm"
                  >
                    <span className="font-mono text-xs text-muted-foreground">{e?.qr}</span>
                    <span className="flex-1 font-semibold">{e?.nombre}</span>
                    <span className="text-muted-foreground">{p.items.length} ítems</span>
                    <Badge variant="outline">{p.hora}</Badge>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
