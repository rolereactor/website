import type { Metadata } from "next";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SystemLogsTerminal } from "./_components/logs-terminal";

export const metadata: Metadata = {
  title: "System Logs | Admin Console",
  description: "Real-time system logs and diagnostic data",
};

export default function AdminLogsPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Developer Access"
        categoryIcon={Terminal}
        title="System Logs"
        description="Monitor real-time system events and diagnostic output from the bot instance."
      />

      <Card variant="cyberpunk" className="border-white/5 bg-zinc-950/40">
        <CardContent className="p-0">
          <SystemLogsTerminal />
        </CardContent>
      </Card>
    </div>
  );
}
