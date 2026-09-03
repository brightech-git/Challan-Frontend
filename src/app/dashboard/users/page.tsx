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
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/hooks";
import { UserCreateInput, UserMaster, UserUpdateInput } from "@/types";

/**
 * User Master CRUD page — follows the same DataTable + DynamicForm-in-Dialog
 * shape as the Company reference page. The one difference is the form
 * fields: create requires a password, edit instead offers optional
 * current/new password fields (matching UserCreateInput / UserUpdateInput).
 */

const createFields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true, colSpan: 2 },
  { name: "password", label: "Password", type: "password", required: true, colSpan: 2 },
  { name: "active", label: "Active", type: "checkbox", colSpan: 2 },
];

const editFields: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true, colSpan: 2 },
  {
    name: "currentPassword",
    label: "Current Password",
    type: "password",
    colSpan: 1,
    helperText: "Only needed when setting a new password",
  },
  { name: "newPassword", label: "New Password", type: "password", colSpan: 1 },
  { name: "active", label: "Active", type: "checkbox", colSpan: 2 },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserMaster | null>(null);
  const dialog = useDisclosure();

  const { data, isLoading, error } = useUsers(search || undefined);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const columns: ColumnConfig<UserMaster>[] = useMemo(
    () => [
      { key: "userId", header: "ID", width: 80 },
      { key: "name", header: "Name", width: 220 },
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
      {
        key: "createdAt",
        header: "Created",
        width: 160,
        render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"),
      },
    ],
    []
  );

  const openCreate = () => {
    setEditing(null);
    dialog.setOpen(true);
  };

  const openEdit = (row: UserMaster) => {
    setEditing(row);
    dialog.setOpen(true);
  };

  const handleSubmit = async (values: FormValues) => {
    if (editing) {
      const input: UserUpdateInput = {
        name: String(values.name ?? ""),
        active: Boolean(values.active),
        currentPassword: (values.currentPassword as string) || undefined,
        newPassword: (values.newPassword as string) || undefined,
      };
      await updateUser.mutateAsync({ id: editing.userId, input });
    } else {
      const input: UserCreateInput = {
        name: String(values.name ?? ""),
        password: String(values.password ?? ""),
        active: Boolean(values.active),
      };
      await createUser.mutateAsync(input);
    }
    dialog.setOpen(false);
  };

  const handleDelete = async (row: UserMaster) => {
    if (!confirm(`Delete user "${row.name}"?`)) return;
    await deleteUser.mutateAsync(row.userId);
  };

  return (
    <>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Users</Heading>
        <Button onClick={openCreate}>
          <LuPlus /> New User
        </Button>
      </HStack>

      <DataTable<UserMaster>
        columns={columns}
        data={data}
        rowKey={(row) => row.userId}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : null}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search users..."
        onEdit={openEdit}
        onDelete={handleDelete}
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
                <Dialog.Title>{editing ? "Edit User" : "New User"}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pb={6}>
                <DynamicForm
                  fields={editing ? editFields : createFields}
                  defaultValues={editing ?? { active: true }}
                  onSubmit={handleSubmit}
                  onCancel={() => dialog.setOpen(false)}
                  isSubmitting={createUser.isPending || updateUser.isPending}
                  formError={
                    (createUser.error as Error | undefined)?.message ??
                    (updateUser.error as Error | undefined)?.message ??
                    null
                  }
                  submitLabel={editing ? "Save changes" : "Create user"}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
