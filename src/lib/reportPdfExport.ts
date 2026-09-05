// lib/reportPdfExport.ts
//
// Branded PDF export via jsPDF + jspdf-autotable: header band matches the
// Excel/print styling (brand blue, from src/theme/colors.ts), a totals row
// is appended and styled distinctly, and every page gets a footer with the
// generated timestamp + page numbers.

import { TranWt } from "@/types";
import { ReportColumn, computeTotalsRow } from "./reportColumns";

const HEADER_RGB: [number, number, number] = [37, 99, 235]; // brand.600 #2563eb
const ALT_ROW_RGB: [number, number, number] = [242, 246, 254]; // brand.50 #f2f6fe
const TOTAL_ROW_RGB: [number, number, number] = [224, 233, 252]; // brand.100 #e0e9fc
const BORDER_RGB: [number, number, number] = [190, 208, 249]; // brand.200 #bed0f9
const TEXT_MUTED_RGB: [number, number, number] = [90, 90, 90];

export async function exportReportPdf(
  columns: ReportColumn[],
  rows: TranWt[],
  opts: { fromDate: string; toDate: string; fileNamePrefix?: string }
) {
  const { fromDate, toDate, fileNamePrefix = "transaction-report" } = opts;

  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const totals = computeTotalsRow(columns, rows);
  const totalsRowValues = columns.map((c) => totals[c.key] || "");
  const bodyRows = rows.map((row) => columns.map((c) => c.getValue(row) || "-"));

  // Header band
  doc.setFillColor(...HEADER_RGB);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction Report", 40, 28);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${fromDate} to ${toDate}`, 40, 42);

  autoTable(doc, {
    startY: 64,
    head: [columns.map((c) => c.label)],
    body: bodyRows,
    foot: [totalsRowValues],
    showFoot: "lastPage",
    headStyles: {
      fillColor: HEADER_RGB,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
    },
    footStyles: {
      fillColor: TOTAL_ROW_RGB,
      textColor: [20, 20, 20],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: { fillColor: ALT_ROW_RGB },
    styles: { fontSize: 8, cellPadding: 4, lineColor: BORDER_RGB, lineWidth: 0.5 },
    columnStyles: Object.fromEntries(
      columns.map((c, i) => [i, { halign: c.align === "right" ? "right" : "left" }])
    ),
    margin: { top: 64, left: 40, right: 40, bottom: 40 },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageCurrent = doc.getCurrentPageInfo().pageNumber;

      doc.setFontSize(8);
      doc.setTextColor(...TEXT_MUTED_RGB);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated ${new Date().toLocaleString()}`, 40, pageHeight - 20);
      // Placeholder — the real total page count isn't known until every
      // page has been drawn, so we patch this string in below.
      doc.text(`Page ${pageCurrent} of {{totalPages}}`, pageWidth - 40, pageHeight - 20, {
        align: "right",
      });
    },
  });

  // Re-draw the footer on every page now that the final page count is
  // known, overwriting the "{{totalPages}}" placeholder with the real
  // number (avoids relying on jsPDF's optional putTotalPages plugin).
  const totalPages = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Paint over the placeholder text with a same-color rect, then redraw.
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth - 140, pageHeight - 30, 100, 14, "F");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MUTED_RGB);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 20, { align: "right" });
  }

  doc.save(`${fileNamePrefix}-${fromDate}-to-${toDate}.pdf`);
}
