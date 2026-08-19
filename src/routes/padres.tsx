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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  esApto,
  metaKcalRecreo,
  recomendarCombos,
  type Alergeno,
  type Estudiante,
  type Producto,
} from "@/lib/lonchera-data";
import { useStore } from "@/lib/store";
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  Check,
  CheckCircle2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  QrCode as QrIcon,
  Smartphone,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
  Utensils,
  Volume2,
  Wallet,
  Wifi,
  Battery,
  Activity,
  X,
  School,
} from "lucide-react";

export const Route = createFileRoute("/padres")({
  head: () => ({
    meta: [
      { title: "Vista Padres (Móvil) — Preordena la lonchera saludable | NutriControl" },
      {
        name: "description",
        content:
          "App móvil para padres de familia con Login, Registro, Logout, gestión nutricional y notificaciones push de despacho escolar.",
      },
      { property: "og:title", content: "Vista Padres (Móvil) — NutriControl" },
      {
        property: "og:description",
        content: "App móvil para padres con login, registro, logout y despacho QR.",
      },
    ],
  }),
  component: PadresPage,
});

const ALERGENOS: Alergeno[] = ["gluten", "lactosa", "frutos secos", "huevo", "mariscos"];
const RESTRICCIONES_OPCIONES = [
  "sin azúcar añadida",
  "bajo en sodio",
  "vegetariano",
  "sin colorantes artificiales",
];

const DIAS_SEMANA = [
  { dia: "Lunes", fecha: "17 Ago" },
  { dia: "Martes", fecha: "18 Ago" },
  { dia: "Miércoles (Hoy)", fecha: "19 Ago" },
  { dia: "Jueves", fecha: "20 Ago" },
  { dia: "Viernes", fecha: "21 Ago" },
];

function playNotificationChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    /* Audio fallback */
  }
}

