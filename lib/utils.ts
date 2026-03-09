import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Valida si una fecha (YYYY-MM-DD) pertenece a un periodo específico (año, mes, quincena).
 * @param dateStr Fecha en formato ISO string (YYYY-MM-DD)
 * @param year Año del periodo
 * @param month Mes del periodo (1-12)
 * @param quincena Quincena del periodo ("1", "2")
 */
export function isDateInPeriod(dateStr: string, year: string | number, month: string | number, quincena: string | number): boolean {
  if (!dateStr) return false;
  // Forzamos mediodía para evitar saltos de día por zona horaria local
  const date = new Date(dateStr + 'T12:00:00');
  if (isNaN(date.getTime())) return false;

  const dYear = date.getFullYear();
  const dMonth = date.getMonth() + 1;
  const dDay = date.getDate();

  if (dYear !== Number(year) || dMonth !== Number(month)) return false;

  if (String(quincena) === "1") {
    return dDay >= 1 && dDay <= 15;
  } else {
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    return dDay >= 16 && dDay <= lastDay;
  }
}
