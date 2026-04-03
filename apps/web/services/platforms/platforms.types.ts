export interface PlatformAccount {
  id: number;
  user_id: number;
  platform: string;
  external_app_id: string;
  settings?: { username?: string; first_name?: string; [key: string]: unknown };
  status?: string;
  created_at: string;
  updated_at?: string;
}

export interface PlatformAccountsResponse {
  total: number;
  accounts: PlatformAccount[];
}

export interface FacebookPendingPage {
  pageId: string;
  pageName: string;
  category: string | null;
}

export interface FacebookConnectionStatus {
  connected: boolean;
  provider?: "facebook_messenger";
  pageId?: string | null;
  pageName?: string | null;
  category?: string | null;
  status?: string;
  connectedAt?: string;
  updatedAt?: string;
}
