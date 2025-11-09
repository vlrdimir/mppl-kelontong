import { clsx, type ClassValue } from "clsx";
import { formatISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { twMerge } from "tailwind-merge";
import type { DateRangeOption } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDateRange = (dateRange: DateRangeOption) => {
  const now = new Date();
  switch (dateRange) {
    case "today":
      return {
        start: formatISO(now, { representation: "date" }),
        end: formatISO(now, { representation: "date" }),
      };
    case "this-month":
      return {
        start: formatISO(startOfMonth(now), { representation: "date" }),
        end: formatISO(endOfMonth(now), { representation: "date" }),
      };
    case "last-month":
      const lastMonth = subMonths(now, 1);
      return {
        start: formatISO(startOfMonth(lastMonth), { representation: "date" }),
        end: formatISO(endOfMonth(lastMonth), { representation: "date" }),
      };
    case "last-2-months":
      return {
        start: formatISO(startOfMonth(subMonths(now, 2)), {
          representation: "date",
        }),
        end: formatISO(endOfMonth(now), { representation: "date" }),
      };
    case "last-3-months":
      return {
        start: formatISO(startOfMonth(subMonths(now, 3)), {
          representation: "date",
        }),
        end: formatISO(endOfMonth(now), { representation: "date" }),
      };
    case "this-year":
      return {
        start: formatISO(new Date(now.getFullYear(), 0, 1), {
          representation: "date",
        }),
        end: formatISO(now, { representation: "date" }),
      };
    default:
      // Default to this month
      return {
        start: formatISO(startOfMonth(now), { representation: "date" }),
        end: formatISO(endOfMonth(now), { representation: "date" }),
      };
  }
};
