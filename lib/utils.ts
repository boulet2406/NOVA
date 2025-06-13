import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toLocaleDate(
  date: string | null | undefined,
  showTime = false
) {
  if (!date) return "Date inconnue";

  const d = new Date(date);

  return d.toLocaleString("fr-FR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    ...(showTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
}
