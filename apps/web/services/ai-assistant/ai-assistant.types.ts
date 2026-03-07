export type ResponseTone = "professional" | "friendly" | "casual" | "strict";

export interface AiAssistantConfig {
  userId: number;
  autoReplyEnabled: boolean;
  responseTone: ResponseTone;
  confidenceThreshold: number;
}

export type AiAssistantConfigPatch = Partial<
  Pick<AiAssistantConfig, "autoReplyEnabled" | "responseTone" | "confidenceThreshold">
>;

export interface TranslatePayload {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
  messageId?: string;
}

export interface TranslateResult {
  translatedText: string;
  detectedSourceLanguage: string;
  confidence: number;
}
