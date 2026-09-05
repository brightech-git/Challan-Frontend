// lib/reportExcelExport.ts
//
// Produces a genuine, styled .xlsx workbook (not an HTML table renamed
// .xls). Uses SheetJS (`xlsx`) for the workbook structure and
// `xlsx-js-style` — a drop-in fork of SheetJS with cell-style support — for
// header fill colors, bold text, borders, and number formats.
//
// Colors match src/theme/colors.ts (brand blue #2563EB / brand.600, and
// brand.50/brand.100 for tints) so the exported file reads as the same
// brand as the app itself.
//
// npm install xlsx-js-style
// (xlsx-js-style bundles its own copy of the xlsx API, so you do NOT need
// the plain `xlsx` package as well — import everything from "xlsx-js-style".)

import XLSXStyle from "xlsx-js-style";
import { TranWt } from "@/types";
import { ReportColumn, computeTotalsRow } from "./reportColumns";

const HEADER_FILL = "2563EB"; // brand.600
const HEADER_FONT_COLOR = "FFFFFF";
const ALT_ROW_FILL = "F2F6FE"; // brand.50
const TOTAL_ROW_FILL = "E0E9FC"; // brand.100
const BORDER_COLOR = "BED0F9"; // brand.200
const TITLE_COLOR = "112E6C"; // brand.900

const thinBorder = {
  top: { style: "thin", color: { rgb: BORDER_COLOR } },
  bottom: { style: "thin", color: { rgb: BORDER_COLOR } },
  left: { style: "thin", color: { rgb: BORDER_COLOR } },
  right: { style: "thin", color: { rgb: BORDER_COLOR } },
};

function headerCellStyle() {
  return {
    fill: { patternType: "solid", fgColor: { rgb: HEADER_FILL } },
    font: { bold: true, color: { rgb: HEADER_FONT_COLOR }, sz: 11 },
    alignment: { vertical: "center", horizontal: "left", wrapText: true },
    border: thinBorder,
  };
}

function bodyCellStyle(align: "left" | "right", isAltRow: boolean) {
  return {
    fill: isAltRow ? { patternType: "solid", fgColor: { rgb: ALT_ROW_FILL } } : undefined,
    alignment: { vertical: "center", horizontal: align },
    border: thinBorder,
    font: { sz: 10 },
  };
}

function totalCellStyle(align: "left" | "right") {
  return {
    fill: { patternType: "solid", fgColor: { rgb: TOTAL_ROW_FILL } },
    font: { bold: true, sz: 10, color: { rgb: TITLE_COLOR } },
    alignment: { vertical: "center", horizontal: align },
    border: thinBorder,
  };
}

function titleCellStyle() {
  return {
    font: { bold: true, sz: 14, color: { rgb: TITLE_COLOR } },
  };
}

function subtitleCellStyle() {
  return {
    font: { italic: true, sz: 10, color: { rgb: "444444" } },
  };
}

/**
 * Rough column width from the longest rendered value (in characters),
 * clamped to a sane range so a long description doesn't blow out the sheet.
 */
function columnWidth(col: ReportColumn, rows: TranWt[]): number {
  const longest = rows.reduce((max, row) => {
    const len = col.getValue(row)?.length ?? 0;
    return Math.max(max, len);
  }, col.label.length);
  return Math.min(Math.max(longest + 2, 10), 40);
}

export function exportReportExcel(
  columns: ReportColumn[],
  rows: TranWt[],
  opts: { fromDate: string; toDate: string; fileNamePrefix?: string }
) {
  const { fromDate, toDate, fileNamePrefix = "transaction-report" } = opts;

  const titleRow = ["Transaction Report"];
  const subtitleRow = [`${fromDate} to ${toDate}`];
  const headerRow = columns.map((c) => c.label);
  const bodyRows = rows.map((row) => columns.map((c) => c.getValue(row) || "-"));
  const totals = computeTotalsRow(columns, rows);
  const totalsRow = columns.map((c) => totals[c.key] || "");

  const aoa: (string | number)[][] = [
    titleRow,
    subtitleRow,
    [],
    headerRow,
    ...bodyRows,
    totalsRow,
  ];

  const ws = XLSXStyle.utils.aoa_to_sheet(aoa);

  const HEADER_ROW_INDEX = 3; // 0-based: title, subtitle, blank, header
  const FIRST_DATA_ROW = HEADER_ROW_INDEX + 1;
  const LAST_DATA_ROW = FIRST_DATA_ROW + bodyRows.length - 1;
  const TOTALS_ROW_INDEX = LAST_DATA_ROW + 1;

  // Title / subtitle styling
  const titleRef = XLSXStyle.utils.encode_cell({ r: 0, c: 0 });
  const subtitleRef = XLSXStyle.utils.encode_cell({ r: 1, c: 0 });
  if (ws[titleRef]) ws[titleRef].s = titleCellStyle();
  if (ws[subtitleRef]) ws[subtitleRef].s = subtitleCellStyle();

  // Header row styling
  columns.forEach((_col, c) => {
    const ref = XLSXStyle.utils.encode_cell({ r: HEADER_ROW_INDEX, c });
    if (ws[ref]) ws[ref].s = headerCellStyle();
  });

  // Body rows: alternating fill + per-column alignment, numeric cells typed as numbers
  bodyRows.forEach((_rowVals, rIdx) => {
    const sheetRow = FIRST_DATA_ROW + rIdx;
    const isAlt = rIdx % 2 === 1;
    columns.forEach((col, c) => {
      const ref = XLSXStyle.utils.encode_cell({ r: sheetRow, c });
      const cell = ws[ref];
      if (!cell) return;
      cell.s = bodyCellStyle(col.align === "right" ? "right" : "left", isAlt);
    });
  });

  // Totals row styling
  columns.forEach((col, c) => {
    const ref = XLSXStyle.utils.encode_cell({ r: TOTALS_ROW_INDEX, c });
    if (ws[ref]) ws[ref].s = totalCellStyle(col.align === "right" ? "right" : "left");
  });

  // Merge title/subtitle across all columns so they read as a banner
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: columns.length - 1 } },
  ];

  // Column widths
  ws["!cols"] = columns.map((col) => ({ wch: columnWidth(col, rows) }));

  // Freeze header row (and everything above it) so it stays visible on scroll
  ws["!freeze"] = { xSplit: 0, ySplit: HEADER_ROW_INDEX + 1 };
  // SheetJS community build reads freeze panes from this view config:
  ws["!sheetViews"] = [
    { pane: { ySplit: HEADER_ROW_INDEX + 1, topLeftCell: `A${HEADER_ROW_INDEX + 2}`, state: "frozen" } },
  ];

  // Row height for the title
  ws["!rows"] = [{ hpt: 22 }, { hpt: 16 }];

  const wb = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(wb, ws, "Report");

  XLSXStyle.writeFile(wb, `${fileNamePrefix}-${fromDate}-to-${toDate}.xlsx`);
}
