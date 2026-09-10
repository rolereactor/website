"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Upload,
  RotateCcw,
  Copy,
  Trash2,
  Type,
  Palette,
  MessageSquare,
  User,
  Layout,
} from "lucide-react";
import {
  OverlayTheme,
  exportTheme,
  importTheme,
  isPresetTheme,
} from "@/app/overlay/[guildId]/[widget]/_components/theme";

interface ThemeCustomizerProps {
  theme: OverlayTheme;
  themeName: string;
  onThemeChange: (theme: OverlayTheme) => void;
  onThemeNameChange?: (name: string) => void;
  onReset?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  presetName?: string;
}

const FONT_FAMILIES = [
  { value: "'Inter', system-ui, -apple-system, sans-serif", label: "Inter" },
  { value: "'Segoe UI', system-ui, sans-serif", label: "Segoe UI" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "'Georgia', serif", label: "Georgia" },
  { value: "system-ui, sans-serif", label: "System UI" },
  { value: "inherit", label: "Inherit" },
];

const selectClass =
  "w-full h-10 px-3 rounded-lg border bg-zinc-900/40 border-white/10 text-sm text-white font-mono tracking-tight hover:bg-zinc-900/60 hover:border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50";

export function ThemeCustomizer({
  theme,
  themeName,
  onThemeChange,
  onThemeNameChange,
  onReset,
  onDuplicate,
  onDelete,
  presetName,
}: ThemeCustomizerProps) {
  const [importJson, setImportJson] = useState("");
  const [showImport, setShowImport] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const pendingRef = useRef<Partial<OverlayTheme>>({});
  const [localTheme, setLocalTheme] = useState<Partial<OverlayTheme>>({});

  const isPreset = isPresetTheme(presetName || "");

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const updateTheme = useCallback(
    (partial: Partial<OverlayTheme>) => {
      // Update local state immediately for UI feedback
      setLocalTheme((prev) => ({ ...prev, ...partial }));

      // Accumulate changes for debounced save
      pendingRef.current = { ...pendingRef.current, ...partial };

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Debounce the actual state update (500ms)
      debounceRef.current = setTimeout(() => {
        const changes = pendingRef.current;
        pendingRef.current = {};
        setLocalTheme({});
        onThemeChange({ ...theme, ...changes });
      }, 500);
    },
    [theme, onThemeChange]
  );

  const handleExport = useCallback(() => {
    const json = exportTheme(theme, themeName);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${themeName.toLowerCase().replace(/\s+/g, "-") || "overlay-theme"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [theme, themeName]);

  const handleImport = useCallback(() => {
    const imported = importTheme(importJson);
    if (imported) {
      onThemeChange(imported);
      setShowImport(false);
      setImportJson("");
    }
  }, [importJson, onThemeChange]);

  // Merge local changes for display
  const displayTheme = { ...theme, ...localTheme };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">Advanced Customization</span>
        <div className="flex items-center gap-1">
          {onDuplicate && (
            <Button variant="ghost" size="sm" onClick={onDuplicate} className="h-7 px-2 text-zinc-400 hover:text-white" title="Duplicate theme">
              <Copy className="h-3 w-3 mr-1" />
              Duplicate
            </Button>
          )}
          {onDelete && !isPreset && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 px-2 text-zinc-400 hover:text-red-400" title="Delete custom theme">
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          {onReset && !isPreset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-7 px-2 text-zinc-400 hover:text-white">
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-zinc-400">Theme Name</Label>
        <Input
          value={themeName}
          onChange={(e) => onThemeNameChange?.(e.target.value)}
          placeholder="My Custom Theme"
          disabled={isPreset}
          className="h-9"
        />
        {isPreset && (
          <p className="text-xs text-zinc-500">Built-in themes cannot be renamed. Duplicate to customize.</p>
        )}
      </div>

      <Tabs defaultValue="typography" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-10">
          <TabsTrigger value="typography" className="text-xs">
            <Type className="h-3 w-3 mr-1" />
            Type
          </TabsTrigger>
          <TabsTrigger value="colors" className="text-xs">
            <Palette className="h-3 w-3 mr-1" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-xs">
            <MessageSquare className="h-3 w-3 mr-1" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="elements" className="text-xs">
            <User className="h-3 w-3 mr-1" />
            Elements
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">
            <Layout className="h-3 w-3 mr-1" />
            Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="typography" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Font Family</Label>
            <select value={displayTheme.font} onChange={(e) => updateTheme({ font: e.target.value })} className={selectClass}>
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Font Size</Label>
              <span className="text-xs text-zinc-500 font-mono">{displayTheme.fontSize}px</span>
            </div>
            <Slider value={[displayTheme.fontSize]} onValueChange={([v]) => updateTheme({ fontSize: v })} min={8} max={24} step={1} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Line Height</Label>
              <span className="text-xs text-zinc-500 font-mono">{displayTheme.lineHeight ?? 1.5}</span>
            </div>
            <Slider value={[displayTheme.lineHeight ?? 1.5]} onValueChange={([v]) => updateTheme({ lineHeight: v })} min={1} max={2.5} step={0.1} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Font Weight</Label>
              <span className="text-xs text-zinc-500 font-mono">{displayTheme.fontWeight ?? 400}</span>
            </div>
            <Slider value={[displayTheme.fontWeight ?? 400]} onValueChange={([v]) => updateTheme({ fontWeight: v })} min={100} max={900} step={100} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Letter Spacing</Label>
              <span className="text-xs text-zinc-500 font-mono">{displayTheme.letterSpacing ?? 0}px</span>
            </div>
            <Slider value={[displayTheme.letterSpacing ?? 0]} onValueChange={([v]) => updateTheme({ letterSpacing: v })} min={-2} max={4} step={0.5} />
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Background</Label>
            <div className="flex gap-2">
              <Input type="color" value={displayTheme.bg} onChange={(e) => updateTheme({ bg: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
              <Input value={displayTheme.bg} onChange={(e) => updateTheme({ bg: e.target.value })} className="flex-1 text-xs" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Text Color</Label>
            <div className="flex gap-2">
              <Input type="color" value={displayTheme.textColor ?? displayTheme.text} onChange={(e) => updateTheme({ textColor: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
              <Input value={displayTheme.textColor ?? displayTheme.text} onChange={(e) => updateTheme({ textColor: e.target.value })} className="flex-1 text-xs" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Accent Color</Label>
            <div className="flex gap-2">
              <Input type="color" value={displayTheme.accent} onChange={(e) => updateTheme({ accent: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
              <Input value={displayTheme.accent} onChange={(e) => updateTheme({ accent: e.target.value })} className="flex-1 text-xs" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Message Background</Label>
            <div className="flex gap-2">
              <Input type="color" value={displayTheme.messageBg === "transparent" ? "#000000" : (displayTheme.messageBg ?? "#000000")} onChange={(e) => updateTheme({ messageBg: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
              <Input value={displayTheme.messageBg ?? "transparent"} onChange={(e) => updateTheme({ messageBg: e.target.value })} className="flex-1 text-xs" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Background Opacity</Label>
              <span className="text-xs text-zinc-500 font-mono">{Math.round((displayTheme.bgOpacity ?? 0.65) * 100)}%</span>
            </div>
            <Slider value={[(displayTheme.bgOpacity ?? 0.65) * 100]} onValueChange={([v]) => updateTheme({ bgOpacity: v / 100 })} min={0} max={100} step={5} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Text Shadow</Label>
            <Input value={displayTheme.textShadow ?? "none"} onChange={(e) => updateTheme({ textShadow: e.target.value })} placeholder="0 1px 2px rgba(0,0,0,0.5)" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Text Stroke Width</Label>
              <span className="text-xs text-zinc-500 font-mono">{displayTheme.textStrokeWidth ?? 0}px</span>
            </div>
            <Slider value={[displayTheme.textStrokeWidth ?? 0]} onValueChange={([v]) => updateTheme({ textStrokeWidth: v })} min={0} max={3} step={0.5} />
          </div>

          {(displayTheme.textStrokeWidth ?? 0) > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-zinc-400">Stroke Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={displayTheme.textStrokeColor ?? "#000000"} onChange={(e) => updateTheme({ textStrokeColor: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
                <Input value={displayTheme.textStrokeColor ?? "#000000"} onChange={(e) => updateTheme({ textStrokeColor: e.target.value })} className="flex-1 text-xs" />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Border Radius</Label>
              <span className="text-xs text-zinc-500 font-mono">{displayTheme.radius}px</span>
            </div>
            <Slider value={[displayTheme.radius]} onValueChange={([v]) => updateTheme({ radius: v })} min={0} max={20} step={1} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Message Padding</Label>
            <Input value={displayTheme.messagePadding ?? "2px 0"} onChange={(e) => updateTheme({ messagePadding: e.target.value })} placeholder="4px 8px" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Message Radius</Label>
              <span className="text-xs text-zinc-500 font-mono">{displayTheme.messageRadius ?? 0}px</span>
            </div>
            <Slider value={[displayTheme.messageRadius ?? 0]} onValueChange={([v]) => updateTheme({ messageRadius: v })} min={0} max={16} step={1} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Message Gap</Label>
              <span className="text-xs text-zinc-500 font-mono">{displayTheme.messageGap ?? 4}px</span>
            </div>
            <Slider value={[displayTheme.messageGap ?? 4]} onValueChange={([v]) => updateTheme({ messageGap: v })} min={0} max={12} step={1} />
          </div>
        </TabsContent>

        <TabsContent value="elements" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-400">Show Badges</Label>
            <Switch checked={displayTheme.showBadges ?? true} onCheckedChange={(v) => updateTheme({ showBadges: v })} />
          </div>

          {(displayTheme.showBadges ?? true) && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-zinc-400">Badge Size</Label>
                <span className="text-xs text-zinc-500 font-mono">{displayTheme.badgeSize ?? 14}px</span>
              </div>
              <Slider value={[displayTheme.badgeSize ?? 14]} onValueChange={([v]) => updateTheme({ badgeSize: v })} min={10} max={28} step={1} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-400">Show Avatars</Label>
            <Switch checked={displayTheme.showAvatars ?? true} onCheckedChange={(v) => updateTheme({ showAvatars: v })} />
          </div>

          {(displayTheme.showAvatars ?? true) && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs text-zinc-400">Avatar Size</Label>
                <span className="text-xs text-zinc-500 font-mono">{displayTheme.avatarSize ?? 20}px</span>
              </div>
              <Slider value={[displayTheme.avatarSize ?? 20]} onValueChange={([v]) => updateTheme({ avatarSize: v })} min={12} max={32} step={1} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-400">Show Timestamps</Label>
            <Switch checked={displayTheme.showTimestamps ?? true} onCheckedChange={(v) => updateTheme({ showTimestamps: v })} />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-400">Show Colon</Label>
            <Switch checked={displayTheme.showColon ?? true} onCheckedChange={(v) => updateTheme({ showColon: v })} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-zinc-400">Username Weight</Label>
              <span className="text-xs text-zinc-500 font-mono">{displayTheme.usernameWeight ?? 600}</span>
            </div>
            <Slider value={[displayTheme.usernameWeight ?? 600]} onValueChange={([v]) => updateTheme({ usernameWeight: v })} min={400} max={900} step={100} />
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-zinc-400">Newest Messages at Top</Label>
            <Switch checked={displayTheme.topToBottom ?? false} onCheckedChange={(v) => updateTheme({ topToBottom: v })} />
          </div>

          {displayTheme.bgImage && (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-400">Background Image</Label>
                <Input value={displayTheme.bgImage} onChange={(e) => updateTheme({ bgImage: e.target.value })} placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs text-zinc-400">Background Blur</Label>
                  <span className="text-xs text-zinc-500 font-mono">{displayTheme.bgBlur ?? 0}px</span>
                </div>
                <Slider value={[displayTheme.bgBlur ?? 0]} onValueChange={([v]) => updateTheme({ bgBlur: v })} min={0} max={100} step={5} />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Import/Export */}
      <div className="flex gap-2 pt-4 border-t border-white/5">
        <Button variant="outline" size="sm" onClick={handleExport} className="flex-1">
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowImport(!showImport)} className="flex-1">
          <Upload className="h-3 w-3 mr-1" />
          Import
        </Button>
      </div>

      {showImport && (
        <div className="space-y-2">
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder="Paste theme JSON here..."
            className="w-full h-24 p-3 rounded-lg border bg-zinc-900/40 border-white/10 text-xs text-white font-mono placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
          />
          <Button size="sm" onClick={handleImport} className="w-full">
            Apply Imported Theme
          </Button>
        </div>
      )}
    </div>
  );
}
