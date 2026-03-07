import { request } from "@/lib/api/request";
import { ROUTES } from "@/lib/api/routes";
import type { SendReplyPayload } from "./messages.types";

class MessagesService {
  sendReply = (
    conversationId: number,
    text: string,
    platform: string = "telegram",
  ): Promise<void> => {
    const url =
      platform === "whatsapp"
        ? ROUTES.messages.whatsappReply
        : ROUTES.messages.telegramReply;
    return request.post<void>(url, { conversationId, text } satisfies SendReplyPayload);
  };
}

export const messagesService = new MessagesService();
