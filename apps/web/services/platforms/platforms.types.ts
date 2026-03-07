export interface PlatformAccount {
  id: number;
  user_id: number;
  platform: string;
  external_app_id: string;
  settings?: { username?: string; first_name?: string; [key: string]: unknown };
  created_at: string;
}

export interface PlatformAccountsResponse {
  total: number;
  accounts: PlatformAccount[];
}
