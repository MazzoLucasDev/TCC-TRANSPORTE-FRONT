// formata enquanto o usuário digita: "15032003" -> "15/03/2003"
export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// converte "15/03/2003" -> "2003-03-15" (ou null se estiver incompleta/inválida)
export function brDateToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const [, day, month, year] = match;
  if (!day || !month || !year) return null;

  return `${year}-${month}-${day}`;
}
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
function toIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// hoje + N dias, no fuso do celular (1 = amanhã)
export function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIso(date);
}

// "2026-10-28" -> "28/10/2026"
export function isoToBr(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

// false para datas como 31/02, que o JavaScript "corrigiria" para março
export function isRealIsoDate(iso: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return toIso(date) === iso;
}

const WEEKDAYS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

// "2026-10-28" -> "quarta-feira"
export function weekdayPt(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(year!, month! - 1, day).getDay()] ?? "";
}
