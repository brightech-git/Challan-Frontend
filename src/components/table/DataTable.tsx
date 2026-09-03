"use client";

import { ReactNode, useMemo, useRef, useState } from "react";
import {
  Box,
  Center,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";
import { LuPencil, LuSearch, LuTrash2 } from "react-icons/lu";
import { ColumnConfig } from "./types";

export interface DataTableProps<T> {
  columns: ColumnConfig<T>[];
  data: T[] | undefined;
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  /** Controlled search input; omit to hide the search box. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  /** Max height of the scrollable body; header stays pinned. Default 520px. */
  maxHeight?: number | string;
  extraActions?: (row: T) => ReactNode;
}

/**
 * Generic, column-config-driven data table.
 *
 * - Adjustable column widths: drag the handle on the right edge of any header cell.
 * - Scrollable body with a sticky header, so long lists don't push the page layout around.
 * - Optional search box, loading/empty/error states, and per-row edit/delete actions.
 *
 * Every module's list page (Company, Metal Master, Challan Format, TranWt, Users)
 * renders through this component so table behavior stays consistent app-wide.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  error,
  emptyMessage = "No records found.",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  onEdit,
  onDelete,
  maxHeight = 520,
  extraActions,
}: DataTableProps<T>) {
  const [widths, setWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(columns.map((c) => [c.key, c.width ?? 160]))
  );
  const resizing = useRef<{ key: string; startX: number; startWidth: number } | null>(
    null
  );

  const hasActions = !!(onEdit || onDelete || extraActions);

  const startResize = (key: string, startWidth: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    resizing.current = { key, startX: e.clientX, startWidth };

    const onMove = (moveEvent: PointerEvent) => {
      if (!resizing.current) return;
      const { key: k, startX, startWidth: sw } = resizing.current;
      const col = columns.find((c) => c.key === k);
      const min = col?.minWidth ?? 80;
      const next = Math.max(min, sw + (moveEvent.clientX - startX));
      setWidths((prev) => ({ ...prev, [k]: next }));
    };

    const onUp = () => {
      resizing.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const rows = useMemo(() => data ?? [], [data]);

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" bg="bg.panel">
      {onSearchChange && (
        <Box p={3} borderBottomWidth="1px">
          <InputGroup maxW="320px" startElement={<LuSearch />}>
            <Input
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              size="sm"
            />
          </InputGroup>
        </Box>
      )}

      <Box overflowX="auto" overflowY="auto" maxHeight={maxHeight}>
        <Table.Root size="sm" style={{ tableLayout: "fixed", minWidth: "100%" }}>
          <Table.Header position="sticky" top={0} zIndex={1} bg="bg.subtle">
            <Table.Row>
              {columns.map((col) => (
                <Table.ColumnHeader
                  key={col.key}
                  position="relative"
                  style={{ width: widths[col.key] }}
                  textAlign={col.align}
                  userSelect="none"
                >
                  <Box overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    {col.header}
                  </Box>
                  <Box
                    onPointerDown={startResize(col.key, widths[col.key])}
                    position="absolute"
                    top={0}
                    right={0}
                    height="100%"
                    width="6px"
                    cursor="col-resize"
                    _hover={{ bg: "border.emphasized" }}
                  />
                </Table.ColumnHeader>
              ))}
              {hasActions && (
                <Table.ColumnHeader width="120px" textAlign="right">
                  Actions
                </Table.ColumnHeader>
              )}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {isLoading && (
              <Table.Row>
                <Table.Cell colSpan={columns.length + (hasActions ? 1 : 0)}>
                  <Center py={10}>
                    <Spinner size="md" />
                  </Center>
                </Table.Cell>
              </Table.Row>
            )}

            {!isLoading && error && (
              <Table.Row>
                <Table.Cell colSpan={columns.length + (hasActions ? 1 : 0)}>
                  <Center py={10}>
                    <Text color="fg.error">{error}</Text>
                  </Center>
                </Table.Cell>
              </Table.Row>
            )}

            {!isLoading && !error && rows.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={columns.length + (hasActions ? 1 : 0)}>
                  <Center py={10}>
                    <Text color="fg.muted">{emptyMessage}</Text>
                  </Center>
                </Table.Cell>
              </Table.Row>
            )}

            {!isLoading &&
              !error &&
              rows.map((row) => (
                <Table.Row key={rowKey(row)}>
                  {columns.map((col) => (
                    <Table.Cell
                      key={col.key}
                      style={{ width: widths[col.key] }}
                      textAlign={col.align}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </Table.Cell>
                  ))}
                  {hasActions && (
                    <Table.Cell textAlign="right">
                      <HStack justify="flex-end" gap={1}>
                        {extraActions?.(row)}
                        {onEdit && (
                          <IconButton
                            aria-label="Edit"
                            size="xs"
                            variant="ghost"
                            onClick={() => onEdit(row)}
                          >
                            <LuPencil />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton
                            aria-label="Delete"
                            size="xs"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => onDelete(row)}
                          >
                            <LuTrash2 />
                          </IconButton>
                        )}
                      </HStack>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
}
