"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Terminal,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Shield,
  Lock,
  Save,
} from "lucide-react";

import { toast } from "@/lib/toast";
import {
  useStreamingStore,
  type TwitchCommand,
} from "@/store/use-streaming-store";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface CommandsPanelProps {
  guildId: string;
}

const USERLEVELS = [
  { value: "everyone", label: "Everyone" },
  { value: "subscriber", label: "Subscriber" },
  { value: "moderator", label: "Moderator" },
  { value: "broadcaster", label: "Broadcaster" },
];

const EMPTY_COMMAND = {
  name: "",
  response: "",
  description: "",
  userlevel: "everyone",
};

export function CommandsPanel({ guildId }: CommandsPanelProps) {
  const {
    commandsCache,
    isLoading,
    fetchCommands,
    addCommand,
    editCommand,
    deleteCommand,
  } = useStreamingStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<string | null>(null);
  const [newCommand, setNewCommand] = useState(EMPTY_COMMAND);
  const [editForm, setEditForm] = useState({
    response: "",
    description: "",
    userlevel: "everyone",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const commands = commandsCache[guildId] || [];
  const commandsLoading = isLoading[`commands:${guildId}`];

  useEffect(() => {
    fetchCommands(guildId);
  }, [guildId, fetchCommands]);

  const customCommands = commands.filter((c) => !c.isBuiltIn);
  const builtInCommands = commands.filter((c) => c.isBuiltIn);

  const handleAddCommand = async () => {
    if (!newCommand.name.trim() || !newCommand.response.trim()) return;
    try {
      setIsSaving(true);
      await addCommand(guildId, {
        name: newCommand.name.trim(),
        response: newCommand.response.trim(),
        description: newCommand.description.trim() || undefined,
        userlevel: newCommand.userlevel,
      });
      toast.success(`Command !${newCommand.name.trim()} added successfully!`);
      setNewCommand(EMPTY_COMMAND);
      setIsAddOpen(false);
    } catch (err) {
      console.error("Failed to add command:", err);
      toast.error("Failed to add command. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCommand = async () => {
    if (!editingCommand) return;
    try {
      setIsSaving(true);
      await editCommand(guildId, editingCommand, {
        response: editForm.response,
        description: editForm.description,
        userlevel: editForm.userlevel,
      });
      toast.success(`Command !${editingCommand} updated successfully!`);
      setIsEditOpen(false);
      setEditingCommand(null);
    } catch (err) {
      console.error("Failed to edit command:", err);
      toast.error("Failed to update command.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCommand = async (name: string) => {
    try {
      setIsDeleting(name);
      await deleteCommand(guildId, name);
      toast.success(`Command !${name} deleted.`);
    } catch (err) {
      console.error("Failed to delete command:", err);
      toast.error("Failed to delete command.");
    } finally {
      setIsDeleting(null);
    }
  };

  const openEditDialog = (cmd: TwitchCommand) => {
    setEditingCommand(cmd.name);
    setEditForm({
      response: cmd.response || "",
      description: cmd.description || "",
      userlevel: cmd.userlevel || "everyone",
    });
    setIsEditOpen(true);
  };

  if (commandsLoading && commands.length === 0) {
    return (
      <div className="space-y-6">
        <Card variant="cyberpunk" showGrid>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card variant="cyberpunk" showGrid>
          <CardHeader>
            <Skeleton className="h-6 w-44" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom Commands */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
                <Terminal className="w-4 h-4 text-cyan-400" />
              </div>
              Custom Commands
            </CardTitle>
            <Button
              variant="cyber"
              onClick={() => setIsAddOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Add Command
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customCommands.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto mb-4">
                <LayoutGrid className="w-8 h-8" />
              </div>
              <p className="text-sm text-zinc-400 font-medium">No custom commands yet.</p>
              <p className="text-xs text-zinc-600 mt-1">
                Click &quot;Add Command&quot; to create your first one.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {customCommands.map((cmd) => (
                <div
                  key={cmd.name}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-white/2 transition-colors gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-cyan-400 font-mono font-bold text-sm">
                      !{cmd.name}
                    </span>
                    <span className="text-zinc-500 text-sm hidden sm:block truncate max-w-50">
                      {cmd.description || "—"}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] hidden md:block"
                    >
                      {cmd.userlevel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 sm:ml-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(cmd)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                      onClick={() => handleDeleteCommand(cmd.name)}
                      disabled={isDeleting === cmd.name}
                    >
                      {isDeleting === cmd.name ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Built-in Commands */}
      {builtInCommands.length > 0 && (
        <Card variant="cyberpunk" showGrid>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-500/10">
                <Lock className="w-4 h-4 text-zinc-400" />
              </div>
              Built-in Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {builtInCommands.map((cmd) => (
                <div
                  key={cmd.name}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-zinc-400 font-mono font-bold text-sm">
                      !{cmd.name}
                    </span>
                    <span className="text-zinc-500 text-sm hidden sm:block truncate max-w-50">
                      {cmd.description || "—"}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] hidden md:block"
                    >
                      {cmd.userlevel}
                    </Badge>
                  </div>
                  <Badge
                    variant={cmd.enabled ? "success" : "secondary"}
                    className="text-[10px] shrink-0"
                  >
                    {cmd.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Command Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle variant="glitch">Add Command</DialogTitle>
            <DialogDescription variant="glitch">
              Create a new custom chat command.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label variant="cyber">Command Name</Label>
              <div className="flex items-center gap-1">
                <span className="text-cyan-400 font-mono font-bold">!</span>
                <Input
                  variant="cyber"
                  placeholder="e.g. socials"
                  value={newCommand.name}
                  onChange={(e) =>
                    setNewCommand((prev) => ({
                      ...prev,
                      name: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                    }))
                  }
                  maxLength={30}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label variant="cyber">Response</Label>
              <Input
                variant="cyber"
                placeholder="What the bot replies with"
                value={newCommand.response}
                onChange={(e) =>
                  setNewCommand((prev) => ({
                    ...prev,
                    response: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label variant="cyber">Description</Label>
              <Input
                variant="cyber"
                placeholder="Optional description"
                value={newCommand.description}
                onChange={(e) =>
                  setNewCommand((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label variant="cyber" className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                User Level
              </Label>
              <Select
                value={newCommand.userlevel}
                onValueChange={(value) =>
                  setNewCommand((prev) => ({ ...prev, userlevel: value }))
                }
              >
                <SelectTrigger variant="cyber" className="w-full">
                  <SelectValue placeholder="Select user level" />
                </SelectTrigger>
                <SelectContent variant="cyber">
                  {USERLEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="cyber"
              onClick={handleAddCommand}
              disabled={
                isSaving ||
                !newCommand.name.trim() ||
                !newCommand.response.trim()
              }
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Command
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Command Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle variant="glitch">Edit Command</DialogTitle>
            <DialogDescription variant="glitch">
              Modify the command{" "}
              <span className="text-cyan-400 font-mono">!{editingCommand}</span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label variant="cyber">Response</Label>
              <Input
                variant="cyber"
                placeholder="What the bot replies with"
                value={editForm.response}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, response: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label variant="cyber">Description</Label>
              <Input
                variant="cyber"
                placeholder="Optional description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label variant="cyber" className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                User Level
              </Label>
              <Select
                value={editForm.userlevel}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, userlevel: value }))
                }
              >
                <SelectTrigger variant="cyber" className="w-full">
                  <SelectValue placeholder="Select user level" />
                </SelectTrigger>
                <SelectContent variant="cyber">
                  {USERLEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="cyber"
              onClick={handleEditCommand}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
