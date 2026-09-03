import { ReactNode } from "react";

export interface ColumnConfig<T> {
  key: string;
  header: string;
  /** Custom cell renderer; defaults to String(row[key]). */
  render?: (row: T) => ReactNode;
  /** Initial column width in px. Draggable via the resize handle. */
  width?: number;
  minWidth?: number;
  align?: "left" | "right" | "center";
}
