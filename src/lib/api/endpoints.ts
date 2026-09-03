/**
 * Endpoint map for the Challan Spring Boot backend.
 *
 * Source of truth: the real controllers in Challan-Backend
 * (server.servlet.context-path=/api/v1, so these are all relative to that
 * base — the axios client's baseURL already includes /api/v1).
 *
 *   UserMasterController     -> /users
 *   CompanyController        -> /company
 *   ChallanFormatController  -> /challanformat
 *   MetalMastController      -> /metalmast
 *   TranWtController         -> /tranwt
 *
 * There is no JWT/session/OTP/MPIN layer on this backend — POST/PUT calls
 * are authorized by a plain `userId` request header (see
 * Config/UserIdInterceptor.java), which the axios client attaches
 * automatically from the persisted auth state.
 */

export const USERS = {
  CREATE: "/users",
  GET_ALL: "/users",
  GET_ACTIVE: "/users/active",
  GET_BY_ID: (id: number | string) => `/users/${id}`,
  LOGIN: "/users/login",
  UPDATE: (id: number | string) => `/users/${id}`,
  DELETE: (id: number | string) => `/users/${id}`,
} as const;

export const COMPANY = {
  CREATE: "/company",
  GET_ALL: "/company",
  GET_ACTIVE: "/company/active",
  GET_BY_ID: (id: string) => `/company/${id}`,
  UPDATE: (id: string) => `/company/${id}`,
  DELETE: (id: string) => `/company/${id}`,
} as const;

export const CHALLAN_FORMAT = {
  CREATE: "/challanformat",
  GET_ALL: "/challanformat",
  GET_BY_ID: (id: string) => `/challanformat/${id}`,
  UPDATE: (id: string) => `/challanformat/${id}`,
  DELETE: (id: string) => `/challanformat/${id}`,
} as const;

export const METAL_MAST = {
  CREATE: "/metalmast",
  GET_ALL: "/metalmast",
  GET_BY_ID: (id: string) => `/metalmast/${id}`,
  UPDATE: (id: string) => `/metalmast/${id}`,
} as const;

export const TRAN_WT = {
  CREATE: "/tranwt",
  GET_ALL: "/tranwt",
  GET_BY_ID: (id: number | string) => `/tranwt/${id}`,
  PRINT_BY_ID: (id: number | string) => `/tranwt/print/${id}`,
  UPDATE: (id: number | string) => `/tranwt/${id}`,
  DELETE: (id: number | string) => `/tranwt/${id}`,
} as const;
