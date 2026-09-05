"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Dialog, Portal, Text, useDisclosure } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { DataTable } from "@/components/table";
import { ColumnConfig } from "@/components/table/types";
import { DynamicForm, FieldConfig, FormValues } from "@/components/form";
import {
  useChallanFormats,
  useCreateChallanFormat,
  useDeleteChallanFormat,
  useUpdateChallanFormat,
} from "@/hooks";
import { ChallanFormat, ChallanFormatInput } from "@/types";

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
  const dialog = useDisclosure();

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
    dialog.setOpen(true);
  };

  const openEdit = (row: ChallanFormat) => {
    setEditing(row);
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
        size="xl"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{editing ? "Edit Challan Format" : "New Challan Format"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb={6}>
                <DynamicForm
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
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
