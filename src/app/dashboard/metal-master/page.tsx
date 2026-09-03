"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  Heading,
  HStack,
  Portal,
  useDisclosure,
} from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { DataTable } from "@/components/table";
import { ColumnConfig } from "@/components/table/types";
import { DynamicForm, FieldConfig, FormValues } from "@/components/form";
import { useCreateMetalMast, useMetalMasts, useUpdateMetalMast } from "@/hooks";
import { MetalMast, MetalMastInput } from "@/types";

/**
 * Metal Master CRUD page — follows the same DataTable + DynamicForm-in-Dialog
 * shape as Company/Users. Note the backend has no delete endpoint for
 * metals (see metalMastService), so deactivating a metal is done via the
 * "Active" checkbox on edit rather than a delete action — DataTable's
 * onDelete prop is intentionally omitted here.
 *
 * metalId is a single-character code (DB column is length 1), matching
 * how the real MetalMast entity is defined.
 */

const metalFields: FieldConfig[] = [
  {
    name: "metalId",
    label: "Metal ID",
    type: "text",
    required: true,
    colSpan: 1,
    placeholder: "e.g. G",
    helperText: "Single character code",
  },
  { name: "metalName", label: "Metal Name", type: "text", required: true, colSpan: 1 },
  { name: "tType", label: "Type", type: "text", colSpan: 1, placeholder: "e.g. W" },
  { name: "displayOrder", label: "Display Order", type: "number", colSpan: 1 },
  { name: "active", label: "Active", type: "checkbox", colSpan: 1 },
];

export default function MetalMasterPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<MetalMast | null>(null);
  const dialog = useDisclosure();

  const { data, isLoading, error } = useMetalMasts(search || undefined);
  const createMetal = useCreateMetalMast();
  const updateMetal = useUpdateMetalMast();

  const columns: ColumnConfig<MetalMast>[] = useMemo(
    () => [
      { key: "metalId", header: "ID", width: 80 },
      { key: "metalName", header: "Name", width: 200 },
      { key: "tType", header: "Type", width: 100 },
      { key: "displayOrder", header: "Order", width: 100 },
      {
        key: "active",
        header: "Active",
        width: 100,
        render: (row) => (
          <Badge colorPalette={row.active ? "green" : "gray"}>
            {row.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
    ],
    []
  );

  const openCreate = () => {
    setEditing(null);
    dialog.setOpen(true);
  };

  const openEdit = (row: MetalMast) => {
    setEditing(row);
    dialog.setOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    // userId is set server-side from the auth header regardless of what's
    // sent here — the placeholder keeps MetalMastInput's required field
    // satisfied without pretending the client controls it.
    const input: MetalMastInput = {
      metalId: String(values.metalId ?? ""),
      metalName: String(values.metalName ?? ""),
      userId: 0,
      tType: (values.tType as string) || null,
      displayOrder: values.displayOrder != null ? Number(values.displayOrder) : null,
      autoGenerator: null,
      active: Boolean(values.active),
    };

    if (editing) {
      await updateMetal.mutateAsync({ id: editing.metalId, input });
    } else {
      await createMetal.mutateAsync(input);
    }
    dialog.setOpen(false);
  };

  return (
    <>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Metal Master</Heading>
        <Button onClick={openCreate}>
          <LuPlus /> New Metal
        </Button>
      </HStack>

      <DataTable<MetalMast>
        columns={columns}
        data={data}
        rowKey={(row) => row.metalId}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : null}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search metals..."
        onEdit={openEdit}
      />

      <Dialog.Root
        open={dialog.open}
        onOpenChange={(details) => dialog.setOpen(details.open)}
        size="lg"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{editing ? "Edit Metal" : "New Metal"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb={6}>
                <DynamicForm
                  fields={metalFields}
                  defaultValues={editing ?? { active: true }}
                  onSubmit={handleSubmit}
                  onCancel={() => dialog.setOpen(false)}
                  isSubmitting={createMetal.isPending || updateMetal.isPending}
                  formError={
                    (createMetal.error as Error | undefined)?.message ??
                    (updateMetal.error as Error | undefined)?.message ??
                    null
                  }
                  submitLabel={editing ? "Save changes" : "Create metal"}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
