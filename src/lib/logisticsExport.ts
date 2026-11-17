import type { LogisticsSheetDetails } from "@/types/logisticsSheet";

export interface LogisticsExportGroup { groupId: number; entries: LogisticsSheetDetails[] }
export interface LogisticsExportMeta { generatedBy: string; generatedAt: Date; filter: string; groupBy?: boolean }

export const logisticsAddress = (row: LogisticsSheetDetails) => [row.toCompanyAddress1, row.toCompanyAddress2, row.toCompanyAddress3]
  .filter(Boolean).join(", ") || [row.tranWt?.toCompanyDetails?.address1, row.tranWt?.toCompanyDetails?.address2,
    row.tranWt?.toCompanyDetails?.address3, row.tranWt?.toCompanyDetails?.address4].filter(Boolean).join(", ");

export const logisticsMetalWeight = (row: LogisticsSheetDetails, metal: "GOLD" | "SILVER") => {
  const name = row.tranWt?.metalName?.toUpperCase();
  const matches = name ? name.includes(metal) : row.tranWt?.metalId?.toUpperCase() === (metal === "GOLD" ? "G" : "S");
  return matches ? row.tranWt?.netWt ?? 0 : 0;
};

export const logisticsHeaders = ["S.No.", "Date", "From", "To", "Area / Address", "BRN No.", "Challan No.", "Box Wt.", "Gold Wt.", "Silver Wt.", "Status"];
export const logisticsExportRow = (row: LogisticsSheetDetails, index: number): (string | number)[] => [
  index + 1, row.tranWt?.tranDate?.slice(0, 10) ?? "—",
  row.fromCompanyName ?? row.tranWt?.fromCompanyDetails?.companyName ?? row.fromCompanyId,
  row.toCompanyName ?? row.tranWt?.toCompanyDetails?.companyName ?? row.toCompanyId,
  logisticsAddress(row) || "—", row.brnNo == null ? "—" : String(row.brnNo), row.challanId,
  row.boxWt == null ? 0 : Number(row.boxWt), logisticsMetalWeight(row, "GOLD"), logisticsMetalWeight(row, "SILVER"),
  row.active ? "Active" : "Inactive",
];

interface LogisticsReportRow {
  kind: "group" | "data" | "subtotal" | "total";
  values: (string | number)[];
}

export function logisticsReportRows(groups: LogisticsExportGroup[], groupBy = false): LogisticsReportRow[] {
  const result: LogisticsReportRow[] = [];
  let serial = 0;
  const totals = [0, 0, 0];
  for (const group of groups) {
    if (!group.entries.length) continue;
    if (groupBy) result.push({ kind: "group", values: [`Sheet #${group.groupId} · ${group.entries.length} row(s)`] });
    const subtotal = [0, 0, 0];
    for (const row of group.entries) {
      const values = logisticsExportRow(row, serial++);
      [7, 8, 9].forEach((column, i) => { subtotal[i] += Number(values[column]); totals[i] += Number(values[column]); });
      result.push({ kind: "data", values });
    }
    if (groupBy) result.push({ kind: "subtotal", values: [`Sheet #${group.groupId} subtotal`, "", "", "", "", "", "", ...subtotal, ""] });
  }
  result.push({ kind: "total", values: ["GRAND TOTAL", "", "", "", "", "", "", ...totals, ""] });
  return result;
}

export const logisticsTimestamp = (date: Date) => new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
}).format(date) + " IST";

const filename = (date: Date, extension: string) => `logistics-sheets-${date.toISOString().replace(/[:.]/g, "-")}.${extension}`;

