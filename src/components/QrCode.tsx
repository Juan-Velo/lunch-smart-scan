/** QR decorativo determinista para el mockup (no codifica datos reales). */
export function QrCode({ value, size = 160 }: { value: string; size?: number }) {
  const n = 21;
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = (i: number) => {
    let x = Math.imul(h ^ (i * 2654435761), 2246822519);
    x ^= x >>> 15;
    return (x >>> 0) / 4294967295;
  };
  const isFinder = (r: number, c: number) => {
    const zones = [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ];
    return zones.some(([zr, zc]) => {
      const dr = r - zr;
      const dc = c - zc;
      if (dr < 0 || dc < 0 || dr > 6 || dc > 6) return false;
      const ring = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
      return ring !== 2;
    });
  };
  const inFinderBox = (r: number, c: number) =>
    (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);

  const cells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const on = inFinderBox(r, c) ? isFinder(r, c) : rand(r * n + c) > 0.5;
      if (on) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} rx={0.2} />);
    }
  }
  return (
    <svg
      viewBox={`-1 -1 ${n + 2} ${n + 2}`}
      width={size}
      height={size}
      className="rounded-xl bg-card fill-foreground p-1"
      role="img"
      aria-label={`Código QR ${value}`}
    >
      {cells}
    </svg>
  );
}
