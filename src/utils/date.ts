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
