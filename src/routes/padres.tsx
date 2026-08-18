import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { QrCode } from "@/components/QrCode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  PRODUCTOS,
  esApto,
  metaKcalRecreo,
  recomendarCombos,
  type Alergeno,
  type Producto,
} from "@/lib/lonchera-data";
import { useStore } from "@/lib/store";
import { AlertTriangle, Check, Sparkles, Wallet } from "lucide-react";

export const Route = createFileRoute("/padres")({
  head: () => ({
    meta: [
      { title: "Vista Padres — Preordena la lonchera saludable | LoncheraQR" },
      {
        name: "description",
        content:
          "Configura el perfil nutricional de tu hijo, recibe combos sugeridos y preordena su lonchera escolar con entrega por QR.",
      },
      { property: "og:title", content: "Vista Padres — LoncheraQR" },
      {
        property: "og:description",
        content: "Perfil nutricional, combos recomendados y preorden con QR para el recreo.",
      },
    ],
  }),
  component: PadresPage,
});

const ALERGENOS: Alergeno[] = ["gluten", "lactosa", "frutos secos", "huevo", "mariscos"];

function PadresPage() {
  const { estudiantes, pedidos, actualizarEstudiante, crearPedido } = useStore();
  const [activoId, setActivoId] = useState(estudiantes[0]!.id);
  const estudiante = estudiantes.find((e) => e.id === activoId) ?? estudiantes[0]!;
  const [carrito, setCarrito] = useState<string[]>([]);

  const meta = metaKcalRecreo(estudiante);
  const combos = useMemo(() => recomendarCombos(estudiante), [estudiante]);
  const items = carrito.map((id) => PRODUCTOS.find((p) => p.id === id)!);
  const kcal = items.reduce((s, i) => s + i.kcal, 0);
  const total = items.reduce((s, i) => s + i.precio, 0);
  const pedidoHoy = pedidos.find(
    (p) => p.estudianteId === estudiante.id && p.estado !== "entregado",
  );

  const toggle = (p: Producto) => {
    if (!esApto(p, estudiante)) {
      toast.error(`Bloqueado: contiene ${p.alergenos.join(", ")}`);
      return;
    }
    setCarrito((c) => (c.includes(p.id) ? c.filter((x) => x !== p.id) : [...c, p.id]));
  };

  const confirmar = () => {
    if (!carrito.length) {
      toast.error("Agrega al menos un producto");
      return;
    }
    if (total > estudiante.presupuestoDiario) {
      toast.error("El pedido excede el presupuesto diario");
      return;
    }
    crearPedido({ estudianteId: estudiante.id, items: carrito, total, kcal });
    setCarrito([]);
    toast.success("Preorden enviada al quiosco 🎉");
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">App de padres</p>
          <h1 className="text-3xl">Lonchera de hoy</h1>
        </div>
        <div className="flex gap-2">
          {estudiantes.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setActivoId(e.id);
                setCarrito([]);
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                e.id === estudiante.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary"
              }`}
            >
              {e.nombre.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="pedido">
        <TabsList>
          <TabsTrigger value="pedido">Preordenar</TabsTrigger>
          <TabsTrigger value="perfil">Perfil de salud</TabsTrigger>
          <TabsTrigger value="carnet">Carnet QR</TabsTrigger>
        </TabsList>

        <TabsContent value="pedido" className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <section className="surface-card p-5">
              <h2 className="flex items-center gap-2 text-lg">
                <Sparkles className="size-5 text-accent" /> Combos sugeridos por el recomendador
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Optimizados por meta calórica ({meta} kcal), presupuesto (S/{" "}
                {estudiante.presupuestoDiario.toFixed(2)}) y alergias.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {combos.map((c, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Match {Math.round(c.score)}%</Badge>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {c.kcal} kcal
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm">
                      {c.items.map((it) => (
                        <li key={it.id}>
                          {it.emoji} {it.nombre}
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => setCarrito(c.items.map((x) => x.id))}
                    >
                      Usar combo · S/ {c.total.toFixed(2)}
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-card p-5">
              <h2 className="text-lg">Catálogo del quiosco</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {PRODUCTOS.map((p) => {
                  const apto = esApto(p, estudiante);
                  const sel = carrito.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggle(p)}
                      className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                        sel ? "border-primary bg-primary/10" : "border-border bg-card"
                      } ${!apto ? "opacity-55" : "hover:-translate-y-0.5 hover:shadow-soft"}`}
                    >
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{p.nombre}</span>
                        <span className="block text-xs text-muted-foreground">
                          {p.kcal} kcal · {p.proteina}g prot · S/ {p.precio.toFixed(2)}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-1">
                          {!p.saludable && <Badge variant="destructive">Ultraprocesado</Badge>}
                          {!apto && (
                            <Badge variant="outline" className="gap-1">
                              <AlertTriangle className="size-3" /> Alergia
                            </Badge>
                          )}
                        </span>
                      </span>
                      {sel && <Check className="size-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="surface-card p-5">
              <h2 className="text-lg">Resumen</h2>
              {items.length === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selecciona productos o usa un combo sugerido.
                </p>
              )}
              <ul className="mt-3 space-y-2 text-sm">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between">
                    <span>
                      {i.emoji} {i.nombre}
                    </span>
                    <span className="font-semibold">S/ {i.precio.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Balance calórico</span>
                  <span className="font-semibold">
                    {kcal} / {meta} kcal
                  </span>
                </div>
                <Progress value={Math.min(100, (kcal / meta) * 100)} />
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Wallet className="size-4" /> Presupuesto
                  </span>
                  <span
                    className={`font-semibold ${total > estudiante.presupuestoDiario ? "text-destructive" : ""}`}
                  >
                    S/ {total.toFixed(2)} / {estudiante.presupuestoDiario.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button className="mt-5 w-full" onClick={confirmar}>
                Confirmar preorden
              </Button>
            </div>

            {pedidoHoy && (
              <div className="surface-card p-5 text-center">
                <p className="text-sm font-semibold text-primary">Pedido activo en el quiosco</p>
                <div className="mt-3 flex justify-center">
                  <QrCode value={estudiante.qr} size={140} />
                </div>
                <p className="mt-2 font-mono text-xs text-muted-foreground">{estudiante.qr}</p>
                <Badge className="mt-3" variant="secondary">
                  {pedidoHoy.estado} · {pedidoHoy.kcal} kcal
                </Badge>
              </div>
            )}
          </aside>
        </TabsContent>

        <TabsContent value="perfil" className="mt-6">
          <div className="surface-card max-w-2xl space-y-6 p-6">
            <div>
              <h2 className="text-lg">{estudiante.nombre}</h2>
              <p className="text-sm text-muted-foreground">
                {estudiante.grado} · {estudiante.edad} años · {estudiante.peso} kg
              </p>
            </div>

            <div>
              <Label className="mb-2 block">
                Presupuesto diario: S/ {estudiante.presupuestoDiario.toFixed(2)}
              </Label>
              <Slider
                value={[estudiante.presupuestoDiario]}
                min={5}
                max={25}
                step={0.5}
                onValueChange={([v]) =>
                  actualizarEstudiante({ ...estudiante, presupuestoDiario: v ?? 10 })
                }
              />
            </div>

            <div>
              <Label className="mb-2 block">Nivel de actividad física</Label>
              <div className="flex gap-2">
                {(["baja", "media", "alta"] as const).map((a) => (
                  <Button
                    key={a}
                    variant={estudiante.actividad === a ? "default" : "outline"}
                    size="sm"
                    onClick={() => actualizarEstudiante({ ...estudiante, actividad: a })}
                  >
                    {a}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Alergias e intolerancias</Label>
              <div className="space-y-3">
                {ALERGENOS.map((a) => (
                  <div key={a} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{a}</span>
                    <Switch
                      checked={estudiante.alergias.includes(a)}
                      onCheckedChange={(on) =>
                        actualizarEstudiante({
                          ...estudiante,
                          alergias: on
                            ? [...estudiante.alergias, a]
                            : estudiante.alergias.filter((x) => x !== a),
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-secondary/50 p-4 text-sm">
              Meta calórica del recreo calculada: <strong>{meta} kcal</strong> (referencia OMS por
              edad y actividad).
            </div>
          </div>
        </TabsContent>

        <TabsContent value="carnet" className="mt-6">
          <div className="surface-card mx-auto max-w-sm overflow-hidden">
            <div className="hero-gradient p-5 text-primary-foreground">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-90">
                Fotocheck digital
              </p>
              <h2 className="text-2xl">{estudiante.nombre}</h2>
              <p className="text-sm opacity-90">{estudiante.grado}</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6">
              <QrCode value={estudiante.qr} size={180} />
              <p className="font-mono text-sm">{estudiante.qr}</p>
              <p className="text-center text-xs text-muted-foreground">
                El personal del quiosco escanea este código para entregar la lonchera sin efectivo.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
