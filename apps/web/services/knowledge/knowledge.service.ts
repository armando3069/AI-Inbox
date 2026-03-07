import { createQueryKeys } from "@lukemorales/query-key-factory";
import { axiosInstance } from "@/lib/api/axios";
import { request } from "@/lib/api/request";
import { ROUTES } from "@/lib/api/routes";
import type { IndexedFile, UploadResult } from "./knowledge.types";

class KnowledgeService {
  getFiles = (): Promise<{ files: IndexedFile[] }> =>
    request.get<{ files: IndexedFile[] }>(ROUTES.knowledge.files);

  uploadPdf = (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    // Let the browser set multipart/form-data with boundary — omit Content-Type
    return axiosInstance
      .post<UploadResult>(ROUTES.knowledge.upload, formData, {
        headers: { "Content-Type": undefined },
      })
      .then((r) => r.data);
  };

  ask = (question: string): Promise<{ answer: string; usedChunks?: string[] }> =>
    request.post<{ answer: string; usedChunks?: string[] }>(ROUTES.knowledge.ask, {
      question,
    });

  clear = (): Promise<void> => request.delete<void>(ROUTES.knowledge.clear);
}

export const knowledgeService = new KnowledgeService();

export const knowledgeQueryKeys = createQueryKeys("knowledge", {
  files: () => ({
    queryKey: ["files"],
    queryFn: () => knowledgeService.getFiles(),
  }),
});
