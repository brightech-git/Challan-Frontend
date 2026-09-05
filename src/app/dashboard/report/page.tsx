"use client";

import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import {
  Button,
  Checkbox,
  Dialog,
  Field,
  HStack,
  Input,
  Portal,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { LuFileSpreadsheet, LuFileText, LuPrinter } from "react-icons/lu";
import { DataTable } from "@/components/table";
import { ColumnConfig } from "@/components/table/types";
import { useTranWtsByDateRange } from "@/hooks";
import { TranWt } from "@/types";
import {
  ALL_COLUMN_KEYS,
  REPORT_COLUMNS,
  computeTotalsRow,
  dateStr,
} from "@/lib/reportColumns";
import { exportReportExcel } from "@/lib/reportExcelExport";
import { exportReportPdf } from "@/lib/reportPdfExport";
import "./print.css";

const todayStr = dateStr(new Date());
const defaultFromDate = todayStr;
const defaultToDate = todayStr;

const STORAGE_KEY = "report:selectedColumns";

function loadSavedColumns(): string[] {
  if (typeof window === "undefined") return ALL_COLUMN_KEYS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return ALL_COLUMN_KEYS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return ALL_COLUMN_KEYS;
    const valid = parsed.filter((k): k is string => ALL_COLUMN_KEYS.includes(k));
    return valid.length ? valid : ALL_COLUMN_KEYS;
  } catch {
    return ALL_COLUMN_KEYS;
  }
}

type ExportAction = "print" | "pdf" | "excel";

const actionLabel: Record<ExportAction, string> = {
  print: "Print",
  pdf: "Download PDF",
  excel: "Download Excel",
};

