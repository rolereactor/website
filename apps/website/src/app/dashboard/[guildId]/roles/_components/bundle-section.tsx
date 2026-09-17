"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Package,
  Trash2,
  Loader2,
  Plus,
  ChevronDown,
  ChevronRight,
  Shield,
  Check,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { useGuildStore } from "@/store/use-guild-store";
import { useProEngineStore } from "@/store/use-pro-engine-store";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function toHex(decimal: number) {
  if (!decimal || decimal === 0) return "#b9bbbe";
  return `#${decimal.toString(16).padStart(6, "0")}`;
}

interface RoleBundle {
  _id: string;
  guildId: string;
  name: string;
  roles: Array<{ roleId: string; roleName: string }>;
  createdAt: string;
  updatedAt: string;
}

interface BundleSectionProps {
  guildId: string;
}

export function BundleSection({ guildId }: BundleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    bundle: RoleBundle | null;
  }>({ open: false, bundle: null });
  const [createModal, setCreateModal] = useState(false);
  const [newBundleName, setNewBundleName] = useState("");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch guild roles
  const { guildData, fetchRoles } = useGuildStore();
  const guildRoles = useMemo(
    () =>
      (guildData[guildId]?.roles || []).filter(
        (role) => role.name !== "@everyone" && role.id !== guildId
      ),
    [guildData, guildId]
  );

  // Check Pro status
  const { fetchSettings, settingsCache } = useProEngineStore();
  const proSettings = settingsCache[guildId];
  const isPro = proSettings?.isPremium?.pro ?? false;

  useEffect(() => {
    if (!proSettings) {
      fetchSettings(guildId);
    }
  }, [guildId, proSettings, fetchSettings]);

  // Limits based on tier - fetched from API
  const { data: benefitsData } = useSWR(
    "/api/premium/benefits",
    fetcher,
    { revalidateOnFocus: false }
  );

  const bundleLimit = benefitsData?.benefits?.find(
    (b: { name: string }) => b.name === "Bundle Slots"
  );
  const rolesPerBundleLimit = benefitsData?.benefits?.find(
    (b: { name: string }) => b.name === "Roles per Bundle"
  );
  const maxBundles = isPro
    ? Number(bundleLimit?.pro) || 20
    : Number(bundleLimit?.free) || 5;
  const maxRolesPerBundle = isPro
    ? Number(rolesPerBundleLimit?.pro) || 10
    : Number(rolesPerBundleLimit?.free) || 3;

  useEffect(() => {
    if (guildRoles.length === 0) {
      fetchRoles(guildId);
    }
  }, [guildId, guildRoles.length, fetchRoles]);

  const {
    data: bundlesData,
    isLoading: bundlesLoading,
    mutate: mutateBundles,
  } = useSWR<{ success: boolean; bundles: RoleBundle[]; total: number }>(
    guildId ? `/api/guilds/${guildId}/role-bundles` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  const bundles = bundlesData?.bundles || [];
  const totalBundles = bundlesData?.total || 0;

  const handleDelete = useCallback(async () => {
    if (!deleteModal.bundle) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/guilds/${guildId}/role-bundles?name=${encodeURIComponent(deleteModal.bundle.name)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Bundle deleted successfully");
        mutateBundles();
      } else {
        toast.error(result.error || "Failed to delete bundle");
      }
    } catch {
      toast.error("An error occurred while deleting the bundle");
    } finally {
      setIsDeleting(false);
      setDeleteModal({ open: false, bundle: null });
    }
  }, [guildId, deleteModal.bundle, mutateBundles]);

  const handleCreate = useCallback(async () => {
    if (!newBundleName.trim()) {
      toast.error("Please enter a bundle name");
      return;
    }

    if (selectedRoleIds.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    // Validate bundle limit
    if (totalBundles >= maxBundles) {
      toast.error(`Maximum bundle limit reached (${maxBundles}). ${isPro ? "" : "Upgrade to Pro for more bundles."}`);
      return;
    }

    // Validate roles per bundle limit
    if (selectedRoleIds.length > maxRolesPerBundle) {
      toast.error(`Maximum roles per bundle exceeded (${maxRolesPerBundle}). ${isPro ? "" : "Upgrade to Pro for more roles."}`);
      return;
    }

    setIsCreating(true);
    try {
      const rolesArray = selectedRoleIds.map((roleId) => {
        const role = guildRoles.find((r) => r.id === roleId);
        return {
          roleId,
          roleName: role?.name || roleId,
        };
      });

      const response = await fetch(`/api/guilds/${guildId}/role-bundles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBundleName.trim(),
          roles: rolesArray,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || "Bundle created successfully");
        setCreateModal(false);
        setNewBundleName("");
        setSelectedRoleIds([]);
        mutateBundles();
      } else {
        toast.error(result.error || "Failed to create bundle");
      }
    } catch {
      toast.error("An error occurred while creating the bundle");
    } finally {
      setIsCreating(false);
    }
  }, [guildId, newBundleName, selectedRoleIds, guildRoles, mutateBundles, totalBundles, maxBundles, maxRolesPerBundle, isPro]);

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  if (bundlesLoading) {
    return null;
  }

  return (
    <>
      <Card variant="glass" className="overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Package className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-zinc-200">
                Role Bundles
              </h3>
              <p className="text-xs text-zinc-500">
                Reusable role groups for quick assignment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-xs border-purple-500/30 text-purple-400"
            >
              {totalBundles}/{maxBundles}
            </Badge>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-white/5">
            <CardContent className="p-4 space-y-3">
              {/* Create Button */}
              <Button
                onClick={() => setCreateModal(true)}
                variant="outline"
                size="sm"
                className="w-full border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/10"
              >
                <Plus className="w-4 h-4 mr-2 text-purple-400" />
                Create Bundle
              </Button>

              {/* Bundles List */}
              {bundles.length === 0 ? (
                <div className="py-6 text-center">
                  <Package className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-zinc-500 text-sm">No bundles yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bundles.map((bundle) => (
                    <div
                      key={bundle._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Package className="w-4 h-4 text-purple-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-zinc-200 truncate">
                            {bundle.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {bundle.roles.length} role
                            {bundle.roles.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() =>
                          setDeleteModal({ open: true, bundle })
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, bundle: null })}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Delete Bundle
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {deleteModal.bundle?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModal({ open: false, bundle: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Bundle Modal */}
      <Dialog open={createModal} onOpenChange={setCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Create Role Bundle
            </DialogTitle>
            <DialogDescription>
              Create a reusable group of roles for quick assignment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Bundle Name */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Bundle Name
              </label>
              <input
                type="text"
                value={newBundleName}
                onChange={(e) => setNewBundleName(e.target.value)}
                placeholder="e.g., Gaming Pack"
                className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Roles
              </label>
              <div className="border border-input rounded-lg bg-background/50 max-h-48 overflow-y-auto">
                {guildRoles.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    <Shield className="w-5 h-5 mx-auto mb-2 opacity-50" />
                    Loading roles...
                  </div>
                ) : (
                  <div className="p-1">
                    {guildRoles.map((role) => {
                      const isSelected = selectedRoleIds.includes(role.id);
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => toggleRole(role.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                            isSelected
                              ? "bg-purple-500/10 hover:bg-purple-500/15"
                              : "hover:bg-muted"
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "bg-purple-500 border-purple-500"
                                : "border-muted-foreground"
                            )}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: toHex(role.color) }}
                          />
                          <span
                            className="text-sm truncate"
                            style={{ color: toHex(role.color) }}
                          >
                            {role.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {selectedRoleIds.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedRoleIds.length} role{selectedRoleIds.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreateModal(false);
                setNewBundleName("");
                setSelectedRoleIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="plasma"
              size="sm"
              onClick={handleCreate}
              disabled={isCreating || !newBundleName.trim() || selectedRoleIds.length === 0}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
