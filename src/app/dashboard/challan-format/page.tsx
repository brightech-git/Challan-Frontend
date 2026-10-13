"use client";

import { useMemo, useState } from "react";
import { Badge, Box, Button, Dialog, Grid, NativeSelect, Portal, Text, useDisclosure } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { DataTable } from "@/components/table";
import { ColumnConfig } from "@/components/table/types";
import { DynamicForm, FieldConfig, FormValues } from "@/components/form";
import {
  useChallanFormats,
  useCreateChallanFormat,
  useDeleteChallanFormat,
  useUpdateChallanFormat,
  useTranWts,
  useTranWt,
} from "@/hooks";
import { ChallanFormat, ChallanFormatInput } from "@/types";
import { injectTemplateData } from "../generate-receipt/challanTemplate";
import { amountInWords } from "@/lib/numberToWords";
import Link from "next/link";
import { useCopyLabels } from "@/hooks/useCopyLabels";

/**
 * Challan Format CRUD page — follows the same DataTable + DynamicForm-in-Dialog
 * shape as Company/Metal Master. `content` is raw HTML with `{{fieldName}}`
 * (including nested paths like `{{fromCompanyDetails.companyName}}`)
 * placeholders that get filled in from a TranWt record when a transaction
 * is printed — see the Print action on the Transactions page.
 */

function formatFields(editing: boolean): FieldConfig[] {
  return [
    {
      name: "id",
      label: "Format ID",
      type: "text",
      required: true,
      colSpan: 1,
      placeholder: 'e.g. "CLFORM"',
      disabled: editing,
      helperText: editing ? "Format ID can't be changed after creation" : undefined,
    },
    {
      name: "content",
      label: "HTML Content",
      type: "textarea",
      colSpan: 1,
      placeholder: "<table>...{{fromCompanyDetails.companyName}}...</table>",
      helperText: "Use {{fieldName}} placeholders — they're replaced with the transaction's values when a challan is printed.",
    },
  ];
}

