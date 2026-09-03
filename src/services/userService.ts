import { apiClient, unwrap } from "@/lib/api/client";
import { USERS } from "@/lib/api/endpoints";
import { LoginInput, UserCreateInput, UserMaster, UserUpdateInput } from "@/types";

export const userService = {
  create(input: UserCreateInput) {
    return unwrap<UserMaster>(apiClient.post(USERS.CREATE, input));
  },

  getAll(search?: string) {
    return unwrap<UserMaster[]>(
      apiClient.get(USERS.GET_ALL, { params: search ? { search } : undefined })
    );
  },

  getActive(search?: string) {
    return unwrap<UserMaster[]>(
      apiClient.get(USERS.GET_ACTIVE, { params: search ? { search } : undefined })
    );
  },

  getById(id: number) {
    return unwrap<UserMaster>(apiClient.get(USERS.GET_BY_ID(id)));
  },

  login(input: LoginInput) {
    // Backend expects { name, password } as a raw map, not the full entity.
    return unwrap<UserMaster>(apiClient.post(USERS.LOGIN, input));
  },

  update(id: number, input: UserUpdateInput) {
    return unwrap<UserMaster>(apiClient.put(USERS.UPDATE(id), input));
  },

  remove(id: number) {
    return apiClient.delete(USERS.DELETE(id));
  },
};