const fontCache = new Map<string, Promise<string>>();
async function pdfFont(file: string) {
  if (!fontCache.has(file)) fontCache.set(file, (async () => {
    const response = await fetch(`/fonts/Poppins/${file}`);
    if (!response.ok) throw new Error("Could not load the local Poppins font for export.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(binary);
  })().catch((error) => { fontCache.delete(file); throw error; }));
  return fontCache.get(file)!;
}

export async function buildLogisticsPdf(groups: LogisticsExportGroup[], meta: LogisticsExportMeta) {
  if (!groups.length) throw new Error("No displayed rows to export.");
  const [{ default: jsPDF }, { default: autoTable }, regular, bold] = await Promise.all([
    import("jspdf"), import("jspdf-autotable"), pdfFont("Poppins-Regular.ttf"), pdfFont("Poppins-SemiBold.ttf"),
  ]);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.addFileToVFS("Poppins-Regular.ttf", regular);
  doc.addFont("Poppins-Regular.ttf", "Poppins", "normal");
  doc.addFileToVFS("Poppins-SemiBold.ttf", bold);
  doc.addFont("Poppins-SemiBold.ttf", "Poppins", "bold");
  doc.setProperties({ title: "Logistics Sheets", author: meta.generatedBy });
  const report = logisticsReportRows(groups, meta.groupBy);
  const rowCount = groups.reduce((sum, group) => sum + group.entries.length, 0);
  const formatted = (values: (string | number)[]) => values.map((value, column) => column >= 7 && column <= 9 ? Number(value).toFixed(3) : String(value));
    autoTable(doc, {
      head: [logisticsHeaders],
      body: report.filter((row) => row.kind !== "total").map((row) => row.kind === "group" ? [
        { content: String(row.values[0]), colSpan: 11, styles: { fillColor: [226, 232, 240], textColor: [15, 35, 70], fontStyle: "bold" } },
      ] : row.kind === "subtotal" ? [
        { content: String(row.values[0]), colSpan: 7, styles: { fontStyle: "bold", fillColor: [239, 246, 255] } },
        ...formatted(row.values).slice(7),
      ] : formatted(row.values)),
      foot: [[{ content: "GRAND TOTAL", colSpan: 7 }, ...formatted(report[report.length - 1].values).slice(7)]],
      showFoot: "lastPage", theme: "grid", startY: 32,
      margin: { top: 32, left: 10, right: 10, bottom: 22 },
      styles: { font: "Poppins", fontSize: 7, cellPadding: 1.8, lineColor: [203, 213, 225], lineWidth: 0.15, overflow: "linebreak", valign: "middle" },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold", fontSize: 7 },
      footStyles: { fillColor: [219, 234, 254], textColor: [15, 23, 42], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { cellWidth: 11 }, 1: { cellWidth: 22 }, 2: { cellWidth: 42 }, 3: { cellWidth: 42 }, 4: { cellWidth: 47 },
        5: { cellWidth: 23 }, 6: { cellWidth: 18 }, 7: { cellWidth: 18, halign: "right" }, 8: { cellWidth: 18, halign: "right" },
        9: { cellWidth: 18, halign: "right" }, 10: { cellWidth: 18, halign: "center", overflow: "visible" } },
      willDrawPage: () => {
        doc.setFillColor(15, 35, 70); doc.rect(0, 0, 297, 16, "F");
        doc.setFont("Poppins", "bold"); doc.setFontSize(13); doc.setTextColor(255);
        doc.text("LOGISTICS SHEET", 10, 10.5);
        doc.setFontSize(9); doc.text(meta.groupBy ? "Grouped by sheet" : "All displayed rows", 287, 10.5, { align: "right" });
        doc.setFont("Poppins", "normal"); doc.setTextColor(71, 85, 105); doc.setFontSize(8);
        doc.text(`${meta.filter}  |  ${rowCount} row(s)`, 10, 24);
      },
    });
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page); doc.setDrawColor(203, 213, 225); doc.line(10, 192, 287, 192);
    doc.setFont("Poppins", "normal"); doc.setFontSize(7); doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(`Generated by: ${meta.generatedBy}`, 125), 10, 197);
    doc.text(`Generated: ${logisticsTimestamp(meta.generatedAt)}`, 10, 202);
    doc.text(`Page ${page} of ${pages}`, 287, 202, { align: "right" });
  }
  return doc;
}

