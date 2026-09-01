"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type GrowthPoint = {
  label: string;
  joins: number;
  leaves: number;
};

export function GuildGrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <div className="h-75 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorJoins" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLeaves" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d946ef" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#ffffff05"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
            tick={{
              fill: "#71717a",
              fontSize: 10,
              fontWeight: 600,
            }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#71717a",
              fontSize: 10,
              fontWeight: 600,
            }}
            tickFormatter={(value) => (value === 0 ? "" : value)}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;
              return (
                <div className="bg-zinc-950 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                  <p className="text-[10px] font-black text-zinc-500 uppercase mb-3 px-1 border-b border-white/5 pb-2">
                    {label}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span className="text-xs font-bold text-zinc-300">
                          Joins
                        </span>
                      </div>
                      <span className="text-xs font-black text-white bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        {payload[0]?.value ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                        <span className="text-xs font-bold text-zinc-300">
                          Leaves
                        </span>
                      </div>
                      <span className="text-xs font-black text-white bg-fuchsia-500/10 px-1.5 py-0.5 rounded border border-fuchsia-500/20">
                        {payload[1]?.value ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="joins"
            stroke="#06b6d4"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorJoins)"
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="leaves"
            stroke="#d946ef"
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#colorLeaves)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
