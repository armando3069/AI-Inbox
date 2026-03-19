export interface DailyTokenUsage {
    date: string;
    tokens_in: number;
    tokens_out: number;
    total: number;
}

export interface TokenUsageResponse {
    totals: { tokens_in: number; tokens_out: number; total: number };
    daily: DailyTokenUsage[];
}

export interface DailyCost {
    date: string;
    cost_usd: number;
}

export interface CostResponse {
    total_cost_usd: number;
    daily: DailyCost[];
}

export interface DailyMessageCount {
    date: string;
    incoming: number;
    outgoing: number;
    total: number;
}

export interface MessagesResponse {
    totals: { incoming: number; outgoing: number; total: number };
    this_month: { incoming: number; outgoing: number; total: number };
    daily: DailyMessageCount[];
}
