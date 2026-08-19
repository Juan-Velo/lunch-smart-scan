import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  ESTUDIANTES_INICIALES,
  PEDIDOS_INICIALES,
  PRODUCTOS,
  type Estudiante,
  type Pedido,
  type Producto,
} from "./lonchera-data";

export type Usuario = {
  nombre: string;
  email: string;
  rol: "padre" | "concesionario" | "admin";
  colegio: string;
};

export const USUARIO_DEMO: Usuario = {
  nombre: "Familia Velo",
  email: "padres@nutricontrol.pe",
  rol: "padre",
  colegio: "Colegio San Patricio",
};

type Store = {
  usuario: Usuario | null;
  estudiantes: Estudiante[];
  pedidos: Pedido[];
  productos: Producto[];
  login: (email: string, nombre?: string) => void;
  registro: (nombre: string, email: string) => void;
  logout: () => void;
  actualizarEstudiante: (e: Estudiante) => void;
  agregarEstudiante: (e: Estudiante) => void;
  crearPedido: (p: Omit<Pedido, "id" | "hora" | "estado">) => void;
  entregarPedido: (id: string, segundos: number) => void;
  agregarProducto: (p: Producto) => void;
  actualizarStockProducto: (id: string, delta: number) => void;
};

const Ctx = createContext<Store | null>(null);
const KEY = "lonchera-mock-v4";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(USUARIO_DEMO);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>(ESTUDIANTES_INICIALES);
  const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS_INICIALES);
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.usuario !== undefined) setUsuario(d.usuario);
        if (d.estudiantes) setEstudiantes(d.estudiantes);
        if (d.pedidos) setPedidos(d.pedidos);
        if (d.productos) setProductos(d.productos);
      }
    } catch {
      /* mockup */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ usuario, estudiantes, pedidos, productos }));
    } catch {
      /* mockup */
    }
  }, [usuario, estudiantes, pedidos, productos]);

  const value: Store = {
    usuario,
    estudiantes,
    pedidos,
    productos,
    login: (email, nombre) => {
      const user: Usuario = {
        nombre: nombre || (email.includes("@") ? email.split("@")[0] : "Familia Velo"),
        email: email.trim(),
        rol: "padre",
        colegio: "Colegio San Patricio",
      };
      setUsuario(user);
    },
    registro: (nombre, email) => {
      const user: Usuario = {
        nombre: nombre.trim() || "Familia Velo",
        email: email.trim(),
        rol: "padre",
        colegio: "Colegio San Patricio",
      };
      setUsuario(user);
    },
    logout: () => {
      setUsuario(null);
    },
    actualizarEstudiante: (e) =>
      setEstudiantes((prev) => prev.map((x) => (x.id === e.id ? e : x))),
    agregarEstudiante: (e) =>
      setEstudiantes((prev) => [...prev, e]),
    crearPedido: (p) =>
      setPedidos((prev) => [
        ...prev,
        {
          ...p,
          id: `o${Date.now()}`,
          estado: "preordenado",
          hora: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
        },
      ]),
    entregarPedido: (id, segundos) =>
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, estado: "entregado", segundosDespacho: segundos } : p,
        ),
      ),
    agregarProducto: (p) =>
      setProductos((prev) => [p, ...prev]),
    actualizarStockProducto: (id, delta) =>
      setProductos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, (p.stock ?? 20) + delta) } : p)),
      ),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore fuera de StoreProvider");
  return c;
}
