"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { LuX } from "react-icons/lu";
import { Box, Button, Input, Stack, Table, Text } from "@chakra-ui/react";
import { logisticsSheetService, tranWtService } from "@/services";
import { getErrorMessage, toast } from "@/lib/toast";
import { useQueryClient } from "@tanstack/react-query";
import type { TranWt } from "@/types";
import { validLogisticsDecimal } from "@/types/logisticsSheet";
import LogisticsNavigation from "./LogisticsNavigation";

interface SheetRow {
  key: number;
  challanNo: string;
  loadedId: number | null;
  date: string;
  from: string;
  to: string;
  area: string;
  brnNo: string;
  boxWt: string;
  goldWt: string;
  silverWt: string;
  loading: boolean;
  error: string;
  notice: string;
  transaction: TranWt | null;
}
const emptyRow = (key: number): SheetRow => ({
  key,
  challanNo: "",
  loadedId: null,
  date: "",
  from: "",
  to: "",
  area: "",
  brnNo: "",
  boxWt: "",
  goldWt: "",
  silverWt: "",
  loading: false,
  error: "",
  notice: "",
  transaction: null,
});
const weight = (value: number) => value.toFixed(3);

export default function LogisticsPage() {
  const [rows, setRows] = useState<SheetRow[]>([emptyRow(1)]);
  const nextKey = useRef(2);
  const pending = useRef(new Set<number>());
  const savingAllRef = useRef(false);
  const [savingAll, setSavingAll] = useState(false);
  const queryClient = useQueryClient();
  const challanInputs = useRef(new Map<number, HTMLInputElement>());
  const brnInputs = useRef(new Map<number, HTMLInputElement>());
  const boxInputs = useRef(new Map<number, HTMLInputElement>());
  const focusTarget = useRef<{ key: number; field: "challan" | "brn" } | null>(
    null,
  );

  useLayoutEffect(() => {
    const target = focusTarget.current;
    if (!target) return;
    const input = (
      target.field === "brn" ? brnInputs : challanInputs
    ).current.get(target.key);
    if (input && !input.disabled) {
      input.focus();
      input.select();
      focusTarget.current = null;
    }
  }, [rows, savingAll]);

  const focusNextRow = (row: SheetRow) => {
    const index = rows.findIndex((entry) => entry.key === row.key);
    const next = rows[index + 1];
    if (next) {
      challanInputs.current.get(next.key)?.focus();
      challanInputs.current.get(next.key)?.select();
    } else {
      const key = nextKey.current++;
      focusTarget.current = { key, field: "challan" };
      setRows((previous) => [...previous, emptyRow(key)]);
    }
  };
  const updateRow = (key: number, patch: Partial<SheetRow>) =>
    setRows((previous) =>
      previous.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );

  const loadedRows = rows.filter((row) => row.transaction);

  const saveAll = async () => {
    if (savingAllRef.current || pending.current.size) return;
    for (const row of rows) {
      if (!row.challanNo.trim()) continue;
      if (!row.transaction) {
        updateRow(row.key, { error: "Load a valid challan before saving." });
        toast.warning(
          "Sheet is incomplete",
          "Load a valid challan before saving.",
        );
        challanInputs.current.get(row.key)?.focus();
        return;
      }
      if (!row.brnNo.trim()) {
        updateRow(row.key, {
          error:
            "Enter BRN No. (letters and numbers are allowed).",
        });
        toast.warning(
          "Check BRN No.",
          `Enter a valid BRN No. for challan #${row.loadedId}.`,
        );
        brnInputs.current.get(row.key)?.focus();
        return;
      }
      if (!validLogisticsDecimal(row.boxWt)) {
        updateRow(row.key, {
          error: "Enter a non-negative box weight (up to 3 decimal places).",
        });
        toast.warning(
          "Check Box Weight",
          `Enter a valid box weight for challan #${row.loadedId}.`,
        );
        boxInputs.current.get(row.key)?.focus();
        return;
      }
    }
    if (!loadedRows.length) return;
    savingAllRef.current = true;
    setSavingAll(true);
    try {
      const result = await logisticsSheetService.createBulk(
        loadedRows.map((row) => ({
          // Challan lookup currently identifies the transaction by its id.
          tranId: row.transaction!.id,
          challanId: row.transaction!.id,
          fromCompanyId: row.transaction!.fromCompanyId,
          toCompanyId: row.transaction!.toCompanyId,
          brnNo: row.brnNo.trim(),
          boxWt: row.boxWt.trim(),
          active: true,
        })),
      );
      toast.success(
        "Logistics sheet created",
        `${result.length} row(s) saved${result[0] ? ` in sheet #${result[0].groupId}` : ""}. View it on Saved Sheets.`,
      );
      const key = nextKey.current++;
      focusTarget.current = { key, field: "challan" };
      setRows([emptyRow(key)]);
      void queryClient.invalidateQueries({ queryKey: ["logisticsSheets"] });
    } catch (error) {
      toast.error("Could not create logistics sheet", getErrorMessage(error));
    } finally {
      savingAllRef.current = false;
      setSavingAll(false);
    }
  };

  const loadChallan = async (row: SheetRow) => {
    if (!row.challanNo.trim() || pending.current.has(row.key)) return;
    const id = Number(row.challanNo);
    if (row.loadedId === id) return;
    if (!Number.isSafeInteger(id) || id <= 0) {
      updateRow(row.key, { error: "Enter a valid challan number." });
      return;
    }
    if (
      rows.some(
        (other) => other.key !== row.key && Number(other.challanNo) === id,
      )
    ) {
      updateRow(row.key, { error: `Challan #${id} is already in the sheet.` });
      return;
    }
    pending.current.add(row.key);
    updateRow(row.key, { loading: true, error: "", notice: "" });
    try {
      const transaction = await tranWtService.getById(id);
      if (!transaction || transaction.id !== id)
        throw new Error("Challan not found.");
      const metal = transaction.metalName?.trim().toUpperCase();
      const metalId = transaction.metalId?.trim().toUpperCase();
      const isGold = metal ? metal.includes("GOLD") : metalId === "G";
      const isSilver = metal ? metal.includes("SILVER") : metalId === "S";
      const netWeight =
        transaction.netWt == null ? "" : weight(transaction.netWt);
      const newKey = nextKey.current++;
      focusTarget.current = { key: row.key, field: "brn" };
      setRows((previous) => {
        if (!previous.some((entry) => entry.key === row.key)) return previous;
        const updated = previous.map((entry) =>
          entry.key === row.key
            ? {
                ...entry,
                loadedId: id,
                transaction,
                brnNo: transaction.brnNo ?? "",
                boxWt:
                  transaction.boxWt == null ? "" : String(transaction.boxWt),
                date: transaction.tranDate?.slice(0, 10) ?? "",
                from:
                  transaction.fromCompanyDetails?.companyName ??
                  transaction.fromCompanyId,
                to:
                  transaction.toCompanyDetails?.companyName ??
                  transaction.toCompanyId,
                area: transaction.toCompanyDetails?.area?.trim() ?? "",
                goldWt: isGold ? netWeight : "",
                silverWt: isSilver ? netWeight : "",
                loading: false,
                notice:
                  !isGold && !isSilver
                    ? `Metal: ${transaction.metalName ?? transaction.metalId ?? "unspecified"}. Gold/silver weights left blank.`
                    : "",
              }
            : entry,
        );
        return updated.some((entry) => !entry.challanNo)
          ? updated
          : [...updated, emptyRow(newKey)];
      });
    } catch (error) {
      updateRow(row.key, { loading: false, error: getErrorMessage(error) });
      toast.error("Could not load challan", getErrorMessage(error));
    } finally {
      pending.current.delete(row.key);
    }
  };
  const total = (key: "boxWt" | "goldWt" | "silverWt") =>
    weight(
      rows.reduce(
        (sum, row) => sum + (row.loadedId ? Number(row[key]) || 0 : 0),
        0,
      ),
    );

  return (
    <Stack gap={3}>
      <LogisticsNavigation />
      <Text fontSize="xs" color="fg.muted">
        Enter Challan No., then BRN No. and Box Wt. Press Enter in Box Wt. for
        the next row. Click Save All below when finished.
      </Text>
      <Box
        borderWidth="1px"
        borderColor="border.emphasized"
        borderRadius="sm"
        overflowX="auto"
        bg="bg.panel"
      >
        <Table.Root
          size="sm"
          width="100%"
          minW="1080px"
          tableLayout="fixed"
          fontSize="11px"
          css={{
            "& th, & td": {
              padding: "3px 7px",
              height: "32px",
              borderRight: "1px solid",
              borderBottom: "1px solid",
              borderColor: "border",
              verticalAlign: "middle",
            },
            "& th:last-child, & td:last-child": { borderRight: 0 },
            "& th": {
              background: "bg.muted",
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            },
            "& tbody tr:nth-of-type(even) td": { background: "bg.subtle" },
            "& tbody tr:hover td": { background: "bg.muted" },
            "& input": {
              height: "25px",
              minWidth: 0,
              paddingInline: "5px",
              fontSize: "11px",
              borderRadius: "2px",
              background: "bg.panel",
            },
            "& input[type=number]": {
              appearance: "textfield",
              MozAppearance: "textfield",
            },
            "& input::-webkit-inner-spin-button, & input::-webkit-outer-spin-button":
              { WebkitAppearance: "none", margin: 0 },
            "& tfoot td": {
              background: "bg.muted",
              fontWeight: 600,
              borderBottom: 0,
              height: "32px",
            },
          }}
        >
          <Table.Header>
            <Table.Row>
              {[
                "S.No.",
                "Challan No.",
                "Date",
                "From",
                "To",
                "Area",
                "BRN No.",
                "Box Wt.",
                "Gold Wt.",
                "Silver Wt.",
                "",
              ].map((label, index) => (
                <Table.ColumnHeader
                  key={index}
                  textAlign={
                    index === 0 || index === 10
                      ? "center"
                      : index >= 7
                        ? "right"
                        : "left"
                  }
                  width={
                    [
                      "3%",
                      "8%",
                      "8%",
                      "15%",
                      "15%",
                      "20%",
                      "9%",
                      "7%",
                      "6%",
                      "6%",
                      "3%",
                    ][index]
                  }
                >
                  {label}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row, index) => (
              <Table.Row key={row.key}>
                <Table.Cell textAlign="center" color="fg.muted">
                  {index + 1}
                </Table.Cell>
                <Table.Cell>
                  <Input
                    size="sm"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="Challan No."
                    aria-label={`Challan number row ${index + 1}`}
                    ref={(node) => {
                      if (node) challanInputs.current.set(row.key, node);
                      else challanInputs.current.delete(row.key);
                    }}
                    value={row.challanNo}
                    disabled={row.loading || savingAll}
                    aria-invalid={!!row.error}
                    onChange={(event) =>
                      updateRow(row.key, {
                        ...emptyRow(row.key),
                        challanNo: event.target.value,
                      })
                    }
                    onBlur={() => {
                      void loadChallan(row);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (row.loadedId === Number(row.challanNo))
                          brnInputs.current.get(row.key)?.focus();
                        else void loadChallan(row);
                      }
                    }}
                  />
                  {row.loading && (
                    <Text fontSize="xs" role="status">
                      Loading...
                    </Text>
                  )}
                  {row.error && (
                    <Text fontSize="xs" role="alert" color="fg.error">
                      {row.error}
                    </Text>
                  )}
                  {row.notice && (
                    <Text fontSize="xs" role="status" color="fg.muted">
                      {row.notice}
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{row.date || "—"}</Table.Cell>
                <Table.Cell>
                  <Text truncate title={row.from}>
                    {row.from || "—"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text truncate title={row.to}>
                    {row.to || "—"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Text truncate title={row.area}>
                    {row.area || "—"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Input
                    size="sm"
                    width="100%"
                    aria-label={`BRN number row ${index + 1}`}
                    value={row.brnNo}
                    disabled={!row.loadedId || savingAll}
                    ref={(node) => {
                      if (node) brnInputs.current.set(row.key, node);
                      else brnInputs.current.delete(row.key);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        boxInputs.current.get(row.key)?.focus();
                      }
                    }}
                    onChange={(event) =>
                      updateRow(row.key, {
                        brnNo: event.target.value,
                        notice: "",
                        error: "",
                      })
                    }
                  />
                </Table.Cell>
                <Table.Cell>
                  <Input
                    size="sm"
                    width="100%"
                    textAlign="right"
                    type="number"
                    min={0}
                    step="0.001"
                    aria-label={`Box weight row ${index + 1}`}
                    ref={(node) => {
                      if (node) boxInputs.current.set(row.key, node);
                      else boxInputs.current.delete(row.key);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        focusNextRow(row);
                      }
                    }}
                    value={row.boxWt}
                    disabled={!row.loadedId || savingAll}
                    onChange={(event) =>
                      updateRow(row.key, {
                        boxWt: event.target.value,
                        notice: "",
                        error: "",
                      })
                    }
                  />
                </Table.Cell>
                <Table.Cell textAlign="right" fontVariantNumeric="tabular-nums">
                  {row.goldWt || "—"}
                </Table.Cell>
                <Table.Cell textAlign="right" fontVariantNumeric="tabular-nums">
                  {row.silverWt || "—"}
                </Table.Cell>
                <Table.Cell>
                  {rows.length > 1 && (
                    <Button
                      size="xs"
                      variant="ghost"
                      colorPalette="red"
                      disabled={row.loading || savingAll}
                      aria-label={`Remove row ${index + 1}`}
                      onClick={() =>
                        setRows((previous) =>
                          previous.filter((entry) => entry.key !== row.key),
                        )
                      }
                      title="Remove row"
                      px={0}
                      minW={0}
                      h="24px"
                    >
                      <LuX size={13} />
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row fontWeight="bold">
              <Table.Cell colSpan={7}>Total</Table.Cell>
              <Table.Cell textAlign="right">{total("boxWt")}</Table.Cell>
              <Table.Cell textAlign="right">{total("goldWt")}</Table.Cell>
              <Table.Cell textAlign="right">{total("silverWt")}</Table.Cell>
              <Table.Cell />
            </Table.Row>
          </Table.Footer>
        </Table.Root>
      </Box>
      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={3}>
        <Button
          size="sm"
          loading={savingAll}
          disabled={!loadedRows.length || rows.some((row) => row.loading)}
          onClick={() => {
            void saveAll();
          }}
        >
          Save All{loadedRows.length ? ` (${loadedRows.length})` : ""}
        </Button>
      </Box>
      <Text fontSize="xs" color="fg.muted">
        Save All creates one logistics sheet group. Unsaved entries remain only
        until you leave or refresh.
      </Text>
    </Stack>
  );
}
