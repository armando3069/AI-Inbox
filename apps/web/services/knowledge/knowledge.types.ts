export interface IndexedFile {
  name: string;
  chunks: number;
  uploadedAt: string;
}

export interface UploadResult {
  success: boolean;
  chunks: number;
  file: string;
}
