// Mirrors com.Brightech.Challan.UserMaster.UserMaster
export interface UserMaster {
  userId: number;
  name: string;
  // Never present in responses (backend nulls it out before returning), but
  // required when creating a user.
  password?: string | null;
  createdAt?: string | null;
  createdBy?: number | null;
  updatedAt?: string | null;
  active: boolean;
}

// Payload for POST /users (create). Backend takes the raw entity.
export interface UserCreateInput {
  name: string;
  password: string;
  active: boolean;
}

// Mirrors com.Brightech.Challan.UserMaster.DTO.UserUpdateDTO
export interface UserUpdateInput {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  active?: boolean;
}

export interface LoginInput {
  name: string;
  password: string;
}

// The user object we persist client-side after a successful login.
export interface AuthUser {
  userId: number;
  name: string;
  active: boolean;
}
