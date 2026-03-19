import { request } from "@/lib/api/request";
import { ROUTES } from "@/lib/api/routes";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import {TokenUsageResponse,CostResponse,MessagesResponse,} from "@/services/analytics/analytics.types";


class AnalyticsService {
  getTokenUsage(days = 30): Promise<TokenUsageResponse> {
    return request.get<TokenUsageResponse>(`${ROUTES.analytics.tokens}?days=${days}`);
  }

  getCost(days = 30): Promise<CostResponse> {
    return request.get<CostResponse>(`${ROUTES.analytics.cost}?days=${days}`);
  }

  getMessageStats(days = 30): Promise<MessagesResponse> {
    return request.get<MessagesResponse>(`${ROUTES.analytics.messages}?days=${days}`);
  }
}

export const analyticsService = new AnalyticsService();


export const analyticsQueryKeys = createQueryKeys("analytics", {
  tokens:   (days: number) => ({ queryKey: ["analytics", "tokens",   days] }),
  cost:     (days: number) => ({ queryKey: ["analytics", "cost",     days] }),
  messages: (days: number) => ({ queryKey: ["analytics", "messages", days] }),
});
