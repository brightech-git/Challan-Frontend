"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services";
import { UserCreateInput, UserUpdateInput } from "@/types";
import { getErrorMessage, toast } from "@/lib/toast";

const usersKey = (search?: string) => ["users", { search }] as const;

export function useUsers(search?: string) {
  return useQuery({
    queryKey: usersKey(search),
    queryFn: () => userService.getAll(search),
  });
}

export function useUser(id: number | null) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userService.getById(id as number),
    enabled: id != null,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UserCreateInput) => userService.create(input),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created", `${user.name} was added.`);
    },
    onError: (error) => {
      toast.error("Couldn't create user", getErrorMessage(error));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UserUpdateInput }) =>
      userService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated");
    },
    onError: (error) => {
      toast.error("Couldn't update user", getErrorMessage(error));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
    },
    onError: (error) => {
      toast.error("Couldn't delete user", getErrorMessage(error));
    },
  });
}
