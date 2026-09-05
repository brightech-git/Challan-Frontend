"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  Box,
  Button,
  Dialog,
  Field,
  Grid,
  GridItem,
  HStack,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { DataTable } from "@/components/table";
import { ColumnConfig } from "@/components/table/types";
import {
  useActiveCompanies,
  useCreateTranWt,
  useDeleteTranWt,
  useMetalMasts,
  useTranWts,
  useUpdateTranWt,
} from "@/hooks";
import { Company, TranType, TranWt, TranWtInput } from "@/types";

/**
 * Transaction / Challan creation page.
 *
 * This is the real "create a challan" screen: pick a From company, a To
 * company, and a metal, enter weights + rate + GST %, and the value/tax/
 * total fields are computed live client-side as you type (the backend
 * stores whatever numbers it's given — see TranWtService.java — it does
 * not compute them itself). The formula used here:
 *
 *   netWt        = grsWt - stnWt
 *   basisWeight  = calType === "NETWT" ? netWt : grsWt
 *   value        = basisWeight * rate
 *   cgstAmt      = value * cgstPer / 100   (stored as csstAmt per the API)
 *   sgstAmt      = value * sgstPer / 100
 *   igstAmt      = value * igstPer / 100
 *   total        = value + cgstAmt + sgstAmt + igstAmt
 *
 * This isn't a DynamicForm instance (unlike Company/Metal/Users) because
 * the cross-field calculation and the company/metal dropdowns (populated
 * from other modules' data) don't fit the generic FieldConfig model.
 */

interface DraftState {
  fromCompanyId: string;
  toCompanyId: string;
  tranDate: string;
  metalId: string;
  description: string;
  grsWt: string;
  stnWt: string;
  rate: string;
  calType: TranType;
  cgstPer: string;
  sgstPer: string;
  igstPer: string;
  hsnCode: string;
}

const emptyDraft: DraftState = {
  fromCompanyId: "",
  toCompanyId: "",
  tranDate: new Date().toISOString().slice(0, 10),
  metalId: "",
  description: "",
  grsWt: "",
  stnWt: "",
  rate: "",
  calType: "NETWT",
  cgstPer: "",
  sgstPer: "",
  igstPer: "",
  hsnCode: "",
};

function toDraft(row: TranWt): DraftState {
  return {
    fromCompanyId: row.fromCompanyId,
    toCompanyId: row.toCompanyId,
    tranDate: row.tranDate ? row.tranDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
    metalId: row.metalId ?? "",
    description: row.description ?? "",
    grsWt: row.grsWt != null ? String(row.grsWt) : "",
    stnWt: row.stnWt != null ? String(row.stnWt) : "",
    rate: row.rate != null ? String(row.rate) : "",
    calType: row.calType ?? "NETWT",
    cgstPer: row.cgstPer != null ? String(row.cgstPer) : "",
    sgstPer: row.sgstPer != null ? String(row.sgstPer) : "",
    igstPer: row.igstPer != null ? String(row.igstPer) : "",
    hsnCode: row.hsnCode ?? "",
  };
}

const num = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

function computeTotals(draft: DraftState) {
  const grsWt = num(draft.grsWt);
  const stnWt = num(draft.stnWt);
  const netWt = grsWt - stnWt;
  const basisWeight = draft.calType === "NETWT" ? netWt : grsWt;
  const value = basisWeight * num(draft.rate);
  const cgstAmt = (value * num(draft.cgstPer)) / 100;
  const sgstAmt = (value * num(draft.sgstPer)) / 100;
  const igstAmt = (value * num(draft.igstPer)) / 100;
  const total = value + cgstAmt + sgstAmt + igstAmt;

  return { netWt, value, cgstAmt, sgstAmt, igstAmt, total };
}