function PadresPage() {
  const {
    usuario,
    login,
    registro,
    logout,
    estudiantes,
    pedidos,
    productos,
    actualizarEstudiante,
    agregarEstudiante,
    crearPedido,
    entregarPedido,
  } = useStore();

  const [activoId, setActivoId] = useState(estudiantes[0]?.id ?? "e1");
  const estudiante = estudiantes.find((e) => e.id === activoId) ?? estudiantes[0]!;
  const [carrito, setCarrito] = useState<string[]>([]);
  const [tabActiva, setTabActiva] = useState("pedido");
  const [vistaMockup, setVistaMockup] = useState(true);

  // Estados de Auth Form (Login y Registro)
  const [authTab, setAuthTab] = useState<"login" | "registro">("login");
  const [loginEmail, setLoginEmail] = useState("padres@nutricontrol.pe");
  const [loginPassword, setLoginPassword] = useState("••••••••");
  const [regNombre, setRegNombre] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Estado de simulación de Notificación Push
  const [notificacionPush, setNotificacionPush] = useState<{
    visible: boolean;
    titulo: string;
    mensaje: string;
    hora: string;
    detalles?: string;
  } | null>(null);

  // Formulario Onboarding / Nuevo Alumno
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoGrado, setNuevoGrado] = useState("3ro Primaria A");
  const [nuevaEdad, setNuevaEdad] = useState(8);
  const [nuevoPeso, setNuevoPeso] = useState(27);
  const [nuevaTalla, setNuevaTalla] = useState(128);
  const [nuevaActividad, setNuevaActividad] = useState<"baja" | "media" | "alta">("media");
  const [nuevasAlergias, setNuevasAlergias] = useState<Alergeno[]>([]);
  const [nuevasRestricciones, setNuevasRestricciones] = useState<string[]>([]);
  const [nuevoPresupuesto, setNuevoPresupuesto] = useState(15);

  // Plan semanal
  const [planSemanal, setPlanSemanal] = useState<Record<string, string>>({
    Lunes: "p1",
    Martes: "p2",
    "Miércoles (Hoy)": "p3",
    Jueves: "p1",
    Viernes: "p4",
  });

  const meta = metaKcalRecreo(estudiante);
  const combos = useMemo(() => recomendarCombos(estudiante), [estudiante]);
  const items = carrito.map((id) => productos.find((p) => p.id === id)!).filter(Boolean);
  const kcal = items.reduce((s, i) => s + i.kcal, 0);
  const total = items.reduce((s, i) => s + i.precio, 0);
  const pedidoHoy = pedidos.find(
    (p) => p.estudianteId === estudiante.id && p.estado !== "entregado",
  );
  const ultimoPedidoEntregado = pedidos.find(
    (p) => p.estudianteId === estudiante.id && p.estado === "entregado",
  );

  // Cálculo de IMC infantil
  const tallaM = (estudiante.talla ?? 128) / 100;
  const imc = (estudiante.peso / (tallaM * tallaM)).toFixed(1);

  const toggle = (p: Producto) => {
    if (!esApto(p, estudiante)) {
      toast.error(`Bloqueado preventivamente: contiene ${p.alergenos.join(", ")}`);
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
    toast.success(`¡Preorden de ${estudiante.nombre.split(" ")[0]} enviada al quiosco! 🎉`);
  };

  const simularNotificacionEntrega = () => {
    playNotificationChime();

    const targetPedido = pedidoHoy ?? pedidos[0];
    const segundos = 7 + Math.floor(Math.random() * 4);

    if (targetPedido && targetPedido.estado !== "entregado") {
      entregarPedido(targetPedido.id, segundos);
    }

    const itemsTexto = (targetPedido?.items ?? ["p1", "p6"])
      .map((id) => productos.find((x) => x.id === id)?.nombre)
      .filter(Boolean)
      .join(" + ");

    const nuevaNotif = {
      visible: true,
      titulo: `¡Lonchera de ${estudiante.nombre.split(" ")[0]} entregada! 🍱`,
      mensaje: `${estudiante.nombre.split(" ")[0]} recogió su lonchera en el quiosco en solo ${segundos} segundos.`,
      hora: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
      detalles: `Contenido: ${itemsTexto || "Combo Saludable"} · ${targetPedido?.kcal ?? 445} kcal consumidas. ¡Cero alérgenos!`,
    };

    setNotificacionPush(nuevaNotif);

    toast.success(`🔔 PUSH: ¡${estudiante.nombre.split(" ")[0]} recibió su lonchera!`, {
      description: `Despachado en ${segundos}s · ${targetPedido?.kcal ?? 445} kcal ingeridas`,
      duration: 6000,
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast.error("Ingresa tu correo electrónico");
      return;
    }
    login(loginEmail, "Familia Velo");
    toast.success(`¡Bienvenido de vuelta, Familia Velo! 👋`);
  };

  const handleRegistroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNombre.trim() || !regEmail.trim()) {
      toast.error("Completa tu nombre y correo");
      return;
    }
    registro(regNombre, regEmail);
    toast.success(`¡Cuenta de ${regNombre} creada con éxito! 🎉`);
  };

  const registrarNuevoEstudiante = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      toast.error("Ingresa el nombre del estudiante");
      return;
    }

    const id = `e${Date.now()}`;
    const codigoQr = `LNC-${nuevoGrado.slice(0, 2).replace(" ", "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const nuevo: Estudiante = {
      id,
      nombre: nuevoNombre.trim(),
      grado: nuevoGrado,
      edad: nuevaEdad,
      peso: nuevoPeso,
      talla: nuevaTalla,
      actividad: nuevaActividad,
      alergias: nuevasAlergias,
      gustos: ["frutas", "pollo"],
      restricciones: nuevasRestricciones,
      presupuestoDiario: nuevoPresupuesto,
      qr: codigoQr,
    };

    agregarEstudiante(nuevo);
    setActivoId(id);
    setModalNuevoAbierto(false);
    toast.success(`¡Perfil de ${nuevo.nombre} creado con éxito!`);

    setNuevoNombre("");
    setNuevasAlergias([]);
    setNuevasRestricciones([]);
  };

  return (
    <AppShell>
      {/* Barra de Controles Superiores */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg hero-gradient text-xs text-white">
              📱
            </span>
            <h1 className="text-2xl font-display">Vista Padres — NutriControl Mobile</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Acceso con Login/Logout, perfil del estudiante y despacho por QR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {usuario && (
            <Button
              onClick={simularNotificacionEntrega}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md animate-pulse"
            >
              <Bell className="size-4" />
              <span className="font-bold">🔔 Simular Notificación de Entrega</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setVistaMockup(!vistaMockup)}
            className="gap-1.5"
          >
            <Smartphone className="size-4 text-primary" />
            <span>{vistaMockup ? "Ver Pantalla Completa" : "Ver Marco Celular (390px)"}</span>
          </Button>
        </div>
      </div>

      {/* Contenedor Smartphone */}
      <div className={`mx-auto transition-all ${vistaMockup ? "max-w-[420px]" : "w-full"}`}>
        <div
          className={`relative overflow-hidden bg-background ${
            vistaMockup
              ? "rounded-[42px] border-[10px] border-slate-800 shadow-2xl ring-1 ring-black/10 min-h-[760px] pb-16"
              : "surface-card p-6"
          }`}
        >
          {/* Status Bar del Celular */}
          {vistaMockup && (
            <div className="sticky top-0 z-30 flex items-center justify-between bg-background/95 px-6 pt-3 pb-2 backdrop-blur-md">
              <span className="font-semibold text-xs text-foreground">09:41</span>
              <div className="h-4 w-24 rounded-full bg-slate-900" />
              <div className="flex items-center gap-1.5 text-foreground">
                <Wifi className="size-3.5" />
                <Battery className="size-3.5" />
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* CASO 1: USUARIO NO AUTENTICADO -> PANTALLA DE LOGIN / REGISTRO */}
          {/* ========================================================= */}
          {!usuario ? (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
              {/* Header Branding */}
              <div className="text-center space-y-2 pt-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl hero-gradient text-3xl shadow-lg">
                  🍱
                </div>
                <h2 className="text-2xl font-display font-bold">NutriControl Padres</h2>
                <p className="text-xs text-muted-foreground">
                  Ingresa para gestionar las loncheras de tus hijos en el Colegio San Patricio.
                </p>
              </div>

              {/* Selector de Login / Registro */}
              <div className="grid grid-cols-2 rounded-xl bg-secondary/60 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthTab("login")}
                  className={`rounded-lg py-2 transition ${
                    authTab === "login"
                      ? "bg-card text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab("registro")}
                  className={`rounded-lg py-2 transition ${
                    authTab === "registro"
                      ? "bg-card text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {authTab === "login" ? (
                /* FORMULARIO DE LOGIN */
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <Label className="mb-1 block font-semibold">Correo del Padre o Tutor</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="padres@nutricontrol.pe"
                        className="pl-9 text-xs h-9"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-1 block font-semibold">Contraseña</Label>
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

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked className="size-3.5 accent-primary" />
                      Recordarme
                    </label>
                    <a href="#olvido" className="text-primary hover:underline">
                      ¿Olvidaste tu clave?
                    </a>
                  </div>

                  <Button type="submit" className="w-full font-bold h-10 text-xs gap-1.5 shadow-md">
                    <LogIn className="size-4" /> Ingresar a mi Cuenta
                  </Button>

                  {/* Acceso Rápido Demo */}
                  <div className="pt-2 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        login("padres@nutricontrol.pe", "Familia Velo");
                        toast.success("¡Sesión iniciada con éxito! (Familia Velo)");
                      }}
                      className="w-full h-8 text-[11px] font-semibold border-primary/40 text-primary hover:bg-primary/5"
                    >
                      ✨ Acceso Rápido Demo (Familia Velo)
                    </Button>
                  </div>
                </form>
              ) : (
                /* FORMULARIO DE REGISTRO */
                <form onSubmit={handleRegistroSubmit} className="space-y-3 text-xs">
                  <div>
                    <Label className="mb-1 block font-semibold">Nombre de la Familia / Tutor</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value)}
                        placeholder="Ej. Familia Rodríguez"
                        className="pl-9 text-xs h-9"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-1 block font-semibold">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="tutor@ejemplo.com"
                        className="pl-9 text-xs h-9"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-1 block font-semibold">Crear Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Al menos 6 caracteres"
                        className="pl-9 text-xs h-9"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full font-bold h-10 text-xs gap-1.5 shadow-md">
                    <UserCheck className="size-4" /> Crear Cuenta y Continuar
                  </Button>
                </form>
              )}

              <div className="rounded-2xl bg-secondary/40 p-3 text-center text-[11px] text-muted-foreground">
                🔒 Acceso seguro cifrado y validado para padres del Colegio San Patricio.
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* CASO 2: USUARIO AUTENTICADO -> PORTAL COMPLETO DE PADRES */
            /* ========================================================= */
            <>
              {/* Banner de Notificación Push */}
              {notificacionPush?.visible && (
                <div className="relative z-40 mx-4 mt-2 animate-in slide-in-from-top duration-300">
                  <div className="rounded-2xl border border-primary/30 bg-card p-3.5 shadow-xl ring-2 ring-primary/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg hero-gradient text-xs">
                          🥗
                        </span>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                            NutriControl Push
                          </p>
                          <p className="text-xs font-semibold">{notificacionPush.titulo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">
                          {notificacionPush.hora}
                        </span>
                        <button
                          onClick={() => setNotificacionPush(null)}
                          className="rounded-full p-1 text-muted-foreground hover:bg-secondary"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-foreground">
                      {notificacionPush.mensaje}
                    </p>
                    {notificacionPush.detalles && (
                      <p className="mt-1 text-[11px] text-muted-foreground italic">
                        {notificacionPush.detalles}
                      </p>
                    )}
                    <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2">
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 className="size-3" /> Despacho validado en quiosco
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[11px] text-primary"
                        onClick={() => {
                          setTabActiva("carnet");
                          setNotificacionPush(null);
                        }}
                      >
                        Ver Fotocheck →
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Barra Superior del Usuario Autenticado con Botón Logout */}
              <div className="p-4 border-b border-border/50 bg-card/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-sm">
                      👤
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {usuario.colegio}
                      </p>
                      <h2 className="text-sm font-display font-bold leading-tight">
                        {usuario.nombre}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={simularNotificacionEntrega}
                      title="Probar sonido y notificación push"
                      className="flex size-8 items-center justify-center rounded-full bg-accent/20 text-accent transition hover:scale-105"
                    >
                      <Volume2 className="size-3.5 text-accent" />
                    </button>

                    {/* Botón de Logout directo en la barra */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        logout();
                        toast.info("Has cerrado sesión.");
                      }}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1"
                      title="Cerrar sesión"
                    >
                      <LogOut className="size-3.5" />
                      <span className="hidden sm:inline">Salir</span>
                    </Button>
                  </div>
                </div>

                {/* Selector de Hijos + Botón Onboarding */}
                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {estudiantes.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => {
                        setActivoId(e.id);
                        setCarrito([]);
                      }}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        e.id === estudiante.id
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <span>👦</span>
                      <span>{e.nombre.split(" ")[0]}</span>
                      {e.alergias.length > 0 && <span className="size-1.5 rounded-full bg-accent" />}
                    </button>
                  ))}

                  {/* Modal Onboarding */}
                  <Dialog open={modalNuevoAbierto} onOpenChange={setModalNuevoAbierto}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0 gap-1 rounded-full border-dashed text-xs"
                      >
                        <UserPlus className="size-3.5 text-primary" />
                        <span>+ Hijo</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-display">
                          <span className="flex size-7 items-center justify-center rounded-lg hero-gradient text-xs">
                            📋
                          </span>
                          Nuevo Alumno / Onboarding
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                          Ingresa los datos antropométricos y restricciones del estudiante.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={registrarNuevoEstudiante} className="space-y-3 pt-2 text-xs">
                        <div>
                          <Label className="mb-1 block font-semibold">Nombre completo</Label>
                          <Input
                            placeholder="Ej. Sofía Mendoza"
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            required
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="mb-1 block font-semibold">Grado y sección</Label>
                            <Input
                              value={nuevoGrado}
                              onChange={(e) => setNuevoGrado(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="mb-1 block font-semibold">Edad (años)</Label>
                            <Input
                              type="number"
                              min={3}
                              max={18}
                              value={nuevaEdad}
                              onChange={(e) => setNuevaEdad(Number(e.target.value))}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="mb-1 block font-semibold">Peso (kg)</Label>
                            <Input
                              type="number"
                              step={0.5}
                              value={nuevoPeso}
                              onChange={(e) => setNuevoPeso(Number(e.target.value))}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="mb-1 block font-semibold">Talla (cm)</Label>
                            <Input
                              type="number"
                              value={nuevaTalla}
                              onChange={(e) => setNuevaTalla(Number(e.target.value))}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="mb-1 block font-semibold">Actividad física</Label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(["baja", "media", "alta"] as const).map((a) => (
                              <Button
                                key={a}
                                type="button"
                                variant={nuevaActividad === a ? "default" : "outline"}
                                size="sm"
                                className="h-7 text-[11px] capitalize"
                                onClick={() => setNuevaActividad(a)}
                              >
                                {a}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="mb-1 block font-semibold">Alergias:</Label>
                          <div className="flex flex-wrap gap-1">
                            {ALERGENOS.map((a) => {
                              const sel = nuevasAlergias.includes(a);
                              return (
                                <button
                                key={a}
                                type="button"
                                onClick={() =>
                                  setNuevasAlergias((prev) =>
                                    sel ? prev.filter((x) => x !== a) : [...prev, a],
                                  )
                                }
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize transition ${
                                  sel
                                    ? "bg-destructive text-destructive-foreground"
                                    : "border border-border bg-secondary"
                                }`}
                              >
                                {sel ? `✓ ${a}` : a}
                              </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <Label className="mb-1 block font-semibold">
                            Presupuesto diario: S/ {nuevoPresupuesto.toFixed(2)}
                          </Label>
                          <Slider
                            value={[nuevoPresupuesto]}
                            min={5}
                            max={25}
                            step={0.5}
                            onValueChange={([v]) => setNuevoPresupuesto(v ?? 15)}
                          />
                        </div>

                        <Button type="submit" className="w-full h-8 text-xs font-semibold">
                          Guardar y Generar QR
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Sub-Tabs Principales de la Vista Padres */}
              <Tabs value={tabActiva} onValueChange={setTabActiva} className="px-4">
                <TabsList className="grid w-full grid-cols-4 h-9 mt-3">
                  <TabsTrigger value="pedido" className="text-xs">
                    Lonchera
                  </TabsTrigger>
                  <TabsTrigger value="planner" className="text-xs">
                    Semana
                  </TabsTrigger>
                  <TabsTrigger value="perfil" className="text-xs">
                    Salud
                  </TabsTrigger>
                  <TabsTrigger value="carnet" className="text-xs">
                    QR
                  </TabsTrigger>
                </TabsList>

                {/* PESTAÑA 1: LONCHERA DE HOY */}
                <TabsContent value="pedido" className="mt-4 space-y-4">
                  {pedidoHoy ? (
                    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                          Preorden activa en quiosco
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {pedidoHoy.hora}
                        </Badge>
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        Código: <span className="font-mono font-bold text-foreground">{estudiante.qr}</span> ·{" "}
                        {pedidoHoy.kcal} kcal
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={simularNotificacionEntrega}
                        className="mt-2 w-full h-7 text-[11px] gap-1 border-accent text-accent font-semibold"
                      >
                        <Bell className="size-3" /> Simular entrega del quiosco
                      </Button>
                    </div>
                  ) : ultimoPedidoEntregado ? (
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                        <span>Lonchera entregada hoy con éxito ({ultimoPedidoEntregado.kcal} kcal).</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Combos Recomendados Predictivos */}
                  <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-1.5 text-xs font-bold font-display">
                        <Sparkles className="size-3.5 text-accent" /> Combos Recomendados
                      </h3>
                      <Badge variant="outline" className="text-[10px]">
                        Meta {meta} kcal
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Personalizados por edad, IMC ({imc}) y alergias de {estudiante.nombre.split(" ")[0]}.
                    </p>

                    <div className="mt-3 grid gap-2">
                      {combos.slice(0, 2).map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-2.5 transition hover:bg-secondary/60"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <Badge variant="secondary" className="text-[9px] h-4">
                                Match {Math.round(c.score)}%
                              </Badge>
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                {c.kcal} kcal
                              </span>
                            </div>
                            <p className="text-xs font-medium">
                              {c.items.map((x) => `${x.emoji} ${x.nombre.split(" ")[0]}`).join(" + ")}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="h-7 text-xs font-bold px-3 shrink-0"
                            onClick={() => {
                              setCarrito(c.items.map((x) => x.id));
                              toast.success("¡Combo cargado al carrito!");
                            }}
                          >
                            S/ {c.total.toFixed(2)}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catálogo Interactivo de Productos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Catálogo de Raciones ({productos.length})
                      </h3>
                      <span className="text-[11px] text-muted-foreground">Toca para seleccionar</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {productos.map((p) => {
                        const apto = esApto(p, estudiante);
                        const sel = carrito.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => toggle(p)}
                            className={`flex flex-col justify-between rounded-2xl border p-2.5 text-left transition-all ${
                              sel
                                ? "border-primary bg-primary/10 ring-1 ring-primary shadow-sm"
                                : "border-border bg-card"
                            } ${!apto ? "opacity-50" : "active:scale-95"}`}
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <span className="text-2xl">{p.emoji}</span>
                                {sel ? (
                                  <Check className="size-4 text-primary font-bold" />
                                ) : !apto ? (
                                  <AlertTriangle className="size-3.5 text-destructive" />
                                ) : null}
                              </div>
                              <p className="mt-1 font-semibold text-xs line-clamp-1 leading-tight">
                                {p.nombre}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {p.kcal} kcal · {p.categoria}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="font-bold text-xs">S/ {p.precio.toFixed(2)}</span>
                              {!p.saludable && (
                                <span className="text-[9px] text-destructive font-semibold">
                                  Octógono
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resumen del Carrito & Confirmación */}
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold font-display">Resumen del Pedido</h3>
                      <span className="text-xs font-bold text-primary">
                        {items.length} ítems · S/ {total.toFixed(2)}
                      </span>
                    </div>

                    {items.length > 0 ? (
                      <div className="space-y-1 text-xs">
                        {items.map((it) => (
                          <div key={it.id} className="flex justify-between text-muted-foreground">
                            <span>
                              {it.emoji} {it.nombre}
                            </span>
                            <span>S/ {it.precio.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Selecciona productos o presiona "Usar combo" arriba.
                      </p>
                    )}

                    <div className="space-y-1.5 border-t border-border pt-2 text-xs">
                      <div className="flex justify-between">
                        <span>Balance calórico</span>
                        <span className="font-semibold">
                          {kcal} / {meta} kcal
                        </span>
                      </div>
                      <Progress value={Math.min(100, (kcal / meta) * 100)} className="h-2" />

                      <div className="flex justify-between pt-1">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Wallet className="size-3" /> Presupuesto diario
                        </span>
                        <span
                          className={`font-semibold ${
                            total > estudiante.presupuestoDiario ? "text-destructive" : ""
                          }`}
                        >
                          S/ {total.toFixed(2)} / {estudiante.presupuestoDiario.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full font-bold shadow-md"
                      disabled={items.length === 0}
                      onClick={confirmar}
                    >
                      Enviar Preorden al Quiosco (S/ {total.toFixed(2)})
                    </Button>
                  </div>
                </TabsContent>

                {/* PESTAÑA 2: PLAN SEMANAL ESCOLAR */}
                <TabsContent value="planner" className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold font-display flex items-center gap-1.5">
                        <CalendarCheck className="size-4 text-primary" /> Plan Escolar Semanal
                      </h3>
                      <Badge variant="outline" className="text-[10px]">
                        Lun a Vie
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Programa el menú de {estudiante.nombre.split(" ")[0]} para toda la semana.
                    </p>

                    <div className="space-y-2 pt-2">
                      {DIAS_SEMANA.map((d) => {
                        const prodId = planSemanal[d.dia] ?? "p1";
                        const prod = productos.find((p) => p.id === prodId) ?? productos[0]!;
                        const isToday = d.dia.includes("Hoy");

                        return (
                          <div
                            key={d.dia}
                            className={`flex items-center justify-between rounded-xl border p-2.5 transition ${
                              isToday
                                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                : "border-border bg-secondary/20"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs">{d.dia}</span>
                                <span className="text-[10px] text-muted-foreground">{d.fecha}</span>
                              </div>
                              <p className="text-xs font-semibold mt-0.5">
                                {prod.emoji} {prod.nombre}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {prod.kcal} kcal · S/ {prod.precio.toFixed(2)}
                              </p>
                            </div>

                            <select
                              value={prodId}
                              onChange={(e) =>
                                setPlanSemanal((prev) => ({ ...prev, [d.dia]: e.target.value }))
                              }
                              className="rounded-lg border border-border bg-background p-1 text-[11px] font-medium"
                            >
                              {productos
                                .filter((p) => esApto(p, estudiante))
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.emoji} {p.nombre.slice(0, 18)}
                                  </option>
                                ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>

                    <Button
                      className="mt-3 w-full h-8 text-xs font-bold"
                      onClick={() =>
                        toast.success(
                          `🎉 ¡Plan semanal de ${estudiante.nombre} guardado y confirmado!`,
                        )
                      }
                    >
                      Guardar Plan Semanal Completo
                    </Button>
                  </div>
                </TabsContent>

                {/* PESTAÑA 3: PERFIL DE SALUD & OPCIÓN DE LOGOUT */}
                <TabsContent value="perfil" className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold font-display">{estudiante.nombre}</h3>
                        <p className="text-xs text-muted-foreground">{estudiante.grado}</p>
                      </div>
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Activity className="size-3.5 text-primary" /> IMC {imc}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <Label className="mb-1 block">Peso (kg)</Label>
                        <Input
                          type="number"
                          step={0.5}
                          value={estudiante.peso}
                          onChange={(e) =>
                            actualizarEstudiante({ ...estudiante, peso: Number(e.target.value) })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="mb-1 block">Talla (cm)</Label>
                        <Input
                          type="number"
                          value={estudiante.talla ?? 128}
                          onChange={(e) =>
                            actualizarEstudiante({ ...estudiante, talla: Number(e.target.value) })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-1.5 block text-xs">
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
                      <Label className="mb-1.5 block text-xs">Nivel de actividad física</Label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["baja", "media", "alta"] as const).map((a) => (
                          <Button
                            key={a}
                            variant={estudiante.actividad === a ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-[11px] capitalize"
                            onClick={() => actualizarEstudiante({ ...estudiante, actividad: a })}
                          >
                            {a}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-1.5 block text-xs">Alergias e intolerancias</Label>
                      <div className="space-y-2">
                        {ALERGENOS.map((a) => (
                          <div key={a} className="flex items-center justify-between text-xs">
                            <span className="capitalize">{a}</span>
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

                    {/* SECCIÓN DE CUENTA & LOGOUT */}
                    <div className="rounded-xl border border-border bg-secondary/30 p-3 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <User className="size-3.5 text-primary" /> Cuenta Activa
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {usuario.rol}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Sesión iniciada como <strong>{usuario.email}</strong> ({usuario.nombre}) en {usuario.colegio}.
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          logout();
                          toast.info("Sesión cerrada correctamente.");
                        }}
                        className="w-full h-8 text-xs gap-1.5 font-bold"
                      >
                        <LogOut className="size-3.5" /> Cerrar Sesión (Logout)
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* PESTAÑA 4: FOTOCHECK DIGITAL & CARNET QR */}
                <TabsContent value="carnet" className="mt-4">
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="hero-gradient p-4 text-primary-foreground">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                        Carnet Digital Escolar
                      </p>
                      <h3 className="text-xl font-display leading-tight">{estudiante.nombre}</h3>
                      <p className="text-xs opacity-90">{estudiante.grado} · San Patricio</p>
                    </div>
                    <div className="flex flex-col items-center gap-3 p-5 text-center">
                      <QrCode value={estudiante.qr} size={160} />
                      <p className="font-mono text-sm font-bold text-foreground">{estudiante.qr}</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {estudiante.alergias.map((a) => (
                          <Badge
                            key={a}
                            variant="outline"
                            className="border-destructive text-destructive text-[10px]"
                          >
                            ⚠️ {a}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        El quiosco escanea este código para despachar la lonchera sin efectivo ni
                        colas.
                      </p>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-xs text-primary"
                        onClick={simularNotificacionEntrega}
                      >
                        <Bell className="size-3.5" /> Probar Notificación de Entrega
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Barra de Navegación Inferior Móvil (Sticky Bottom Tabs) */}
              <div className="sticky bottom-0 left-0 right-0 z-30 mt-6 flex items-center justify-around border-t border-border bg-card/95 py-2 backdrop-blur-md">
                {[
                  { id: "pedido", label: "Lonchera", icon: Utensils },
                  { id: "planner", label: "Semana", icon: CalendarCheck },
                  { id: "perfil", label: "Salud", icon: User },
                  { id: "carnet", label: "QR", icon: QrIcon },
                ].map((tab) => {
                  const active = tabActiva === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTabActiva(tab.id)}
                      className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition ${
                        active
                          ? "text-primary font-bold scale-105"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <tab.icon className={`size-4 ${active ? "text-primary" : ""}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
