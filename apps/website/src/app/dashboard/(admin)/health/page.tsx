import type { Metadata } from "next";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SystemHealthViewer } from "./_components/health-viewer";

export const metadata: Metadata = {
  title: "System Health | Admin Console",
  description: "Monitor system health and core operations",
};

export default function SystemHealthPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Admin Monitoring"
        categoryIcon={Activity}
        title="System Health"
        description="Monitor real-time system performance, resource utilization, and operational status."
      />
      <Card variant="cyberpunk" className="border-white/5 bg-zinc-950/40">
        <CardContent className="p-6">
          <SystemHealthViewer />
        </CardContent>
      </Card>
    </div>
  );
}
