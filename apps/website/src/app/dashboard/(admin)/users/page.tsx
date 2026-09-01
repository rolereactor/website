import type { Metadata } from "next";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserTable } from "./_components/user-table";

export const metadata: Metadata = {
  title: "User Management | Admin Console",
  description: "Manage system users and access levels",
};

export default function AdminUsersPage() {
  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Developer Access"
        categoryIcon={Users}
        title="User Management"
        description="Manage user roles and system access for the entire bot infrastructure."
      />

      <Card variant="cyberpunk" className="border-white/5 bg-zinc-950/40">
        <CardContent className="p-0">
          <UserTable />
        </CardContent>
      </Card>
    </div>
  );
}
