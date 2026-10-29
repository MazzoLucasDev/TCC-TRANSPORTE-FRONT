export type Coord = { latitude: number; longitude: number };

const R = 6371000;
const toRad = (d: number) => (d * Math.PI) / 180;

export function distanceMeters(a: Coord, b: Coord): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// distância (m) do ponto p até o segmento a–b, em projeção plana local
function distanceToSegment(p: Coord, a: Coord, b: Coord): number {
  const k = Math.cos(toRad(p.latitude));
  const x = (c: Coord) => toRad(c.longitude) * k * R;
  const y = (c: Coord) => toRad(c.latitude) * R;
  const dx = x(b) - x(a);
  const dy = y(b) - y(a);
  const len2 = dx * dx + dy * dy;
  const t =
    len2 === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((x(p) - x(a)) * dx + (y(p) - y(a)) * dy) / len2),
        );
  return Math.hypot(x(p) - (x(a) + t * dx), y(p) - (y(a) + t * dy));
}

export function distanceToRouteMeters(p: Coord, line: Coord[]): number {
  let min = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i];
    const b = line[i + 1];
    if (a && b) min = Math.min(min, distanceToSegment(p, a, b));
  }
  return min;
}
