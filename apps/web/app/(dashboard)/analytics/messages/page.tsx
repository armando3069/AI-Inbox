"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { analyticsService, analyticsQueryKeys } from "@/services/analytics/analytics.service";
import { PageHeader } from "@/components/layout/PageHeader";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5">
      <p className="text-[12px] text-[var(--text-tertiary)] font-medium mb-2">{label}</p>
      <p className="text-[28px] font-semibold text-[var(--text-primary)] leading-none">{value}</p>
      {sub && <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5">{sub}</p>}
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function MessagesPage() {
  const { data, isLoading } = useQuery({
    ...analyticsQueryKeys.messages(30),
    queryFn: () => analyticsService.getMessageStats(30),
    staleTime: 60_000,
  });

  const chartData = (data?.daily ?? []).map((d) => ({
    date: formatDate(d.date),
    Incoming: d.incoming,
    Outgoing: d.outgoing,
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] border border-[var(--border-default)]">
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <PageHeader title="Messages" />

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="This month — total"
          value={isLoading ? "—" : fmt(data?.this_month.total ?? 0)}
          sub={`${fmt(data?.this_month.incoming ?? 0)} incoming · ${fmt(data?.this_month.outgoing ?? 0)} outgoing`}
        />
        <StatCard
          label="Last 30 days — incoming"
          value={isLoading ? "—" : fmt(data?.totals.incoming ?? 0)}
          sub="Messages from contacts"
        />
        <StatCard
          label="Last 30 days — outgoing"
          value={isLoading ? "—" : fmt(data?.totals.outgoing ?? 0)}
          sub="Replies sent"
        />
      </div>

      {/* Chart */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6">
        <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">Daily messages</p>
        <p className="text-[12px] text-[var(--text-tertiary)] mb-6">Incoming and outgoing messages per day — last 30 days</p>

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
                width={36}
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
              <Bar dataKey="Incoming" fill="var(--accent-primary)"          radius={[4, 4, 0, 0]} />
              <Bar dataKey="Outgoing" fill="var(--accent-blue, #3B82F6)"   radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
    </div>
  );
}
