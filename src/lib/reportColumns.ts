// lib/reportColumns.ts
//
// Single source of truth for every exportable field on the transaction
// report. The on-screen table, the column-picker dialog, print, PDF, and
// Excel exports all read from REPORT_COLUMNS so they can never drift out
// of sync with one another — add a field here once and it shows up
// everywhere automatically.

import { TranWt } from "@/types";

export type ColumnAlign = "left" | "right";

/**
 * How a column's values should be summed on the totals row.
 * - "sum": numeric column, add every row's value
 * - undefined: not aggregated (text/date columns render blank in the totals row)
 */
export type ColumnAgg = "sum";

export interface ReportColumn {
  key: string;
  label: string;
  align?: ColumnAlign;
  /** Raw numeric value, when this column is aggregatable. Used for totals. */
  numericValue?: (row: TranWt) => number | null | undefined;
  /** Display string for a single row's cell. */
  getValue: (row: TranWt) => string;
  /** Display string for the totals row, given the summed numeric value. */
  formatTotal?: (sum: number) => string;
  agg?: ColumnAgg;
}

export const money = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const weight = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export const formatDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString() : "");

export const dateStr = (d: Date) => d.toISOString().slice(0, 10);

export const REPORT_COLUMNS: ReportColumn[] = [
  { key: "id", label: "ID", getValue: (r) => String(r.id) },
  { key: "tranDate", label: "Date", getValue: (r) => formatDate(r.tranDate) },
  { key: "description", label: "Description", getValue: (r) => r.description ?? "" },
  {
    key: "fromCompany",
    label: "From",
    getValue: (r) => r.fromCompanyDetails?.companyName ?? r.fromCompanyId,
  },
  {
    key: "toCompany",
    label: "To",
    getValue: (r) => r.toCompanyDetails?.companyName ?? r.toCompanyId,
  },
  { key: "metal", label: "Metal", getValue: (r) => r.metalName ?? r.metalId ?? "" },
  { key: "hsnCode", label: "HSN Code", getValue: (r) => r.hsnCode ?? "" },
  { key: "calType", label: "Cal Type", getValue: (r) => r.calType ?? "" },
  {
    key: "grsWt",
    label: "Gross Wt",
    align: "right",
    agg: "sum",
    numericValue: (r) => r.grsWt,
    getValue: (r) => (r.grsWt != null ? weight(r.grsWt) : ""),
    formatTotal: weight,
  },
  {
    key: "stnWt",
    label: "Stone Wt",
    align: "right",
    agg: "sum",
    numericValue: (r) => r.stnWt,
    getValue: (r) => (r.stnWt != null ? weight(r.stnWt) : ""),
    formatTotal: weight,
  },
  {
    key: "netWt",
    label: "Net Wt",
    align: "right",
    agg: "sum",
    numericValue: (r) => r.netWt,
    getValue: (r) => (r.netWt != null ? weight(r.netWt) : ""),
    formatTotal: weight,
  },
  {
    key: "rate",
    label: "Rate",
    align: "right",
    getValue: (r) => (r.rate != null ? money(r.rate) : ""),
  },
  {
    key: "value",
    label: "Value",
    align: "right",
    agg: "sum",
    numericValue: (r) => r.value,
    getValue: (r) => (r.value != null ? money(r.value) : ""),
    formatTotal: money,
  },
  {
    key: "cgstPer",
    label: "CGST %",
    align: "right",
    getValue: (r) => (r.cgstPer != null ? String(r.cgstPer) : ""),
  },
  {
    key: "csstAmt",
    label: "CGST Amt",
    align: "right",
    agg: "sum",
    numericValue: (r) => r.csstAmt,
    getValue: (r) => (r.csstAmt != null ? money(r.csstAmt) : ""),
    formatTotal: money,
  },
  {
    key: "sgstPer",
    label: "SGST %",
    align: "right",
    getValue: (r) => (r.sgstPer != null ? String(r.sgstPer) : ""),
  },
  {
    key: "sgstAmt",
    label: "SGST Amt",
    align: "right",
    agg: "sum",
    numericValue: (r) => r.sgstAmt,
    getValue: (r) => (r.sgstAmt != null ? money(r.sgstAmt) : ""),
    formatTotal: money,
  },
  {
    key: "igstPer",
    label: "IGST %",
    align: "right",
    getValue: (r) => (r.igstPer != null ? String(r.igstPer) : ""),
  },
  {
    key: "igstAmt",
    label: "IGST Amt",
    align: "right",
    agg: "sum",
    numericValue: (r) => r.igstAmt,
    getValue: (r) => (r.igstAmt != null ? money(r.igstAmt) : ""),
    formatTotal: money,
  },
  {
    key: "total",
    label: "Total",
    align: "right",
    agg: "sum",
    numericValue: (r) => r.total,
    getValue: (r) => (r.total != null ? money(r.total) : ""),
    formatTotal: money,
  },
  { key: "createdDate", label: "Created Date", getValue: (r) => formatDate(r.createdDate) },
  { key: "updatedDate", label: "Updated Date", getValue: (r) => formatDate(r.updatedDate) },
  { key: "userId", label: "User ID", getValue: (r) => (r.userId != null ? String(r.userId) : "") },
];

export const ALL_COLUMN_KEYS = REPORT_COLUMNS.map((c) => c.key);

/**
 * The first column is where the "Total" label goes on the totals row (it's
 * usually a text column like ID or Date). Every subsequent aggregatable
 * column gets its summed value; everything else renders blank.
 */
export function computeTotalsRow(
  columns: ReportColumn[],
  rows: TranWt[]
): Record<string, string> {
  const result: Record<string, string> = {};
  columns.forEach((col, i) => {
    if (i === 0) {
      result[col.key] = "Total";
      return;
    }
    if (col.agg === "sum" && col.numericValue) {
      const sum = rows.reduce((acc, row) => {
        const v = col.numericValue!(row);
        return acc + (typeof v === "number" && !Number.isNaN(v) ? v : 0);
      }, 0);
      result[col.key] = col.formatTotal ? col.formatTotal(sum) : String(sum);
    } else {
      result[col.key] = "";
    }
  });
  return result;
}