export async function downloadLogisticsPdf(groups: LogisticsExportGroup[], meta: LogisticsExportMeta) {
  const doc = await buildLogisticsPdf(groups, meta);
  doc.save(filename(meta.generatedAt, "pdf"));
}

export async function printLogisticsPdf(groups: LogisticsExportGroup[], meta: LogisticsExportMeta) {
  const doc = await buildLogisticsPdf(groups, meta);
  const url = URL.createObjectURL(doc.output("blob"));
  const frame = document.createElement("iframe");
  frame.title = "Print logistics sheets";
  frame.style.cssText = "position:fixed;left:-10000px;width:1200px;height:800px;border:0";
  const cleanup = () => { frame.remove(); URL.revokeObjectURL(url); };
  frame.onload = () => {
    window.setTimeout(() => {
      try { frame.contentWindow?.focus(); frame.contentWindow?.print(); }
      catch { window.open(url, "_blank", "noopener"); }
    }, 500);
  };
  frame.src = url;
  document.body.appendChild(frame);
  // Keep the PDF alive while the native print dialog is open.
  window.setTimeout(cleanup, 300000);
}

const escapeXml = (value: string) => value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);

export async function buildLogisticsExcel(groups: LogisticsExportGroup[], meta: LogisticsExportMeta) {
  if (!groups.length) throw new Error("No displayed rows to export.");
  const { default: XLSX } = await import("xlsx-js-style");
  const workbook = XLSX.utils.book_new();
  workbook.Props = { Title: "Logistics Sheets", Author: meta.generatedBy, CreatedDate: meta.generatedAt };
  const report = logisticsReportRows(groups, meta.groupBy);
  const values: (string | number)[][] = [
    ["LOGISTICS SHEETS"], [`${meta.filter} | ${meta.groupBy ? "Grouped by sheet" : "All displayed rows"}`],
    [`Generated by: ${meta.generatedBy} | ${logisticsTimestamp(meta.generatedAt)}`], logisticsHeaders,
    ...report.map((row) => row.values),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(values);
  sheet["!merges"] = [0, 1, 2].map((r) => ({ s: { r, c: 0 }, e: { r, c: 10 } }));
  const widths = [7, 14, 32, 32, 48, 19, 14, 14, 14, 14, 12];
  sheet["!cols"] = widths.map((wch) => ({ wch }));
  sheet["!rows"] = values.map((row, r) => ({ hpt: r === 0 ? 28 : r < 4 ? 22 : report[r - 4].kind !== "data" ? 24 : Math.max(32,
    ...row.map((cell, c) => Math.ceil(String(cell).length / widths[c]) * 14 + 10)) }));
  if (!meta.groupBy) sheet["!autofilter"] = { ref: `A4:K${values.length - 1}` };
  let groupStart = 5;
  for (let r = 0; r < values.length; r++) {
    const kind = r >= 4 ? report[r - 4].kind : undefined;
    if (kind === "group") {
      sheet["!merges"].push({ s: { r, c: 0 }, e: { r, c: 10 } });
      groupStart = r + 2;
    }
    if (kind === "subtotal" || kind === "total") sheet["!merges"].push({ s: { r, c: 0 }, e: { r, c: 6 } });
    for (let c = 0; c < 11; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      const cell = sheet[ref] ?? (sheet[ref] = { t: "s", v: "" });
      const banner = r === 0 || r === 3;
      const summary = kind === "subtotal" || kind === "total";
      cell.s = {
        font: { name: "Poppins", sz: r === 0 ? 15 : 10, bold: banner || summary || kind === "group", color: { rgb: banner ? "FFFFFF" : "0F2346" } },
        fill: { patternType: "solid", fgColor: { rgb: banner ? (r === 0 ? "0F2346" : "2563EB") : summary ? "DBEAFE" : kind === "group" ? "E2E8F0" : r > 3 && r % 2 === 1 ? "F8FAFC" : "FFFFFF" } },
        alignment: { vertical: "center", horizontal: c >= 7 && c <= 9 && r >= 4 ? "right" : "left", wrapText: true },
        border: Object.fromEntries(["top", "bottom", "left", "right"].map((edge) => [edge, { style: "thin", color: { rgb: "CBD5E1" } }])),
      };
      if (r >= 4 && c >= 7 && c <= 9) cell.z = "#,##0.000";
      if (summary && c >= 7 && c <= 9) {
        const column = XLSX.utils.encode_col(c);
        // Numeric S.No. identifies detail rows, excluding group subtotals from
        // the grand total when grouping is enabled.
        cell.f = kind === "subtotal" ? `SUM(${column}${groupStart}:${column}${r})`
          : meta.groupBy ? `SUMIF($A$5:$A$${r},">0",${column}5:${column}${r})` : `SUM(${column}5:${column}${r})`;
      }
    }
  }
  XLSX.utils.book_append_sheet(workbook, sheet, "Logistics Sheets");
  // The style writer omits print metadata; add native OOXML print settings to
  // each worksheet so Excel repeats headers and numbers every printed page.
  const archive = XLSX.CFB.read(new Uint8Array(XLSX.write(workbook, { type: "array", bookType: "xlsx" })), { type: "array" });
  archive.FullPaths.forEach((path: string, index: number) => {
    if (!/\/xl\/worksheets\/sheet\d+\.xml$/.test(path)) return;
    const entry = archive.FileIndex[index];
    let xml = new TextDecoder().decode(entry.content);
    const footer = `&LGenerated by: ${meta.generatedBy.replace(/&/g, "&&")}\n${logisticsTimestamp(meta.generatedAt)}&RPage &P of &N`;
    xml = xml.replace(/<pageMargins\b[^>]*\/>/g, "");
    if (!xml.includes("<sheetPr")) xml = xml.replace(/(<worksheet\b[^>]*>)/, '$1<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>');
    xml = xml.replace(/<sheetViews>[\s\S]*?<\/sheetViews>/, '<sheetViews><sheetView workbookViewId="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>');
    const printSettings = '<printOptions horizontalCentered="1"/><pageMargins left="0.25" right="0.25" top="0.35" bottom="0.65" header="0.15" footer="0.2"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/><headerFooter><oddFooter>' + escapeXml(footer) + '</oddFooter></headerFooter>';
    // OOXML requires print settings before ignoredErrors, drawings, and other
    // trailing worksheet elements. Appending them at the end causes Excel repair.
    xml = xml.replace(/<(?:rowBreaks|colBreaks|customProperties|cellWatches|ignoredErrors|smartTags|drawing|legacyDrawing|legacyDrawingHF|picture|oleObjects|controls|webPublishItems|tableParts|extLst)\b|<\/worksheet>/,
      (element) => printSettings + element);
    entry.content = new TextEncoder().encode(xml); entry.size = entry.content.length;
  });
  const workbookIndex = archive.FullPaths.findIndex((path: string) => path.endsWith("/xl/workbook.xml"));
  const workbookEntry = archive.FileIndex[workbookIndex];
  let workbookXml = new TextDecoder().decode(workbookEntry.content);
  const names = `<definedName name="_xlnm.Print_Titles" localSheetId="0">'Logistics Sheets'!$1:$4</definedName>`;
  workbookXml = workbookXml.includes("</definedNames>") ? workbookXml.replace("</definedNames>", names + "</definedNames>") : workbookXml.replace("</workbook>", "<definedNames>" + names + "</definedNames></workbook>");
  workbookEntry.content = new TextEncoder().encode(workbookXml); workbookEntry.size = workbookEntry.content.length;
  // Normalize the writer's browser/Node output into actual binary bytes.
  return new Uint8Array(XLSX.CFB.write(archive, { type: "array", fileType: "zip", compression: true }));
}

export async function downloadLogisticsExcel(groups: LogisticsExportGroup[], meta: LogisticsExportMeta) {
  const bytes = await buildLogisticsExcel(groups, meta);
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const link = document.createElement("a"); link.href = url; link.download = filename(meta.generatedAt, "xlsx");
  document.body.appendChild(link);
  link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
