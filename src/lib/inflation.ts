import type { IpcaIndex } from "@/lib/data";

/** Correct a calendar-year average using that year's average IPCA index. */
export function inflationFactorForYear(rows: IpcaIndex[], year: number): number | null {
  const last = rows.at(-1);
  const yearRows = rows.filter((row) => row.month.startsWith(`${year}-`));
  if (!last || yearRows.length !== 12) return null;
  const average = yearRows.reduce((sum, row) => sum + Number(row.index_value), 0) / 12;
  return average > 0 ? Number(last.index_value) / average : null;
}
