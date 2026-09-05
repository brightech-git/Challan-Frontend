"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Dialog, Portal, useDisclosure } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { DataTable } from "@/components/table";
import { ColumnConfig } from "@/components/table/types";
import { DynamicForm, FieldConfig, FormValues } from "@/components/form";
import {
  useCompanies,
  useCreateCompany,
  useDeleteCompany,
  useUpdateCompany,
} from "@/hooks";
import { Company, CompanyInput } from "@/types";

/**
 * Reference implementation of the CRUD pattern: DataTable for the list +
 * DynamicForm in a Dialog for create/edit, both driven by the
 * useCompanies/useCreateCompany/useUpdateCompany/useDeleteCompany hooks.
 * Copy this file's shape for Metal Master, Challan Format, TranWt, and
 * Users pages — only the field/column config and hooks change.
 */

const companyFields: FieldConfig[] = [
  { name: "companyId", label: "Company ID", type: "text", required: true, colSpan: 1 },
  { name: "companyName", label: "Company Name", type: "text", required: true, colSpan: 1 },
  {
    name: "companyType",
    label: "Type",
    type: "select",
    required: true,
    colSpan: 1,
    options: [
      { label: "From", value: "FROM" },
      { label: "To", value: "TO" },
    ],
  },
  { name: "gstNo", label: "GST No", type: "text", colSpan: 1 },
  { name: "phone", label: "Phone", type: "text", colSpan: 1 },
  { name: "email", label: "Email", type: "email", colSpan: 1 },
  { name: "address1", label: "Address Line 1", type: "text", colSpan: 1 },
  { name: "address2", label: "Address Line 2", type: "text", colSpan: 1 },
  { name: "panNo", label: "PAN No", type: "text", colSpan: 1 },
  { name: "tanNo", label: "TAN No", type: "text", colSpan: 1 },
  { name: "shortKey", label: "Short Key", type: "text", colSpan: 1 },
  { name: "displayOrder", label: "Display Order", type: "number", colSpan: 1 },
  { name: "active", label: "Active", type: "checkbox", colSpan: 1 },
];

export default function CompanyPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Company | null>(null);
  const dialog = useDisclosure();

  const { data, isLoading, error } = useCompanies({ search: search || undefined });
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

  const columns: ColumnConfig<Company>[] = useMemo(
    () => [
      { key: "companyId", header: "ID", width: 90 },
      { key: "companyName", header: "Name", width: 200 },
      {
        key: "companyType",
        header: "Type",
        width: 90,
        render: (row) => (
          <Badge colorPalette={row.companyType === "FROM" ? "purple" : "cyan"}>
            {row.companyType}
          </Badge>
        ),
      },
      { key: "gstNo", header: "GST No", width: 150 },
      { key: "phone", header: "Phone", width: 130 },
      { key: "email", header: "Email", width: 200 },
      {
        key: "active",
        header: "Active",
        width: 90,
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

  const openEdit = (row: Company) => {
    setEditing(row);
    dialog.setOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    const input: CompanyInput = {
      companyId: String(values.companyId ?? ""),
      companyName: String(values.companyName ?? ""),
      companyType: (values.companyType as CompanyInput["companyType"]) ?? "FROM",
      gstNo: (values.gstNo as string) || null,
      phone: (values.phone as string) || null,
      email: (values.email as string) || null,
      address1: (values.address1 as string) || null,
      address2: (values.address2 as string) || null,
      panNo: (values.panNo as string) || null,
      tanNo: (values.tanNo as string) || null,
      shortKey: (values.shortKey as string) || null,
      displayOrder: values.displayOrder != null ? Number(values.displayOrder) : null,
      active: Boolean(values.active),
    };

    if (editing) {
      await updateCompany.mutateAsync({ id: editing.companyId, input });
    } else {
      await createCompany.mutateAsync(input);
    }
    dialog.setOpen(false);
  };

  const handleDelete = async (row: Company) => {
    if (!confirm(`Delete company "${row.companyName}"?`)) return;
    await deleteCompany.mutateAsync(row.companyId);
  };

  return (
    <>
      <DataTable<Company>
        columns={columns}
        data={data}
        rowKey={(row) => row.companyId}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : null}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search companies..."
        onEdit={openEdit}
        onDelete={handleDelete}
        headerActions={
          <Button size="sm" onClick={openCreate}>
            <LuPlus /> New Company
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
                <Dialog.Title>{editing ? "Edit Company" : "New Company"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb={6}>
                <DynamicForm
                  fields={companyFields}
                  columns={3}
                  defaultValues={editing ?? { active: true, companyType: "FROM" }}
                  onSubmit={handleSubmit}
                  onCancel={() => dialog.setOpen(false)}
                  isSubmitting={createCompany.isPending || updateCompany.isPending}
                  formError={
                    (createCompany.error as Error | undefined)?.message ??
                    (updateCompany.error as Error | undefined)?.message ??
                    null
                  }
                  submitLabel={editing ? "Save changes" : "Create company"}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
