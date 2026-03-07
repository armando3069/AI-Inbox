export interface ContactRow {
  id: number;
  contact_name: string | null;
  contact_username: string | null;
  contact_avatar: string | null;
  platform: string;
  lifecycle_status: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_country: string | null;
  contact_language: string | null;
  created_at: string;
}

export interface ContactsFilter {
  platform?: string;
  lifecycle?: string;
  search?: string;
}
