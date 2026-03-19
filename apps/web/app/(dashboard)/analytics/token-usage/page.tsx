"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { analyticsService, analyticsQueryKeys } from "@/services/analytics/analytics.service";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { formatDate, fmt } from "@/app/(dashboard)/analytics/utils/analytics.utils";
import { AnalyticsPageLayout } from "@/app/(dashboard)/analytics/components/AnalyticsPageLayout";

export default function TokenUsagePage() {
  const { data, isLoading } = useQuery({
    ...analyticsQueryKeys.tokens(30),
    queryFn: () => analyticsService.getTokenUsage(30),
    staleTime: 60_000,
  });

  const chartData = (data?.daily ?? []).map((d) => ({
    date: formatDate(d.date),
    "Tokens In":  d.tokens_in,
    "Tokens Out": d.tokens_out,
  }));

  return (
    <AnalyticsPageLayout>
      <PageHeader title="Token Usage" />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total tokens in"
          value={isLoading ? "—" : fmt(data?.totals.tokens_in ?? 0)}
        />
        <StatCard
          label="Total tokens out"
          value={isLoading ? "—" : fmt(data?.totals.tokens_out ?? 0)}
        />
        <StatCard
          label="Total tokens"
          value={isLoading ? "—" : fmt(data?.totals.total ?? 0)}
          sub="Last 30 days"
        />
      </div>

      {/* Chart */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6">
        <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Token usage</p>
        <p className="text-[12px] text-[var(--text-tertiary)] mb-6">Daily input and output tokens — last 30 days</p>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)] text-[13px]">
            Loading…
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-[var(--text-tertiary)] text-[22px] font-light">
            No data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmt}
                tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip
                formatter={(v: unknown) => [fmt(Number(v ?? 0)), ""]}
                contentStyle={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Bar dataKey="Tokens In"  fill="var(--accent-primary)"   radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tokens Out" fill="var(--accent-blue, #3B82F6)" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </AnalyticsPageLayout>
  );
}
