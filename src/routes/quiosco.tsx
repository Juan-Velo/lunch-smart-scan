import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import {
  AlertTriangle,
  CheckCircle2,
  PackagePlus,
  ScanLine,
  ShieldCheck,
  Timer,
  Boxes,
  Plus,
  Minus,
  BarChart3,
  LogOut,
  LogIn,
  Lock,
  Mail,
  Store as StoreIcon,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
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
import type { Alergeno, Producto } from "@/lib/lonchera-data";

export const Route = createFileRoute("/quiosco")({
  head: () => ({
    meta: [
      { title: "POS Quiosco — Despacho express y Analítica | NutriControl" },
      {
        name: "description",
        content:
          "Módulo POS de quiosco escolar con Login de concesionario, escáner QR, gestión de stock y acceso a gráficos predictivos de demanda.",
      },
      { property: "og:title", content: "POS Quiosco — NutriControl" },
      {
        property: "og:description",
        content: "Escaneo de QR, login de concesionario, despacho y gráficos analíticos generados.",
      },
    ],
  }),
  component: QuioscoPage,
});

const ALERGENOS_LIST: Alergeno[] = ["gluten", "lactosa", "frutos secos", "huevo", "mariscos"];

const SEMANA_DATOS = [
  { dia: "Lun", kcal: 420, meta: 430, despacho: 12 },
  { dia: "Mar", kcal: 455, meta: 430, despacho: 10 },
  { dia: "Mié", kcal: 398, meta: 430, despacho: 9 },
  { dia: "Jue", kcal: 441, meta: 430, despacho: 8 },
  { dia: "Vie", kcal: 470, meta: 430, despacho: 7 },
];

const PREVISION_DATOS = [
  { dia: "Lun", raciones: 128 },
  { dia: "Mar", raciones: 134 },
  { dia: "Mié", raciones: 121 },
  { dia: "Jue", raciones: 142 },
  { dia: "Vie", raciones: 156 },
];

export type OperadorQuiosco = {
  nombre: string;
  email: string;
  quiosco: string;
  colegio: string;
  turno: "Mañana" | "Tarde";
};

const OPERADOR_DEFAULT: OperadorQuiosco = {
  nombre: "Lic. Sandra Quiroz",
  email: "quiosco@sanpatricio.edu.pe",
  quiosco: "Quiosco Central A",
  colegio: "Colegio San Patricio",
  turno: "Mañana",
};

function QuioscoPage() {
  const {
    estudiantes,
    pedidos,
    productos,
    entregarPedido,
    agregarProducto,
    actualizarStockProducto,
  } = useStore();

  // Estado de Autenticación del Operador del Quiosco
  const [operador, setOperador] = useState<OperadorQuiosco | null>(OPERADOR_DEFAULT);
  const [loginEmail, setLoginEmail] = useState("quiosco@sanpatricio.edu.pe");
  const [loginPassword, setLoginPassword] = useState("••••••••");
  const [loginTurno, setLoginTurno] = useState<"Mañana" | "Tarde">("Mañana");

  const [codigo, setCodigo] = useState("");
  const [activo, setActivo] = useState<string | null>(null);
  const [modalProdAbierto, setModalProdAbierto] = useState(false);
  const [tabPrincipal, setTabPrincipal] = useState<"despacho" | "inventario" | "graficos">(
    "despacho",
  );

  // Formulario nuevo producto
  const [prodNombre, setProdNombre] = useState("");
  const [prodCategoria, setProdCategoria] = useState<"Principal" | "Fruta" | "Bebida" | "Snack">(
    "Principal",
  );
  const [prodPrecio, setProdPrecio] = useState(7.5);
  const [prodStock, setProdStock] = useState(25);
  const [prodKcal, setProdKcal] = useState(320);
  const [prodProt, setProdProt] = useState(18);
  const [prodSaludable, setProdSaludable] = useState(true);
  const [prodAlergenos, setProdAlergenos] = useState<Alergeno[]>([]);
  const [prodEmoji, setProdEmoji] = useState("🥗");

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
      toast.error("QR sin preorden activa para hoy");
      setActivo(null);
      return;
    }
    setActivo(pedido.id);
    setCodigo("");
    toast.success(`¡Pedido de ${est!.nombre} validado instantáneamente! ⚡`);
  };

  const pedidoActivo = pedidos.find((p) => p.id === activo);
  const estActivo = estudiantes.find((e) => e.id === pedidoActivo?.estudianteId);

  const handleLoginOperador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast.error("Ingresa el correo del concesionario");
      return;
    }
    setOperador({
      nombre: "Lic. Sandra Quiroz",
      email: loginEmail.trim(),
      quiosco: "Quiosco Central A",
      colegio: "Colegio San Patricio",
      turno: loginTurno,
    });
    toast.success("¡Turno iniciado con éxito en el POS Quiosco! 🚀");
  };

  const handleLogoutOperador = () => {
    setOperador(null);
    setActivo(null);
    toast.info("Turno cerrado en el POS Quiosco.");
  };

  const guardarNuevoProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNombre.trim()) {
      toast.error("Ingresa el nombre del producto");
      return;
    }

    const nuevo: Producto = {
      id: `p${Date.now()}`,
      nombre: prodNombre.trim(),
      categoria: prodCategoria,
      kcal: prodKcal,
      proteina: prodProt,
      carbos: 35,
      grasa: 8,
      azucar: prodSaludable ? 4 : 25,
      precio: prodPrecio,
      stock: prodStock,
      alergenos: prodAlergenos,
      saludable: prodSaludable,
      emoji: prodEmoji,
    };

    agregarProducto(nuevo);
    setModalProdAbierto(false);
    toast.success(`Producto "${nuevo.nombre}" agregado al inventario del quiosco.`);

    // Reset
    setProdNombre("");
    setProdAlergenos([]);
  };

  // Cálculo de macronutrientes acumulados
  const macros = pedidos.flatMap((p) =>
    p.items.map((id) => productos.find((x) => x.id === id)!).filter(Boolean),
  );
  const suma = (k: "proteina" | "carbos" | "grasa" | "azucar") =>
    macros.reduce((s, m) => s + (m[k] ?? 0), 0);
  const totalMacros = suma("proteina") + suma("carbos") + suma("grasa") || 1;

  return (
    <AppShell>
      {/* ========================================================= */}
      {/* CASO 1: CONCESIONARIO NO AUTENTICADO -> LOGIN QUIOSCO */}
      {/* ========================================================= */}
      {!operador ? (
        <div className="mx-auto max-w-md surface-card p-8 animate-in fade-in duration-300">
          <div className="text-center space-y-2">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl hero-gradient text-4xl shadow-md">
              🏪
            </div>
            <h1 className="text-2xl font-display font-bold">Módulo POS Quiosco</h1>
            <p className="text-xs text-muted-foreground">
              Acceso restringido para concesionarios y personal de cocina del Colegio San Patricio.
            </p>
          </div>

          <form onSubmit={handleLoginOperador} className="mt-6 space-y-4 text-xs">
            <div>
              <Label className="mb-1 block font-semibold">Correo del Concesionario / Operador</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="quiosco@sanpatricio.edu.pe"
                  className="pl-9 text-xs h-9"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="mb-1 block font-semibold">PIN / Contraseña de Despacho</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 text-xs h-9"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="mb-1 block font-semibold">Turno de Atención</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["Mañana", "Tarde"] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={loginTurno === t ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs font-semibold"
                    onClick={() => setLoginTurno(t)}
                  >
                    Turno {t} (Recreo)
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full font-bold h-10 text-xs gap-1.5 shadow-md">
              <LogIn className="size-4" /> Iniciar Turno en Quiosco
            </Button>

            <div className="pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOperador(OPERADOR_DEFAULT);
                  toast.success("¡Turno iniciado como Lic. Sandra Quiroz!");
                }}
                className="w-full h-8 text-[11px] font-semibold border-primary/40 text-primary hover:bg-primary/5"
              >
                ⚡ Acceso Rápido Concesionario (Demo)
              </Button>
            </div>
          </form>

          <div className="mt-6 rounded-xl bg-secondary/40 p-3 text-center text-[11px] text-muted-foreground">
            🔒 Punto de Venta Escolar seguro · Despacho por código QR sin manejo de efectivo.
          </div>
        </div>
      ) : (
        /* ========================================================= */
        /* CASO 2: OPERADOR AUTENTICADO -> SISTEMA COMPLETO POS QUIOSCO */
        /* ========================================================= */
        <div className="space-y-6">
          {/* Header Superior del Operador */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg hero-gradient text-xs text-white">
                  🏪
                </span>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {operador.quiosco} · {operador.colegio}
                </p>
                <Badge variant="secondary" className="gap-1 text-[10px] bg-emerald-100 text-emerald-800">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> En Línea ({operador.turno})
                </Badge>
              </div>
              <h1 className="text-2xl font-display font-bold">
                Despacho y Operación del Quiosco
              </h1>
              <p className="text-xs text-muted-foreground">
                Operador a cargo: <strong>{operador.nombre}</strong> ({operador.email})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* BOTÓN DESTACADO: IR A GRÁFICOS GENERADOS */}
              <Button
                variant={tabPrincipal === "graficos" ? "default" : "outline"}
                onClick={() => setTabPrincipal("graficos")}
                className="gap-1.5 shadow-sm border-primary/40 text-xs font-bold"
              >
                <BarChart3 className="size-4 text-primary" />
                <span>📊 Ir a Gráficos Generados</span>
              </Button>

              <Dialog open={modalProdAbierto} onOpenChange={setModalProdAbierto}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <PackagePlus className="size-3.5" />
                    <span>+ Nuevo Producto</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-display text-xl">
                      <span className="flex size-8 items-center justify-center rounded-lg hero-gradient text-sm">
                        📦
                      </span>
                      Registro de Producto en Inventario
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Ingresa los datos nutricionales, precio y estado saludable del producto.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={guardarNuevoProducto} className="space-y-4 pt-2 text-xs">
                    <div className="grid grid-cols-[3rem_1fr] gap-2">
                      <div>
                        <Label className="mb-1 block font-semibold">Emoji</Label>
                        <Input
                          value={prodEmoji}
                          onChange={(e) => setProdEmoji(e.target.value)}
                          className="text-center text-lg"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block font-semibold">Nombre del producto</Label>
                        <Input
                          placeholder="Ej. Sándwich de Pollo y Palta"
                          value={prodNombre}
                          onChange={(e) => setProdNombre(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="mb-1 block font-semibold">Categoría</Label>
                        <select
                          value={prodCategoria}
                          onChange={(e) =>
                            setProdCategoria(
                              e.target.value as "Principal" | "Fruta" | "Bebida" | "Snack",
                            )
                          }
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-medium"
                        >
                          <option value="Principal">Principal (Wrap/Bowl)</option>
                          <option value="Fruta">Fruta Fresca</option>
                          <option value="Bebida">Bebida Natural</option>
                          <option value="Snack">Snack Saludable</option>
                        </select>
                      </div>
                      <div>
                        <Label className="mb-1 block font-semibold">Precio (S/.)</Label>
                        <Input
                          type="number"
                          step={0.5}
                          value={prodPrecio}
                          onChange={(e) => setProdPrecio(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="mb-1 block font-semibold">Stock</Label>
                        <Input
                          type="number"
                          value={prodStock}
                          onChange={(e) => setProdStock(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block font-semibold">Kcal</Label>
                        <Input
                          type="number"
                          value={prodKcal}
                          onChange={(e) => setProdKcal(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block font-semibold">Prot (g)</Label>
                        <Input
                          type="number"
                          value={prodProt}
                          onChange={(e) => setProdProt(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-2">
                      <Label className="block font-semibold">Estado Nutricional Certificado</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">
                          {prodSaludable
                            ? "✅ 100% Saludable (Sin Octógonos)"
                            : "⚠️ Contiene Octógonos"}
                        </span>
                        <input
                          type="checkbox"
                          checked={prodSaludable}
                          onChange={(e) => setProdSaludable(e.target.checked)}
                          className="size-4 accent-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-1.5 block font-semibold">Contiene alérgenos:</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {ALERGENOS_LIST.map((a) => {
                          const sel = prodAlergenos.includes(a);
                          return (
                            <button
                              key={a}
                              type="button"
                              onClick={() =>
                                setProdAlergenos((prev) =>
                                  sel ? prev.filter((x) => x !== a) : [...prev, a],
                                )
                              }
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize transition ${
                                sel
                                  ? "bg-destructive text-destructive-foreground"
                                  : "border border-border bg-secondary text-secondary-foreground"
                              }`}
                            >
                              {sel ? `✓ ${a}` : a}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Guardar en Catálogo del Quiosco
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Botón Logout Operador */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogoutOperador}
                className="gap-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Cerrar turno"
              >
                <LogOut className="size-3.5" />
                <span>Cerrar Turno</span>
              </Button>
            </div>
          </div>

          <Tabs
            value={tabPrincipal}
            onValueChange={(v) => setTabPrincipal(v as any)}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 max-w-md h-10">
              <TabsTrigger value="despacho" className="gap-1.5 text-xs">
                <ScanLine className="size-4" /> Despacho QR
              </TabsTrigger>
              <TabsTrigger value="inventario" className="gap-1.5 text-xs">
                <Boxes className="size-4" /> Inventario ({productos.length})
              </TabsTrigger>
              <TabsTrigger value="graficos" className="gap-1.5 text-xs font-bold">
                <BarChart3 className="size-4 text-primary" /> Gráficos Generados
              </TabsTrigger>
            </TabsList>

            {/* ========================================================= */}
            {/* PESTAÑA 1: DESPACHO QR EXPRESS */}
            {/* ========================================================= */}
            <TabsContent value="despacho" className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
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
                <section className="surface-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-display font-bold">Escáner QR</h2>
                    <Badge variant="outline" className="text-[10px]">
                      Cámara Activa
                    </Badge>
                  </div>
                  <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-secondary/30">
                    <div className="text-center">
                      <ScanLine className="mx-auto size-12 animate-pulse text-primary" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Apunta el carnet del alumno frente a la cámara
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código manual (ej. LNC-3B-0281)"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && escanear(codigo)}
                      className="text-xs h-9"
                    />
                    <Button onClick={() => escanear(codigo)} className="h-9 text-xs">
                      Validar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="w-full text-[11px] font-semibold text-muted-foreground">
                      Simular escaneo rápido:
                    </span>
                    {estudiantes.map((e) => (
                      <Button
                        key={e.id}
                        size="sm"
                        variant="outline"
                        onClick={() => escanear(e.qr)}
                        className="text-xs h-7"
                      >
                        👦 {e.nombre.split(" ")[0]} ({e.qr})
                      </Button>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  {pedidoActivo && estActivo && (
                    <div className="surface-card overflow-hidden animate-in fade-in">
                      <div className="hero-gradient flex items-center gap-2 p-4 text-primary-foreground">
                        <CheckCircle2 className="size-5" />
                        <span className="font-display text-lg">Pedido Validado en Sistema</span>
                      </div>
                      <div className="space-y-3 p-5 text-sm">
                        <div>
                          <p className="font-display text-xl font-bold">{estActivo.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {estActivo.grado} · Fotocheck: {estActivo.qr}
                          </p>
                        </div>
                        {estActivo.alergias.length > 0 && (
                          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive font-semibold">
                            <AlertTriangle className="size-4" />
                            Alergias registradas: {estActivo.alergias.join(", ")}
                          </div>
                        )}
                        <ul className="space-y-2">
                          {pedidoActivo.items.map((id) => {
                            const p = productos.find((x) => x.id === id)!;
                            if (!p) return null;
                            return (
                              <li
                                key={id}
                                className="flex items-center gap-3 rounded-xl bg-secondary/40 p-2.5 text-xs"
                              >
                                <span className="text-xl">{p.emoji}</span>
                                <span className="flex-1 font-semibold">{p.nombre}</span>
                                <span className="text-muted-foreground">{p.kcal} kcal</span>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="flex items-center justify-between border-t border-border pt-2">
                          <span className="text-xs text-muted-foreground">Total prepagado</span>
                          <span className="font-display text-xl font-bold text-primary">
                            S/ {pedidoActivo.total.toFixed(2)}
                          </span>
                        </div>
                        {pedidoActivo.estado === "entregado" ? (
                          <Badge variant="secondary" className="w-full justify-center py-2 text-xs">
                            ✓ Entregado en {pedidoActivo.segundosDespacho} segundos
                          </Badge>
                        ) : (
                          <Button
                            className="w-full py-6 font-display text-base font-bold shadow-lg"
                            onClick={() => {
                              const s = 6 + Math.floor(Math.random() * 5);
                              entregarPedido(pedidoActivo.id, s);
                              toast.success(
                                `¡Lonchera entregada a ${estActivo.nombre.split(" ")[0]} en ${s}s! 🚀`,
                              );
                            }}
                          >
                            ⚡ Marcar como entregado ({estActivo.nombre.split(" ")[0]})
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="surface-card p-5">
                    <h2 className="text-base font-display font-bold">Cola de Preparación del Recreo</h2>
                    <ul className="mt-3 space-y-2">
                      {pendientes.length === 0 && (
                        <li className="text-xs text-muted-foreground italic">
                          Sin pedidos pendientes. Todas las loncheras fueron despachadas.
                        </li>
                      )}
                      {pendientes.map((p) => {
                        const e = estudiantes.find((x) => x.id === p.estudianteId);
                        return (
                          <li
                            key={p.id}
                            className="flex items-center gap-3 rounded-xl border border-border p-3 text-xs"
                          >
                            <span className="font-mono text-muted-foreground">{e?.qr}</span>
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
            </TabsContent>

            {/* ========================================================= */}
            {/* PESTAÑA 2: GESTIÓN DE INVENTARIO Y STOCK */}
            {/* ========================================================= */}
            <TabsContent value="inventario">
              <div className="surface-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="text-xl font-display font-bold">Inventario de Raciones y Stock</h2>
                    <p className="text-xs text-muted-foreground">
                      Control en tiempo real de productos disponibles para despacho escolar.
                    </p>
                  </div>
                  <Button onClick={() => setModalProdAbierto(true)} size="sm" className="text-xs">
                    + Agregar Producto
                  </Button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border text-[11px] font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="py-3 px-2">Producto</th>
                        <th className="py-3 px-2">Categoría</th>
                        <th className="py-3 px-2">Precio</th>
                        <th className="py-3 px-2">Kcal / Prot</th>
                        <th className="py-3 px-2">Estado Nutricional</th>
                        <th className="py-3 px-2">Stock Actual</th>
                        <th className="py-3 px-2 text-right">Ajuste</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {productos.map((p) => (
                        <tr key={p.id} className="hover:bg-secondary/30">
                          <td className="py-3 px-2 font-medium">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{p.emoji}</span>
                              <div>
                                <p className="font-semibold">{p.nombre}</p>
                                {p.alergenos.length > 0 && (
                                  <span className="text-[10px] text-destructive">
                                    Alérgenos: {p.alergenos.join(", ")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">{p.categoria}</td>
                          <td className="py-3 px-2 font-bold">S/ {p.precio.toFixed(2)}</td>
                          <td className="py-3 px-2 text-muted-foreground">
                            {p.kcal} kcal · {p.proteina}g prot
                          </td>
                          <td className="py-3 px-2">
                            {p.saludable ? (
                              <Badge variant="secondary" className="gap-1 text-[10px]">
                                <ShieldCheck className="size-3 text-primary" /> Saludable
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">
                                Octógonos
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-2 font-bold">
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs ${
                                (p.stock ?? 20) < 15
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-emerald-100 text-emerald-900"
                              }`}
                            >
                              {p.stock ?? 20} un.
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="outline"
                                className="size-7"
                                onClick={() => {
                                  actualizarStockProducto(p.id, 5);
                                  toast.success(`Stock de ${p.nombre} aumentado (+5)`);
                                }}
                              >
                                <Plus className="size-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="size-7 text-destructive"
                                onClick={() => {
                                  actualizarStockProducto(p.id, -5);
                                  toast.success(`Stock de ${p.nombre} reducido (-5)`);
                                }}
                              >
                                <Minus className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* ========================================================= */}
            {/* PESTAÑA 3: GRÁFICOS GENERADOS & ANALÍTICA DE DEMANDA */}
            {/* ========================================================= */}
            <TabsContent value="graficos" className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h2 className="text-xl font-display font-bold flex items-center gap-2">
                    <BarChart3 className="size-5 text-primary" /> Gráficos Generados del Quiosco
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Analítica descriptiva y predictiva de demanda escolar para optimización de stock.
                  </p>
                </div>
                <Link to="/reportes">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                    <span>Ver Dashboard Completo</span>
                    <ArrowUpRight className="size-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Gráfica 1: Consumo Calórico vs Meta OMS */}
                <section className="surface-card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-display">
                        Consumo Calórico Diario vs. Meta OMS
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Promedio por día de la semana escolar (kcal)
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      430 kcal Meta
                    </Badge>
                  </div>

                  <div className="mt-4 h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SEMANA_DATOS}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="dia" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                        <Tooltip />
                        <Bar
                          dataKey="kcal"
                          name="Kcal Consumidas"
                          fill="var(--primary)"
                          radius={[6, 6, 0, 0]}
                        />
                        <Bar
                          dataKey="meta"
                          name="Meta OMS"
                          fill="var(--secondary-foreground)"
                          opacity={0.35}
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Gráfica 2: Previsión Predictiva de Raciones */}
                <section className="surface-card p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-display">
                        Previsión Predictiva de Demanda
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Raciones estimadas para compras y producción
                      </p>
                    </div>
                    <Badge variant="outline" className="gap-1 text-xs text-primary border-primary">
                      <TrendingUp className="size-3" /> +12% Demanda
                    </Badge>
                  </div>

                  <div className="mt-4 h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={PREVISION_DATOS}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="dia" stroke="var(--muted-foreground)" fontSize={12} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="raciones"
                          name="Raciones Previstas"
                          stroke="var(--primary)"
                          strokeWidth={3}
                          dot={{ fill: "var(--primary)", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              {/* Distribución de Macronutrientes y KPIs del Quiosco */}
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="surface-card p-5 space-y-4">
                  <h3 className="text-sm font-bold font-display">
                    Distribución de Macronutrientes en Recreo
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between">
                        <span>Proteínas</span>
                        <span className="font-semibold">{suma("proteina")} g</span>
                      </div>
                      <Progress
                        value={(suma("proteina") / totalMacros) * 100}
                        className="mt-1 h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>Carbohidratos complejos</span>
                        <span className="font-semibold">{suma("carbos")} g</span>
                      </div>
                      <Progress
                        value={(suma("carbos") / totalMacros) * 100}
                        className="mt-1 h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>Grasas saludables</span>
                        <span className="font-semibold">{suma("grasa")} g</span>
                      </div>
                      <Progress
                        value={(suma("grasa") / totalMacros) * 100}
                        className="mt-1 h-2"
                      />
                    </div>
                  </div>
                </section>

                <section className="surface-card p-5 space-y-4">
                  <h3 className="text-sm font-bold font-display">Indicadores Operativos del Piloto</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-secondary/50 p-3 text-center">
                      <p className="text-[11px] text-muted-foreground">Velocidad Despacho</p>
                      <p className="text-xl font-display font-bold text-primary">{promedio}s</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Meta: &lt;10s</span>
                    </div>
                    <div className="rounded-xl bg-secondary/50 p-3 text-center">
                      <p className="text-[11px] text-muted-foreground">Reducción Merma</p>
                      <p className="text-xl font-display font-bold text-primary">-31%</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Ahorro insumos</span>
                    </div>
                  </div>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AppShell>
  );
}