export default function ChallanFormatPage() {
  const [editing, setEditing] = useState<ChallanFormat | null>(null);
  const [previewContent, setPreviewContent] = useState("");
  const [editorSession, setEditorSession] = useState(0);
  const [previewTransactionId, setPreviewTransactionId] = useState("");
  const { labels: copyLabels } = useCopyLabels();
  const [copyLabelId, setCopyLabelId] = useState("");
  const selectedCopyLabel = copyLabels.find((label) => label.id === copyLabelId) ?? copyLabels[0];
  const headerRight = selectedCopyLabel?.name ?? "";
  const dialog = useDisclosure();
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useTranWts();
  const { data: transaction, isLoading: transactionLoading, error: transactionError } = useTranWt(
    previewTransactionId ? Number(previewTransactionId) : null
  );

  const previewHtml = useMemo(() => {
    if (!transaction || !previewTransactionId) return previewContent;
    const from = {
      ...transaction.fromCompanyDetails,
      cinNo: transaction.fromCompanyDetails?.cinNo ?? null,
    };
    const to = transaction.toCompanyDetails;
    const address = (company: { address1?: string | null; address2?: string | null; address3?: string | null; address4?: string | null } | null | undefined) => [company?.address1, company?.address2, company?.address3, company?.address4].filter(Boolean).join(", ");
    const authorization = {
      headerRight,
      fromCompanyDetails: from,
      date: transaction.tranDate,
      jurisdiction: "Chennai",
      carrierName: to?.companyName ?? transaction.toCompanyId,
      sentDate: transaction.tranDate,
      destination: address(to),
      goldWeight: transaction.netWt,
      ornamentsWeight: transaction.netWt,
      cashAmount: transaction.total,
      amountInWordsText: amountInWords(transaction.total ?? 0),
      invoiceNo: String(transaction.id),
      invoiceDate: transaction.tranDate,
      company: {
        companyName: from?.companyName,
        subtitle: transaction.header1,
        email: from?.email,
        website: null, cin: from.cinNo, cinNo: from.cinNo,
        gstNo: from?.gstNo, panNo: from?.panNo,
        branchAddress: [from?.address1, from?.address2].filter(Boolean).join(", "),
        branchPhone: from?.phone,
        regdAddress: address(from), centreNo: null,
      },
    };
    const delivery = { ...transaction, fromCompanyDetails: from, headerRight, fontSize: "large" };
    const isDelivery = /\b(?:const|let|var)\s+tranWt\s*=/.test(previewContent) || editing?.id === "DELIVERYFORM";
    const html = injectTemplateData(previewContent, isDelivery ? delivery : authorization, {
      varName: isDelivery ? "tranWt" : "data",
      logoClass: isDelivery ? "logo-symbol" : "letter-logo",
    });
    const values: Record<string, unknown> = { ...authorization, ...delivery, tranWt: delivery, data: authorization };
    return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (placeholder, path: string) => {
      const value = path.split(".").reduce<unknown>((current, key) =>
        current != null && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined, values);
      if (value == null) return placeholder;
      return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
    });
  }, [previewContent, transaction, previewTransactionId, editing?.id, headerRight]);

  const { data, isLoading, error } = useChallanFormats();
  const createFormat = useCreateChallanFormat();
  const updateFormat = useUpdateChallanFormat();
  const deleteFormat = useDeleteChallanFormat();

  const columns: ColumnConfig<ChallanFormat>[] = useMemo(
    () => [
      { key: "id", header: "ID", width: 160 },
      {
        key: "content",
        header: "Content",
        width: 400,
        render: (row) => (
          <Text color="fg.muted" lineClamp={1}>
            {row.content || "—"}
          </Text>
        ),
      },
      {
        key: "length",
        header: "Size",
        width: 100,
        render: (row) => (
          <Badge colorPalette="gray">{(row.content?.length ?? 0).toLocaleString()} chars</Badge>
        ),
      },
    ],
    []
  );

  const openCreate = () => {
    setEditing(null);
    setPreviewContent("");
    setEditorSession((session) => session + 1);
    dialog.setOpen(true);
  };

  const openEdit = (row: ChallanFormat) => {
    setEditing(row);
    setPreviewContent(row.content ?? "");
    setEditorSession((session) => session + 1);
    dialog.setOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    const input: ChallanFormatInput = {
      id: String(values.id ?? ""),
      content: (values.content as string) || null,
    };

    if (editing) {
      await updateFormat.mutateAsync({ id: editing.id, input });
    } else {
      await createFormat.mutateAsync(input);
    }
    dialog.setOpen(false);
  };

  const handleDelete = async (row: ChallanFormat) => {
    if (!confirm(`Delete challan format "${row.id}"?`)) return;
    await deleteFormat.mutateAsync(row.id);
  };

  return (
    <>
      <DataTable<ChallanFormat>
        columns={columns}
        data={data}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : null}
        onEdit={openEdit}
        onDelete={handleDelete}
        headerActions={
          <Button size="sm" onClick={openCreate}>
            <LuPlus /> New Format
          </Button>
        }
      />

      <Dialog.Root
        open={dialog.open}
        onOpenChange={(details) => dialog.setOpen(details.open)}
        size="full"
        scrollBehavior="inside"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{editing ? "Edit Challan Format" : "New Challan Format"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb={6}>
                <Box mb={5}>
                  <Text asChild fontWeight="medium" mb={2}><label htmlFor="format-preview-transaction">Preview data</label></Text>
                  <NativeSelect.Root>
                    <NativeSelect.Field id="format-preview-transaction" value={previewTransactionId}
                      onChange={(event) => setPreviewTransactionId(event.target.value)}>
                      <option value="">{transactionsLoading ? "Loading transactions..." : "No transaction — show template only"}</option>
                      {(transactions ?? []).map((record) => (
                        <option key={record.id} value={String(record.id)}>
                          #{record.id} — {record.fromCompanyDetails?.companyName ?? record.fromCompanyId} → {record.toCompanyDetails?.companyName ?? record.toCompanyId} ({record.tranDate?.slice(0, 10) ?? "no date"})
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mt={4}>
                    <Box>
                      <Text asChild mb={2} fontWeight="medium"><label htmlFor="preview-copy-type">Header right</label></Text>
                      <NativeSelect.Root>
                        <NativeSelect.Field id="preview-copy-type" value={selectedCopyLabel?.id ?? ""} onChange={(event) => setCopyLabelId(event.target.value)}>
                          {!copyLabels.length && <option value="">No copy labels available</option>}
                          {copyLabels.map((label) => <option key={label.id} value={label.id}>{label.name}</option>)}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                      <Text mt={2} fontSize="sm"><Link href="/dashboard/copy-labels" target="_blank" rel="noopener noreferrer">Manage copy labels ↗</Link></Text>
                    </Box>
                  </Grid>
                  {transactionLoading && <Text mt={2} role="status">Loading preview data...</Text>}
                  {(transactionsError || transactionError) && <Text mt={2} color="red.600" role="alert">Could not load preview data. Please try again.</Text>}
                </Box>
                <Grid templateColumns={{ base: "1fr", xl: "minmax(320px, 1fr) minmax(0, 2fr)" }} gap={6}>
                <Box
                  minW={0}
                  css={{ "& textarea": { minHeight: "480px", fontFamily: "monospace", resize: "vertical" } }}
                  onChangeCapture={(event) => {
                    const target = event.target;
                    if (target instanceof HTMLTextAreaElement && target.name === "content") {
                      setPreviewContent(target.value);
                    }
                  }}
                >
                <DynamicForm
                  key={editorSession}
                  fields={formatFields(!!editing)}
                  columns={1}
                  defaultValues={editing}
                  onSubmit={handleSubmit}
                  onCancel={() => dialog.setOpen(false)}
                  isSubmitting={createFormat.isPending || updateFormat.isPending}
                  formError={
                    (createFormat.error as Error | undefined)?.message ??
                    (updateFormat.error as Error | undefined)?.message ??
                    null
                  }
                  submitLabel={editing ? "Save changes" : "Create format"}
                />
                </Box>
                <Box minW={0}>
                  <Text fontWeight="semibold" mb={2}>Live preview</Text>
                  <Text color="fg.muted" fontSize="sm" mb={3}>
                    Updates as you edit using the selected transaction. Saving keeps your original HTML template.
                  </Text>
                  <Box borderWidth="1px" borderRadius="md" overflow="auto" bg="gray.100">
                    {previewContent.trim() ? (
                      <iframe
                        title="Challan format live preview"
                        sandbox="allow-scripts"
                        srcDoc={previewHtml}
                        style={{ display: "block", width: "100%", minWidth: "820px", height: "1160px", border: 0, background: "white" }}
                      />
                    ) : (
                      <Text p={8} color="gray.600">Enter HTML content to preview your challan format.</Text>
                    )}
                  </Box>
                </Box>
                </Grid>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
