export type Alergeno = "gluten" | "lactosa" | "frutos secos" | "huevo" | "mariscos";

export type Producto = {
  id: string;
  nombre: string;
  categoria: "Principal" | "Fruta" | "Bebida" | "Snack";
  kcal: number;
  proteina: number;
  carbos: number;
  grasa: number;
  azucar: number;
  precio: number;
  alergenos: Alergeno[];
  saludable: boolean;
  emoji: string;
};

export type Estudiante = {
  id: string;
  nombre: string;
  grado: string;
  edad: number;
  peso: number;
  actividad: "baja" | "media" | "alta";
  alergias: Alergeno[];
  gustos: string[];
  presupuestoDiario: number;
  qr: string;
};

export type Pedido = {
  id: string;
  estudianteId: string;
  items: string[];
  total: number;
  kcal: number;
  estado: "preordenado" | "listo" | "entregado";
  hora: string;
  segundosDespacho?: number;
};

export const PRODUCTOS: Producto[] = [
  { id: "p1", nombre: "Wrap integral de pollo", categoria: "Principal", kcal: 320, proteina: 22, carbos: 34, grasa: 9, azucar: 3, precio: 7.5, alergenos: ["gluten"], saludable: true, emoji: "🌯" },
  { id: "p2", nombre: "Sándwich de palta y huevo", categoria: "Principal", kcal: 290, proteina: 13, carbos: 30, grasa: 12, azucar: 2, precio: 6.0, alergenos: ["gluten", "huevo"], saludable: true, emoji: "🥪" },
  { id: "p3", nombre: "Quinua con pollo y verduras", categoria: "Principal", kcal: 340, proteina: 24, carbos: 38, grasa: 8, azucar: 4, precio: 8.5, alergenos: [], saludable: true, emoji: "🍲" },
  { id: "p4", nombre: "Yogurt griego con granola", categoria: "Snack", kcal: 210, proteina: 11, carbos: 26, grasa: 6, azucar: 12, precio: 5.0, alergenos: ["lactosa", "frutos secos"], saludable: true, emoji: "🥣" },
  { id: "p5", nombre: "Mix de frutos secos", categoria: "Snack", kcal: 180, proteina: 6, carbos: 12, grasa: 13, azucar: 4, precio: 4.5, alergenos: ["frutos secos"], saludable: true, emoji: "🥜" },
  { id: "p6", nombre: "Mandarina pelada", categoria: "Fruta", kcal: 60, proteina: 1, carbos: 14, grasa: 0, azucar: 11, precio: 2.0, alergenos: [], saludable: true, emoji: "🍊" },
  { id: "p7", nombre: "Manzana en gajos", categoria: "Fruta", kcal: 70, proteina: 0, carbos: 18, grasa: 0, azucar: 13, precio: 2.0, alergenos: [], saludable: true, emoji: "🍎" },
  { id: "p8", nombre: "Uvas rojas", categoria: "Fruta", kcal: 85, proteina: 1, carbos: 21, grasa: 0, azucar: 18, precio: 2.5, alergenos: [], saludable: true, emoji: "🍇" },
  { id: "p9", nombre: "Agua de piña sin azúcar", categoria: "Bebida", kcal: 45, proteina: 0, carbos: 11, grasa: 0, azucar: 8, precio: 2.5, alergenos: [], saludable: true, emoji: "🥤" },
  { id: "p10", nombre: "Leche de avena", categoria: "Bebida", kcal: 120, proteina: 3, carbos: 18, grasa: 4, azucar: 9, precio: 3.5, alergenos: [], saludable: true, emoji: "🥛" },
  { id: "p11", nombre: "Galleta rellena industrial", categoria: "Snack", kcal: 280, proteina: 2, carbos: 42, grasa: 12, azucar: 28, precio: 2.0, alergenos: ["gluten", "lactosa"], saludable: false, emoji: "🍪" },
  { id: "p12", nombre: "Gaseosa 500ml", categoria: "Bebida", kcal: 210, proteina: 0, carbos: 53, grasa: 0, azucar: 53, precio: 3.0, alergenos: [], saludable: false, emoji: "🥤" },
];

export const ESTUDIANTES_INICIALES: Estudiante[] = [
  {
    id: "e1", nombre: "Mateo Velo", grado: "3ro Primaria B", edad: 8, peso: 27,
    actividad: "alta", alergias: ["frutos secos"], gustos: ["cítricos", "pollo"],
    presupuestoDiario: 15, qr: "LNC-3B-0281",
  },
  {
    id: "e2", nombre: "Luciana Velo", grado: "4to Primaria A", edad: 10, peso: 33,
    actividad: "media", alergias: ["lactosa"], gustos: ["frutas", "quinua"],
    presupuestoDiario: 14, qr: "LNC-4A-0317",
  },
];

export const PEDIDOS_INICIALES: Pedido[] = [
  { id: "o1", estudianteId: "e1", items: ["p3", "p6", "p9"], total: 13, kcal: 445, estado: "preordenado", hora: "07:12" },
  { id: "o2", estudianteId: "e2", items: ["p2", "p8", "p9"], total: 11, kcal: 435, estado: "preordenado", hora: "07:31" },
];

// Requerimiento calórico de recreo (~20% del requerimiento diario OMS por edad/actividad)
export function metaKcalRecreo(e: Estudiante) {
  const base = 1400 + (e.edad - 6) * 90;
  const factor = e.actividad === "alta" ? 1.2 : e.actividad === "media" ? 1.1 : 1;
  return Math.round(base * factor * 0.22);
}

export function esApto(p: Producto, e: Estudiante) {
  return !p.alergenos.some((a) => e.alergias.includes(a));
}

/** Motor recomendador: optimiza balance calórico, presupuesto y restricciones. */
export function recomendarCombos(e: Estudiante) {
  const meta = metaKcalRecreo(e);
  const aptos = PRODUCTOS.filter((p) => esApto(p, e) && p.saludable);
  const principales = aptos.filter((p) => p.categoria === "Principal");
  const frutas = aptos.filter((p) => p.categoria === "Fruta");
  const bebidas = aptos.filter((p) => p.categoria === "Bebida");

  const combos: { items: Producto[]; kcal: number; total: number; score: number }[] = [];
  for (const a of principales)
    for (const f of frutas)
      for (const b of bebidas) {
        const items = [a, f, b];
        const kcal = items.reduce((s, i) => s + i.kcal, 0);
        const total = items.reduce((s, i) => s + i.precio, 0);
        if (total > e.presupuestoDiario) continue;
        const gusto = items.some((i) =>
          e.gustos.some((g) => i.nombre.toLowerCase().includes(g.toLowerCase())),
        )
          ? 12
          : 0;
        const score = 100 - Math.abs(kcal - meta) / 4 - Math.abs(total - e.presupuestoDiario) * 2 + gusto;
        combos.push({ items, kcal, total, score });
      }
  return combos.sort((a, b) => b.score - a.score).slice(0, 3);
}

export const nombreProducto = (id: string) => PRODUCTOS.find((p) => p.id === id)!;
