"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Box, Button, Checkbox, Dialog, Field, HStack, Input, NativeSelect, Portal, Stack, Table, Text } from "@chakra-ui/react";
import { LuX, LuPrinter, LuFileDown, LuFileSpreadsheet } from "react-icons/lu";
import { logisticsSheetService } from "@/services";
import { getErrorMessage, toast } from "@/lib/toast";
import { validLogisticsDecimal, type LogisticsSheet, type LogisticsSheetDetails } from "@/types/logisticsSheet";
import LogisticsNavigation from "./LogisticsNavigation";
import { getStoredUser } from "@/lib/auth-storage";
import { logisticsArea, logisticsMetalWeight } from "@/lib/logisticsExport";

const formatWeight = (value: string | number | null | undefined) => value == null ? "—" : Number(value).toFixed(3);
const metalWeight = logisticsMetalWeight;

export default function SavedLogisticsSheets() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [groupFilter, setGroupFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState<"print" | "pdf" | "excel" | null>(null);
  const [groupBy, setGroupBy] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    title: string; description: string; label: string; danger: boolean;
    action: () => Promise<unknown>; successMessage: string;
  } | null>(null);
  const [editing, setEditing] = useState<LogisticsSheet | null>(null);
  const [brnNo, setBrnNo] = useState("");
  const [boxWt, setBoxWt] = useState("");
  const [active, setActive] = useState(true);
  const [editError, setEditError] = useState("");
  const activeFilter = status === "all" ? undefined : status === "active";
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["logisticsSheets", { active: activeFilter }],
    queryFn: () => logisticsSheetService.getAll(activeFilter),
  });

  const groups = useMemo(() => {
    const grouped = new Map<number, LogisticsSheetDetails[]>();
    for (const row of data ?? []) {
      if (groupFilter && !String(row.groupId).includes(groupFilter.trim())) continue;
      const entries = grouped.get(row.groupId) ?? [];
      entries.push(row);
      grouped.set(row.groupId, entries);
    }
    return [...grouped.entries()].sort(([a], [b]) => b - a)
      .map(([groupId, entries]) => ({ groupId, entries: entries.sort((a, b) => a.id - b.id) }));
  }, [data, groupFilter]);

  const exportSheets = async (format: "print" | "pdf" | "excel") => {
    if (exporting || !groups.length) return;
    setExporting(format);
    try {
      const tools = await import("@/lib/logisticsExport");
      const meta = {
        generatedBy: getStoredUser()?.name ?? "Unknown user",
        generatedAt: new Date(),
        groupBy,
        filter: `${status === "all" ? "All" : status === "active" ? "Active" : "Inactive"} rows${groupFilter.trim() ? ` | Group filter: ${groupFilter.trim()}` : ""}`,
      };
      if (format === "print") await tools.printLogisticsPdf(groups, meta);
      else if (format === "pdf") await tools.downloadLogisticsPdf(groups, meta);
      else await tools.downloadLogisticsExcel(groups, meta);
      toast.success(format === "print" ? "Print document prepared" : `${format.toUpperCase()} export downloaded`, `${groups.length} displayed sheet(s) included.`);
    } catch (error) {
      toast.error("Could not export logistics sheets", getErrorMessage(error));
    } finally {
      setExporting(null);
    }
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["logisticsSheets"] });

  const openEdit = async (row: LogisticsSheetDetails) => {
    setBusy(true);
    try {
      const record = await logisticsSheetService.getById(row.id);
      setBrnNo(record.brnNo == null ? "" : String(record.brnNo));
      setBoxWt(record.boxWt == null ? "" : String(record.boxWt));
      setActive(record.active);
      setEditError("");
      setEditing(record);
    } catch (error) {
      toast.error("Could not load logistics row", getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!editing || busy) return;
    if (!brnNo.trim()) {
      setEditError("Enter BRN No. (letters and numbers are allowed).");
      return;
    }
    if (!validLogisticsDecimal(boxWt)) {
      setEditError("Enter a non-negative box weight, with at most 17 digits and 3 decimal places.");
      return;
    }
    setBusy(true);
    setEditError("");
    try {
      await logisticsSheetService.update(editing.id, {
        tranId: editing.tranId, challanId: editing.challanId,
        fromCompanyId: editing.fromCompanyId, toCompanyId: editing.toCompanyId,
        brnNo: brnNo.trim(), boxWt: boxWt.trim(), active,
      });
      setEditing(null);
      toast.success("Logistics row updated", `Changes saved for challan #${editing.challanId}.`);
      await refresh();
    } catch (error) {
      setEditError(getErrorMessage(error));
      toast.error("Could not update logistics row", getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const runAction = async (action: () => Promise<unknown>, successMessage: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      toast.success(successMessage);
      setConfirmation(null);
      await refresh();
    } catch (error) {
      toast.error("Could not complete action", getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack gap={3}>
      <LogisticsNavigation actions={<>
        <Checkbox.Root size="sm" colorPalette="blue" checked={groupBy} disabled={!!exporting}
          onCheckedChange={({ checked }) => setGroupBy(checked === true)} mr={2}>
          <Checkbox.HiddenInput /><Checkbox.Control /><Checkbox.Label fontSize="xs" whiteSpace="nowrap">Group by sheet</Checkbox.Label>
        </Checkbox.Root>
        <Button size="sm" borderRadius="lg" variant="outline" colorPalette="blue" loading={exporting === "print"}
          disabled={!!exporting || !groups.length || isFetching || busy || !!error} onClick={() => { void exportSheets("print"); }}><LuPrinter />Print</Button>
        <Button size="sm" borderRadius="lg" variant="outline" colorPalette="red" loading={exporting === "pdf"}
          disabled={!!exporting || !groups.length || isFetching || busy || !!error} onClick={() => { void exportSheets("pdf"); }}><LuFileDown />PDF</Button>
        <Button size="sm" borderRadius="lg" variant="outline" colorPalette="green" loading={exporting === "excel"}
          disabled={!!exporting || !groups.length || isFetching || busy || !!error} onClick={() => { void exportSheets("excel"); }}><LuFileSpreadsheet />Excel</Button>
      </>} />
      <HStack justify="space-between" wrap="wrap" gap={3}>
        <Text fontSize="xs" color="fg.muted">View groups and manage saved logistics rows</Text>
        <HStack gap={2} wrap="wrap">
          <Input size="xs" maxW="140px" placeholder="Filter group ID" aria-label="Filter saved group ID"
            value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} />
          <NativeSelect.Root size="xs" width="140px">
            <NativeSelect.Field aria-label="Saved sheet status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All rows</option><option value="active">Active rows</option><option value="inactive">Inactive rows</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <Button size="xs" variant="outline" loading={isFetching} disabled={busy} onClick={() => { void refetch(); }}>Refresh</Button>
          <Button size="xs" variant="outline" colorPalette="red" disabled={busy || !data?.some((row) => row.active)}
            onClick={() => setConfirmation({
              title: "Clear all active rows?",
              description: "This deactivates every active logistics row, including rows outside the current filter. Saved records remain available under Inactive rows.",
              label: "Clear Active Rows", danger: true,
              action: () => logisticsSheetService.clear(), successMessage: "All active logistics rows deactivated.",
            })}>Clear Active Rows</Button>
        </HStack>
      </HStack>
      {isLoading && <Text role="status" fontSize="xs">Loading saved sheets...</Text>}
      {error && <Text role="alert" color="fg.error" fontSize="xs">Could not load saved sheets: {getErrorMessage(error)}</Text>}
      {!isLoading && !error && !groups.length && <Text fontSize="xs" color="fg.muted">No saved sheets match this filter.</Text>}
      {groups.map(({ groupId, entries }) => (
        <Box key={groupId} borderWidth="1px" borderRadius="sm" overflow="hidden" bg="bg.panel">
          <HStack px={3} py={2} justify="space-between" bg="bg.muted" borderBottomWidth="1px">
            <Text fontSize="xs" fontWeight="600">Sheet #{groupId} · {entries.length} row(s)</Text>
            {entries.some((row) => !row.active) && <Button size="xs" colorPalette="green" variant="solid" borderRadius="lg" disabled={busy}
              onClick={() => setConfirmation({
                title: `Activate sheet #${groupId}?`, description: "All rows in this group will become active.",
                label: "Activate Group", danger: false,
                action: () => logisticsSheetService.activate(groupId), successMessage: `Sheet #${groupId} activated.`,
              })}>Activate Group</Button>}
          </HStack>
          <Box overflowX="auto">
            <Table.Root size="sm" minW="1100px" width="100%" tableLayout="fixed" fontSize="11px" css={{
              "& th, & td": { padding: "5px 7px", borderRight: "1px solid", borderColor: "border", height: "32px" },
              "& th": { background: "bg.subtle", fontSize: "10px", textTransform: "uppercase", whiteSpace: "nowrap" },
              "& tbody tr:nth-of-type(even) td": { background: "bg.subtle" },
              "& th:last-child, & td:last-child": { borderRight: 0 },
            }}>
              <Table.Header><Table.Row>
                {["#", "Challan", "Date", "From", "To", "Area", "BRN No.", "Box Wt.", "Gold Wt.", "Silver Wt.", "Status", "Actions"].map((label, index) => (
                  <Table.ColumnHeader key={label} width={["3%", "6%", "8%", "12%", "12%", "16%", "8%", "6%", "6%", "6%", "6%", "11%"][index]}>{label}</Table.ColumnHeader>
                ))}
              </Table.Row></Table.Header>
              <Table.Body>{entries.map((row, index) => (
                <Table.Row key={row.id} opacity={row.active ? 1 : 0.65}>
                  <Table.Cell>{index + 1}</Table.Cell>
                  <Table.Cell>{row.challanId}</Table.Cell>
                  <Table.Cell>{row.tranWt?.tranDate?.slice(0, 10) ?? "—"}</Table.Cell>
                  <Table.Cell><Text truncate title={row.fromCompanyName ?? row.fromCompanyId}>{row.fromCompanyName ?? row.fromCompanyId}</Text></Table.Cell>
                  <Table.Cell><Text truncate title={row.toCompanyName ?? row.toCompanyId}>{row.toCompanyName ?? row.toCompanyId}</Text></Table.Cell>
                  <Table.Cell><Text truncate title={logisticsArea(row)}>{logisticsArea(row) || "—"}</Text></Table.Cell>
                  <Table.Cell>{row.brnNo ?? "—"}</Table.Cell>
                  <Table.Cell textAlign="right">{formatWeight(row.boxWt)}</Table.Cell>
                  <Table.Cell textAlign="right">{formatWeight(metalWeight(row, "GOLD"))}</Table.Cell>
                  <Table.Cell textAlign="right">{formatWeight(metalWeight(row, "SILVER"))}</Table.Cell>
                  <Table.Cell><Badge size="xs" borderRadius="full" colorPalette={row.active ? "green" : "gray"} variant="subtle">{row.active ? "Active" : "Inactive"}</Badge></Table.Cell>
                  <Table.Cell><HStack gap={1}>
                    <Button size="xs" variant="ghost" px={1} disabled={busy} onClick={() => { void openEdit(row); }}>Edit</Button>
                    {row.active && <Button size="xs" variant="ghost" colorPalette="red" px={1} disabled={busy} onClick={() => setConfirmation({
                      title: "Deactivate logistics row?",
                      description: `Challan #${row.challanId} in sheet #${groupId} will be marked inactive. You can reactivate it later.`,
                      label: "Deactivate", danger: true,
                      action: () => logisticsSheetService.deactivate(row.id), successMessage: `Logistics row #${row.id} deactivated.`,
                    })}>Deactivate</Button>}
                  </HStack></Table.Cell>
                </Table.Row>
              ))}</Table.Body>
              <Table.Footer><Table.Row fontWeight="600">
                <Table.Cell colSpan={7}>Total ({entries.length} displayed rows)</Table.Cell>
                <Table.Cell textAlign="right">{formatWeight(entries.reduce((sum, row) => sum + Number(row.boxWt ?? 0), 0))}</Table.Cell>
                <Table.Cell textAlign="right">{formatWeight(entries.reduce((sum, row) => sum + metalWeight(row, "GOLD"), 0))}</Table.Cell>
                <Table.Cell textAlign="right">{formatWeight(entries.reduce((sum, row) => sum + metalWeight(row, "SILVER"), 0))}</Table.Cell>
                <Table.Cell colSpan={2} />
              </Table.Row></Table.Footer>
            </Table.Root>
          </Box>
        </Box>
      ))}

      <Dialog.Root role="alertdialog" open={confirmation !== null} size="sm"
        onOpenChange={({ open }) => { if (!open && !busy) setConfirmation(null); }}>
        <Portal><Dialog.Backdrop backdropFilter="blur(4px)" /><Dialog.Positioner><Dialog.Content borderRadius="2xl" overflow="hidden" boxShadow="2xl" borderWidth="1px">
          <Dialog.Header><Dialog.Title>{confirmation?.title}</Dialog.Title></Dialog.Header>
          <Dialog.Body><Text fontSize="sm" color="fg.muted">{confirmation?.description}</Text></Dialog.Body>
          <Dialog.Footer>
            <Button borderRadius="lg" variant="outline" disabled={busy} autoFocus onClick={() => setConfirmation(null)}>Cancel</Button>
            <Button borderRadius="lg" colorPalette={confirmation?.danger ? "red" : "green"} loading={busy}
              onClick={() => { if (confirmation) void runAction(confirmation.action, confirmation.successMessage); }}>
              {confirmation?.label}
            </Button>
          </Dialog.Footer>
        </Dialog.Content></Dialog.Positioner></Portal>
      </Dialog.Root>

      <Dialog.Root open={editing !== null} onOpenChange={({ open }) => { if (!open && !busy) setEditing(null); }} size="sm" placement="center">
        <Portal><Dialog.Backdrop backdropFilter="blur(4px)" /><Dialog.Positioner p={4}><Dialog.Content borderRadius="2xl" overflow="hidden" boxShadow="2xl" borderWidth="1px" maxW="460px">
          <Dialog.Header px={6} py={5} bg="bg.subtle" borderBottomWidth="1px">
            <Box>
              <Dialog.Title fontSize="lg" fontWeight="600">Edit Logistics Row</Dialog.Title>
              <Text fontSize="xs" color="fg.muted" mt={1}>Update shipment details for this challan</Text>
            </Box>
            <Dialog.CloseTrigger asChild position="absolute" top={4} right={4}>
              <Button size="xs" variant="ghost" borderRadius="full" aria-label="Close edit dialog" disabled={busy}><LuX /></Button>
            </Dialog.CloseTrigger>
          </Dialog.Header>
          <Dialog.Body px={6} py={5}>
            <form id="edit-logistics-row" onSubmit={(event) => { event.preventDefault(); void saveEdit(); }}>
              <Stack gap={4}>
                <HStack gap={2} borderWidth="1px" borderRadius="xl" bg="bg.subtle" px={3} py={3}>
                  <Badge colorPalette="blue" borderRadius="full" px={2}>Sheet #{editing?.groupId}</Badge>
                  <Text fontSize="xs" fontWeight="500">Challan #{editing?.challanId}</Text>
                </HStack>
                <Field.Root required><Field.Label>BRN No.</Field.Label>
                  <Input type="text" borderRadius="xl" bg="bg.subtle" value={brnNo} disabled={busy} onChange={(event) => setBrnNo(event.target.value)} autoFocus required />
                </Field.Root>
                <Field.Root required><Field.Label>Box Weight</Field.Label>
                  <Input borderRadius="xl" bg="bg.subtle" value={boxWt} inputMode="decimal" disabled={busy} onChange={(event) => setBoxWt(event.target.value)} required />
                </Field.Root>
                <Field.Root><Field.Label>Status</Field.Label><NativeSelect.Root disabled={busy}>
                  <NativeSelect.Field borderRadius="xl" bg="bg.subtle" value={String(active)} onChange={(event) => setActive(event.target.value === "true")}>
                    <option value="true">Active</option><option value="false">Inactive</option>
                  </NativeSelect.Field><NativeSelect.Indicator />
                </NativeSelect.Root></Field.Root>
                {editError && <Text role="alert" color="fg.error" fontSize="sm">{editError}</Text>}
              </Stack>
            </form>
          </Dialog.Body>
          <Dialog.Footer px={6} py={4} bg="bg.subtle" borderTopWidth="1px"><Button borderRadius="lg" variant="outline" disabled={busy} onClick={() => setEditing(null)}>Cancel</Button>
            <Button borderRadius="lg" colorPalette="blue" type="submit" form="edit-logistics-row" loading={busy}>Save Changes</Button></Dialog.Footer>
        </Dialog.Content></Dialog.Positioner></Portal>
      </Dialog.Root>
    </Stack>
  );
}
