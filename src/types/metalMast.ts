// Mirrors com.Brightech.Challan.MetalMast.MetalMast
export interface MetalMast {
  metalId: string;
  metalName: string;
  userId: number;
  updated?: string | null;
  upTime?: string | null;
  active?: boolean | null;
  displayOrder?: number | null;
  autoGenerator?: string | null;
  tType?: string | null;
}

export type MetalMastInput = Omit<MetalMast, "updated" | "upTime">;
