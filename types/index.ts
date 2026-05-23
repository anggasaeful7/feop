// Shared API and auth types. Keep this file pure — no React or runtime code,
// so it can be imported from anywhere (server, client, route handlers).

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
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};
