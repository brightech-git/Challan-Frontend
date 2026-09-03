import { apiClient, unwrap } from "@/lib/api/client";
import { METAL_MAST } from "@/lib/api/endpoints";
import { MetalMast, MetalMastInput } from "@/types";

// Note: the backend's MetalMastController has no DELETE endpoint and no
// /active filter today — only create, list (with optional search), get by
// id, and update exist. Deactivating a metal is done via the `active`
// field on update, not a delete call.
export const metalMastService = {
  create(input: MetalMastInput) {
    return unwrap<MetalMast>(apiClient.post(METAL_MAST.CREATE, input));
  },

  getAll(search?: string) {
    return unwrap<MetalMast[]>(
      apiClient.get(METAL_MAST.GET_ALL, { params: search ? { search } : undefined })
    );
  },

  getById(id: string) {
    return unwrap<MetalMast>(apiClient.get(METAL_MAST.GET_BY_ID(id)));
  },

  update(id: string, input: MetalMastInput) {
    return unwrap<MetalMast>(apiClient.put(METAL_MAST.UPDATE(id), input));
  },
};
