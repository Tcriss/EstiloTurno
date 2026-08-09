import { BookedRange } from "../ports/schedule.repository";

export interface WorkingHours {
  workStartMinutes: number;
  workEndMinutes: number;
  slotIntervalMinutes: number;
}

export function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Regla de oro de disponibilidad: un slot solo es válido si cabe dentro del horario
 * laboral del negocio y no se solapa con ninguna cita activa ya reservada.
 */
export function computeAvailableSlots(
  hours: WorkingHours,
  serviceDurationMinutes: number,
  bookedRanges: BookedRange[]
): string[] {
  const potentialSlots: number[] = [];
  for (
    let min = hours.workStartMinutes;
    min + serviceDurationMinutes <= hours.workEndMinutes;
    min += hours.slotIntervalMinutes
  ) {
    potentialSlots.push(min);
  }

  const availableSlots = potentialSlots.filter((slotStart) => {
    const slotEnd = slotStart + serviceDurationMinutes;
    const isOverlap = bookedRanges.some((range) => rangesOverlap(slotStart, slotEnd, range.start, range.end));
    return !isOverlap;
  });

  return availableSlots.map(minutesToTimeString);
}
