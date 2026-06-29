// Shared API and auth types. Keep this file pure — no React or runtime code,
// so it can be imported from anywhere (server, client, route handlers).

export * from "./master-data";
export * from "./schedules";
export * from "./complaint";
export * from "./guest-report";
export * from "./facility";
export * from "./billing";
export * from "./specific-billing";
export * from "./renovation-permit";
export * from "./platform-billing";
export * from "./letter-request";
export * from "./financial-report";
export * from "./general-facility";
export * from "./punishment";
export * from "./dashboard";

export type ApiEnvelope<T> = { data: T };

export type ApiErrorBody = {
  error: { code: string; message: string; details?: Record<string, unknown> };
};

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  per_page: number;
};

export type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  workspace_id?: string;
  workspace_name?: string;
  workspace_type?: string;
  rw?: string;
  rw_id?: string;
  rt?: string;
  rt_id?: string;
  punishment_months?: number;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};