const money = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Weights are stored/displayed to 3 decimal places, amounts (rate, GST
// amounts, value, total) to 2 — matching how the backend/reports round
// these figures.
const weight = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export default function TranWtPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<TranWt | null>(null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [formError, setFormError] = useState<string | null>(null);
  const dialog = useDisclosure();

  const { data, isLoading, error } = useTranWts(search || undefined);
  // Fetch the active company list unfiltered and split it by companyType
  // client-side — the backend's /company/active doesn't reliably honor the
  // companyType query param (it was seen returning every active company
  // regardless of the filter), which left both dropdowns empty when
  // requested with a type that matched nothing.
  const { data: activeCompanies } = useActiveCompanies();
  const { data: metals } = useMetalMasts();

  const createTranWt = useCreateTranWt();
  const updateTranWt = useUpdateTranWt();
  const deleteTranWt = useDeleteTranWt();

  const fromCompanies = useMemo(
    () => (activeCompanies ?? []).filter((c) => c.companyType === "FROM"),
    [activeCompanies]
  );
  const toCompanies = useMemo(
    () => (activeCompanies ?? []).filter((c) => c.companyType === "TO"),
    [activeCompanies]
  );

  const activeMetals = useMemo(() => (metals ?? []).filter((m) => m.active !== false), [metals]);

  const totals = useMemo(() => computeTotals(draft), [draft]);

  // Prefer the transaction's own saved company snapshot (fromCompanyDetails/
  // toCompanyDetails) when editing — the From company select is locked after
  // creation and may no longer be in the active list, so that's the only
  // reliable source for its details in that case. Otherwise look the pick
  // up in the active company list as the user selects it.
  const selectedFromCompany =
    (editing && editing.fromCompanyId === draft.fromCompanyId
      ? editing.fromCompanyDetails
      : null) ??
    (fromCompanies ?? []).find((c) => c.companyId === draft.fromCompanyId) ??
    null;

  const selectedToCompany =
    (editing && editing.toCompanyId === draft.toCompanyId ? editing.toCompanyDetails : null) ??
    (toCompanies ?? []).find((c) => c.companyId === draft.toCompanyId) ??
    null;

  const companyDetailsLine = (company: Company | null | undefined) =>
    company
      ? [company.gstNo && `GST: ${company.gstNo}`, company.phone, company.address1]
          .filter(Boolean)
          .join(" · ")
      : null;

  const columns: ColumnConfig<TranWt>[] = useMemo(
    () => [
      { key: "id", header: "ID", width: 70 },
      {
        key: "tranDate",
        header: "Date",
        width: 110,
        render: (row) => (row.tranDate ? new Date(row.tranDate).toLocaleDateString() : "—"),
      },
      {
        key: "fromCompanyId",
        header: "From",
        width: 160,
        render: (row) => row.fromCompanyDetails?.companyName ?? row.fromCompanyId,
      },
      {
        key: "toCompanyId",
        header: "To",
        width: 160,
        render: (row) => row.toCompanyDetails?.companyName ?? row.toCompanyId,
      },
      {
        key: "metalId",
        header: "Metal",
        width: 100,
        render: (row) => row.metalName ?? row.metalId ?? "—",
      },
      {
        key: "netWt",
        header: "Net Wt",
        width: 100,
        render: (row) => (row.netWt != null ? money(row.netWt) : "—"),
      },
      {
        key: "value",
        header: "Value",
        width: 120,
        render: (row) => (row.value != null ? money(row.value) : "—"),
      },
      {
        key: "total",
        header: "Total",
        width: 130,
        render: (row) => (
          <Text fontWeight="semibold">{row.total != null ? money(row.total) : "—"}</Text>
        ),
      },
    ],
    []
  );

  const openCreate = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setFormError(null);
    dialog.setOpen(true);
  };

  const openEdit = (row: TranWt) => {
    setEditing(row);
    setDraft(toDraft(row));
    setFormError(null);
    dialog.setOpen(true);
  };

  const setField = <K extends keyof DraftState>(key: K, value: DraftState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // CGST/SGST and IGST are mutually exclusive (intra-state vs inter-state
  // tax) — entering one clears and disables the other side.
  const setCgstOrSgst = (key: "cgstPer" | "sgstPer", value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value, igstPer: value ? "" : prev.igstPer }));
  };

  const setIgst = (value: string) => {
    setDraft((prev) => ({
      ...prev,
      igstPer: value,
      cgstPer: value ? "" : prev.cgstPer,
      sgstPer: value ? "" : prev.sgstPer,
    }));
  };

  const igstDisabled = draft.cgstPer !== "" || draft.sgstPer !== "";
  const cgstSgstDisabled = draft.igstPer !== "";

  const buildInput = (): TranWtInput | null => {
    if (!draft.fromCompanyId) {
      setFormError("From Company is required");
      return null;
    }
    if (!draft.toCompanyId) {
      setFormError("To Company is required");
      return null;
    }
    if (!draft.metalId) {
      setFormError("Metal is required");
      return null;
    }

    return {
      fromCompanyId: draft.fromCompanyId,
      toCompanyId: draft.toCompanyId,
      tranDate: draft.tranDate || null,
      metalId: draft.metalId,
      description: draft.description || null,
      grsWt: draft.grsWt ? num(draft.grsWt) : null,
      netWt: totals.netWt,
      stnWt: draft.stnWt ? num(draft.stnWt) : null,
      rate: draft.rate ? num(draft.rate) : null,
      calType: draft.calType,
      value: totals.value,
      cgstPer: draft.cgstPer ? num(draft.cgstPer) : null,
      sgstPer: draft.sgstPer ? num(draft.sgstPer) : null,
      igstPer: draft.igstPer ? num(draft.igstPer) : null,
      csstAmt: totals.cgstAmt,
      sgstAmt: totals.sgstAmt,
      igstAmt: totals.igstAmt,
      total: totals.total,
      hsnCode: draft.hsnCode || null,
      userId: null,
    };
  };

  const isSubmitting = createTranWt.isPending || updateTranWt.isPending;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setFormError(null);
    const input = buildInput();
    if (!input) return;

    try {
      if (editing) {
        await updateTranWt.mutateAsync({ id: editing.id, input, companyId: draft.fromCompanyId });
      } else {
        await createTranWt.mutateAsync(input);
      }
      dialog.setOpen(false);
    } catch {
      // Errors already surface via the mutation's onError toast; keep the
      // dialog open so the user can fix and retry.
    }
  };

  const handleDelete = async (row: TranWt) => {
    if (!confirm(`Delete transaction #${row.id}?`)) return;
    await deleteTranWt.mutateAsync(row.id);
  };

  const formRef = useRef<HTMLFormElement>(null);

  // Enter moves to the next field instead of doing nothing (this form has
  // no native <form> submit to fall back on) — mirrors DynamicForm's
  // behavior. The last field's Enter falls through to the form's onSubmit.
  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") return;

    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    if (target.tagName === "SELECT" || (target as HTMLButtonElement).type === "submit") {
      return;
    }

    const form = formRef.current;
    if (!form) return;

    const focusable = Array.from(
      form.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)'
      )
    ).filter((el) => el.tabIndex !== -1);

    const currentIndex = focusable.indexOf(target);
    if (currentIndex === -1) return;

    const next = focusable[currentIndex + 1];
    if (next) {
      event.preventDefault();
      next.focus();
      if (next instanceof HTMLInputElement) {
        next.select();
      }
    }
    // No next field: let Enter fall through and submit the form normally.
  };

  return (
    <>
      <DataTable<TranWt>
        columns={columns}
        data={data}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : null}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search transactions..."
        onEdit={openEdit}
        onDelete={handleDelete}
        headerActions={
          <Button size="sm" onClick={openCreate}>
            <LuPlus /> New Transaction
          </Button>
        }
      />

      <Dialog.Root
        open={dialog.open}
        onOpenChange={(details) => dialog.setOpen(details.open)}
        size="xl"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{editing ? "Edit Transaction" : "New Transaction"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb={6}>
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  onKeyDown={handleKeyDown}
                  noValidate
                  autoComplete="off"
                >
                <Stack gap={5}>
                  <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                    <GridItem colSpan={1}>
                      <Field.Root required>
                        <Field.Label>
                          From Company <Field.RequiredIndicator />
                        </Field.Label>
                        <NativeSelect.Root disabled={!!editing}>
                          <NativeSelect.Field
                            value={draft.fromCompanyId}
                            onChange={(e) => setField("fromCompanyId", e.target.value)}
                            placeholder="Select from company"
                          >
                            {(fromCompanies ?? []).map((c) => (
                              <option key={c.companyId} value={c.companyId}>
                                {c.companyName}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        {editing ? (
                          <Field.HelperText>From Company can&apos;t be changed after creation</Field.HelperText>
                        ) : (
                          companyDetailsLine(selectedFromCompany) && (
                            <Field.HelperText>{companyDetailsLine(selectedFromCompany)}</Field.HelperText>
                          )
                        )}
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root required>
                        <Field.Label>
                          To Company <Field.RequiredIndicator />
                        </Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={draft.toCompanyId}
                            onChange={(e) => setField("toCompanyId", e.target.value)}
                            placeholder="Select to company"
                          >
                            {(toCompanies ?? []).map((c) => (
                              <option key={c.companyId} value={c.companyId}>
                                {c.companyName}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        {companyDetailsLine(selectedToCompany) && (
                          <Field.HelperText>{companyDetailsLine(selectedToCompany)}</Field.HelperText>
                        )}
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root required>
                        <Field.Label>
                          Metal <Field.RequiredIndicator />
                        </Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={draft.metalId}
                            onChange={(e) => setField("metalId", e.target.value)}
                            placeholder="Select metal"
                          >
                            {activeMetals.map((m) => (
                              <option key={m.metalId} value={m.metalId}>
                                {m.metalName}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root>
                        <Field.Label>Date</Field.Label>
                        <Input
                          type="date"
                          autoComplete="off"
                          value={draft.tranDate}
                          onChange={(e) => setField("tranDate", e.target.value)}
                        />
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root>
                        <Field.Label>Calculate On</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            value={draft.calType}
                            onChange={(e) => setField("calType", e.target.value as TranType)}
                          >
                            <option value="NETWT">Net Weight</option>
                            <option value="GRSWT">Gross Weight</option>
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root>
                        <Field.Label>HSN Code</Field.Label>
                        <Input
                          autoComplete="off"
                          value={draft.hsnCode}
                          onChange={(e) => setField("hsnCode", e.target.value)}
                        />
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={3}>
                      <Field.Root>
                        <Field.Label>Description</Field.Label>
                        <Input
                          autoComplete="off"
                          value={draft.description}
                          onChange={(e) => setField("description", e.target.value)}
                        />
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root>
                        <Field.Label>Gross Weight</Field.Label>
                        <Input
                          type="number"
                          step="0.001"
                          autoComplete="off"
                          value={draft.grsWt}
                          onChange={(e) => setField("grsWt", e.target.value)}
                        />
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root>
                        <Field.Label>Stone Weight</Field.Label>
                        <Input
                          type="number"
                          step="0.001"
                          autoComplete="off"
                          value={draft.stnWt}
                          onChange={(e) => setField("stnWt", e.target.value)}
                        />
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root>
                        <Field.Label>Net Weight (calculated)</Field.Label>
                        <Input readOnly value={weight(totals.netWt)} bg="bg.muted" />
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root>
                        <Field.Label>Rate</Field.Label>
                        <Input
                          type="number"
                          step="0.01"
                          autoComplete="off"
                          value={draft.rate}
                          onChange={(e) => setField("rate", e.target.value)}
                        />
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root disabled={cgstSgstDisabled}>
                        <Field.Label>CGST %</Field.Label>
                        <Input
                          type="number"
                          step="0.01"
                          autoComplete="off"
                          value={draft.cgstPer}
                          onChange={(e) => setCgstOrSgst("cgstPer", e.target.value)}
                          disabled={cgstSgstDisabled}
                        />
                        {cgstSgstDisabled && (
                          <Field.HelperText>Cleared — IGST is set</Field.HelperText>
                        )}
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root disabled={cgstSgstDisabled}>
                        <Field.Label>SGST %</Field.Label>
                        <Input
                          type="number"
                          step="0.01"
                          autoComplete="off"
                          value={draft.sgstPer}
                          onChange={(e) => setCgstOrSgst("sgstPer", e.target.value)}
                          disabled={cgstSgstDisabled}
                        />
                        {cgstSgstDisabled && (
                          <Field.HelperText>Cleared — IGST is set</Field.HelperText>
                        )}
                      </Field.Root>
                    </GridItem>

                    <GridItem colSpan={1}>
                      <Field.Root disabled={igstDisabled}>
                        <Field.Label>IGST %</Field.Label>
                        <Input
                          type="number"
                          step="0.01"
                          autoComplete="off"
                          value={draft.igstPer}
                          onChange={(e) => setIgst(e.target.value)}
                          disabled={igstDisabled}
                        />
                        {igstDisabled && (
                          <Field.HelperText>Cleared — CGST/SGST is set</Field.HelperText>
                        )}
                      </Field.Root>
                    </GridItem>
                  </Grid>

                   <Box borderWidth="1px" borderRadius="md" p={4} bg="bg.muted">
                    <Text fontWeight="semibold" mb={3}>
                      Computed totals
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={3} fontSize="sm">
                      <HStack justify="space-between">
                        <Text color="fg.muted">Value</Text>
                        <Text fontWeight="medium">{money(totals.value)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="fg.muted">CGST Amt</Text>
                        <Text fontWeight="medium">{money(totals.cgstAmt)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="fg.muted">SGST Amt</Text>
                        <Text fontWeight="medium">{money(totals.sgstAmt)}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text color="fg.muted">IGST Amt</Text>
                        <Text fontWeight="medium">{money(totals.igstAmt)}</Text>
                      </HStack>
                    </Grid>
                    <HStack justify="space-between" mt={3} pt={3} borderTopWidth="1px">
                      <Text fontWeight="semibold">Total</Text>
                      <Text fontWeight="bold" fontSize="lg" color="primary">
                        {money(totals.total)}
                      </Text>
                    </HStack>
                  </Box>

                  {formError && (
                    <Field.Root invalid>
                      <Field.ErrorText>{formError}</Field.ErrorText>
                    </Field.Root>
                  )}

                  <HStack justify="flex-end" gap={3}>
                    <Button type="submit" loading={isSubmitting}>
                      {editing ? "Save changes" : "Create transaction"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => dialog.setOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </Stack>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
