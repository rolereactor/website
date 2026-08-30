"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogResponse {
  success?: boolean;
  response?: {
    data?: {
      logs?: string[];
    };
  };
  logs?: string[];
}

export function TerminalLogsPreview() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/proxy/logs?limit=5");
        if (res.ok) {
          const json: LogResponse = await res.json();
          const rawLogs =
            json.response?.data?.logs || json.logs || [];
          if (Array.isArray(rawLogs) && rawLogs.length > 0) {
            setLogs(rawLogs.slice(-5));
          }
        }
      } catch (err) {
        console.error("Failed to fetch terminal logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card
      variant="cyberpunk"
      className="bg-black/60 border-white/5 font-mono h-full"
    >
      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Terminal className="size-4" />
            Terminal Logs
          </CardTitle>
          <Badge
            variant="outline"
            className="text-[10px] border-cyan-500/30 text-cyan-400"
          >
            LIVE_FEED
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-2 text-[11px] leading-tight overflow-x-auto max-h-75">
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-500 py-6">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            <span>Connecting to live log stream...</span>
          </div>
        ) : logs.length > 0 ? (
          logs.map((log, index) => {
            const isError = log.includes("ERROR") || log.includes("ERR") || log.includes("❌");
            const isWarn = log.includes("WARN") || log.includes("⚠️");
            return (
              <p
                key={index}
                className={cn(
                  "wrap-break-word font-mono",
                  isError
                    ? "text-red-400"
                    : isWarn
                    ? "text-amber-400"
                    : "text-cyan-400/90"
                )}
              >
                {log}
              </p>
            );
          })
        ) : (
          <p className="text-zinc-500 italic py-4">No recent log entries received.</p>
        )}
        <div className="flex items-center gap-1 animate-pulse text-cyan-500 mt-4">
          <div className="w-1.5 h-3 bg-current" />
          <span>_</span>
        </div>
      </CardContent>
    </Card>
  );
}
