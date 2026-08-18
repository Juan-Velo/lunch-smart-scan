import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  ESTUDIANTES_INICIALES,
  PEDIDOS_INICIALES,
  type Estudiante,
  type Pedido,
} from "./lonchera-data";

type Store = {
  estudiantes: Estudiante[];
  pedidos: Pedido[];
  actualizarEstudiante: (e: Estudiante) => void;
  crearPedido: (p: Omit<Pedido, "id" | "hora" | "estado">) => void;
  entregarPedido: (id: string, segundos: number) => void;
};

const Ctx = createContext<Store | null>(null);
const KEY = "lonchera-mock-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>(ESTUDIANTES_INICIALES);
  const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS_INICIALES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.estudiantes) setEstudiantes(d.estudiantes);
        if (d.pedidos) setPedidos(d.pedidos);
      }
    } catch {
      /* mockup */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ estudiantes, pedidos }));
    } catch {
      /* mockup */
    }
  }, [estudiantes, pedidos]);

  const value: Store = {
    estudiantes,
    pedidos,
    actualizarEstudiante: (e) =>
      setEstudiantes((prev) => prev.map((x) => (x.id === e.id ? e : x))),
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
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore fuera de StoreProvider");
  return c;
}
