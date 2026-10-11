export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MONTH_NAMES_SHORT_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export const WEEKDAY_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isToday(dateStr: string): boolean {
  const today = new Date();
  return dateStr === formatDateToISO(today);
}

export function formatDateFullPT(dateStr: string): string {
  const date = parseISODate(dateStr);
  const weekday = WEEKDAY_SHORT_PT[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES_SHORT_PT[date.getMonth()].toLowerCase();
  const year = date.getFullYear();
  return `${weekday}, ${day} de ${month} de ${year}`;
}

export function getWeekDaysAround(currentDate: Date, offsetWeeks = 0): Date[] {
  const date = new Date(currentDate);
  date.setDate(date.getDate() + offsetWeeks * 7);

  // Find Monday of this week
  const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + distanceToMonday);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTimeString(minutes: number): string {
  const normalized = Math.max(0, Math.min(1439, minutes));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calculateDuration(startTime: string, endTime: string): string {
  const startMins = timeStringToMinutes(startTime);
  const endMins = timeStringToMinutes(endTime);
  const diff = endMins - startMins;

  if (diff <= 0) return 'Horário inválido';

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (hours === 0) {
    return `${minutes} minutos`;
  } else if (minutes === 0) {
    return hours === 1 ? '1 hora' : `${hours} horas`;
  } else {
    return `${hours}h ${minutes}min`;
  }
}

export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getWeekOfMonth(date: Date): number {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 is Sunday, 1 is Monday...
  const dayOfWeekOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
  return Math.ceil((date.getDate() + dayOfWeekOffset) / 7);
}