export default function ReportPage() {
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);

  const { data, isLoading, error } = useTranWtsByDateRange(fromDate, toDate);
  const rows = useMemo(() => data ?? [], [data]);

  // Columns actually applied to the last confirmed export/print — persisted
  // so the picker remembers your choice next time you open the page.
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => loadSavedColumns());
  // Working copy edited inside the dialog before the user confirms it.
  const [draftColumns, setDraftColumns] = useState<string[]>(() => loadSavedColumns());
  // Columns currently rendered into the hidden print table.
  const [printColumns, setPrintColumns] = useState<string[]>(ALL_COLUMN_KEYS);
  const [pendingAction, setPendingAction] = useState<ExportAction | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const dialog = useDisclosure();

  const tableColumns: ColumnConfig<TranWt>[] = useMemo(
    () =>
      REPORT_COLUMNS.map((col) => ({
        key: col.key,
        header: col.label,
        align: col.align,
        width: col.key === "description" || col.key === "toCompany" ? 220 : 130,
        render: (row: TranWt) =>
          col.key === "total" ? (
            <Text fontWeight="semibold" color="brand.700" _dark={{ color: "brand.300" }}>
              {col.getValue(row) || "—"}
            </Text>
          ) : (
            col.getValue(row) || "—"
          ),
      })),
    []
  );

  const printCols = useMemo(
    () => REPORT_COLUMNS.filter((c) => printColumns.includes(c.key)),
    [printColumns]
  );
  const printTotals = useMemo(() => computeTotalsRow(printCols, rows), [printCols, rows]);
  const generatedOn = useMemo(() => new Date().toLocaleString(), []);

  const openColumnPicker = (action: ExportAction) => {
    setPendingAction(action);
    setDraftColumns(selectedColumns);
    dialog.setOpen(true);
  };

  const toggleColumn = (key: string, checked: boolean) => {
    setDraftColumns((prev) => (checked ? [...prev, key] : prev.filter((k) => k !== key)));
  };

  const handleConfirm = async () => {
    const cols = draftColumns.length ? draftColumns : ALL_COLUMN_KEYS;
    const action = pendingAction;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
    setSelectedColumns(cols);
    dialog.setOpen(false);
    setPendingAction(null);

    const chosenColumns = REPORT_COLUMNS.filter((c) => cols.includes(c.key));

    if (action === "pdf") {
      setIsExporting(true);
      try {
        await exportReportPdf(chosenColumns, rows, { fromDate, toDate });
      } finally {
        setIsExporting(false);
      }
    } else if (action === "excel") {
      exportReportExcel(chosenColumns, rows, { fromDate, toDate });
    } else if (action === "print") {
      // Force the hidden print table to re-render with the new columns
      // before the browser's print dialog captures the page.
      flushSync(() => setPrintColumns(cols));
      window.print();
    }
  };

  return (
    <>
      <HStack
        justify="space-between"
        align="flex-end"
        wrap="wrap"
        gap={4}
        p={3}
        mb={6}
        borderWidth="1px"
        borderColor="brand.100"
        _dark={{ borderColor: "brand.900", bg: "gray.900" }}
        borderRadius="lg"
        bg="brand.50"
        className="no-print"
      >
        <HStack gap={3} wrap="nowrap" align="flex-end">
          {/* Field.Root's recipe defaults to width: 100%, which makes it
              claim a whole flex line on its own — pin an explicit width
              (not just maxW) so From/To sit side by side instead of
              stacking. */}
          <Field.Root width="150px" flexShrink={0}>
            <Field.Label fontSize="xs" color="fg.muted">
              From
            </Field.Label>
            <Input
              type="date"
              size="sm"
              bg="bg.panel"
              max={todayStr}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value > todayStr ? todayStr : e.target.value)}
            />
          </Field.Root>
          <Field.Root width="150px" flexShrink={0}>
            <Field.Label fontSize="xs" color="fg.muted">
              To
            </Field.Label>
            <Input
              type="date"
              size="sm"
              bg="bg.panel"
              max={todayStr}
              value={toDate}
              onChange={(e) => setToDate(e.target.value > todayStr ? todayStr : e.target.value)}
            />
          </Field.Root>
        </HStack>

        <HStack gap={2}>
          <Button size="sm" colorPalette="brand" onClick={() => openColumnPicker("print")}>
            <LuPrinter /> Print
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorPalette="red"
            onClick={() => openColumnPicker("pdf")}
          >
            <LuFileText /> PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorPalette="secondary"
            onClick={() => openColumnPicker("excel")}
          >
            <LuFileSpreadsheet /> Excel
          </Button>
        </HStack>
      </HStack>
      <div className="no-print">
        <DataTable<TranWt>
          columns={tableColumns}
          data={data}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          error={error instanceof Error ? error.message : null}
        />
      </div>

      {/* Hidden except under @media print — see print.css. */}
      <div id="report-print-table" className="report-print-only">
        <div className="report-print-title">Transaction Report</div>
        <div className="report-print-subtitle">
          {fromDate} to {toDate}
        </div>
        <div className="report-print-meta">Generated {generatedOn}</div>
        <table className="report-print-table-el">
          <thead>
            <tr>
              {printCols.map((col) => (
                <th key={col.key} className={col.align === "right" ? "align-right" : undefined}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {printCols.map((col) => (
                  <td key={col.key} className={col.align === "right" ? "align-right" : undefined}>
                    {col.getValue(row) || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              {printCols.map((col) => (
                <td key={col.key} className={col.align === "right" ? "align-right" : undefined}>
                  {printTotals[col.key] || ""}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <Dialog.Root open={dialog.open} onOpenChange={(d) => dialog.setOpen(d.open)} size="md">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header borderBottomWidth="1px" borderBottomColor="brand.100">
                <Dialog.Title>
                  Choose columns to {pendingAction ? actionLabel[pendingAction].toLowerCase() : ""}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <HStack justify="flex-end" mb={3} gap={3}>
                  <Button size="xs" variant="ghost" colorPalette="brand" onClick={() => setDraftColumns(ALL_COLUMN_KEYS)}>
                    Select all
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => setDraftColumns([])}>
                    Clear all
                  </Button>
                </HStack>
                <HStack wrap="wrap" gap={4} align="flex-start">
                  {REPORT_COLUMNS.map((col) => (
                    <Checkbox.Root
                      key={col.key}
                      checked={draftColumns.includes(col.key)}
                      onCheckedChange={(details) => toggleColumn(col.key, !!details.checked)}
                      colorPalette="brand"
                      minW="140px"
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>{col.label}</Checkbox.Label>
                    </Checkbox.Root>
                  ))}
                </HStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="ghost" onClick={() => dialog.setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm} disabled={draftColumns.length === 0} loading={isExporting}>
                  {pendingAction ? actionLabel[pendingAction] : "Confirm"}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
