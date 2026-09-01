"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, LayoutGrid } from "lucide-react";

export interface CategoryDraft {
  id?: string;
  label: string;
  emoji: string;
  description?: string;
  color?: number;
}

interface PanelCategoriesEditorProps {
  categories: CategoryDraft[];
  onChange: (categories: CategoryDraft[]) => void;
  max: number;
}

export function PanelCategoriesEditor({
  categories,
  onChange,
  max,
}: PanelCategoriesEditorProps) {
  const updateCategory = (index: number, patch: Partial<CategoryDraft>) => {
    onChange(categories.map((cat, i) => (i === index ? { ...cat, ...patch } : cat)));
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) return;
    onChange(categories.filter((_, i) => i !== index));
  };

  const addCategory = () => {
    if (categories.length >= max) return;
    onChange([...categories, { label: "", emoji: "🎫" }]);
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <LayoutGrid className="size-3" />
          Categories
        </Label>
        <span className="text-[10px] font-mono text-zinc-600">
          {categories.length} / {max}
        </span>
      </div>
      <p className="text-[10px] text-zinc-600 font-mono">
        Each category becomes a button on the panel message.
      </p>

      <div className="space-y-2">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={category.emoji}
              onChange={(e) => updateCategory(index, { emoji: e.target.value })}
              maxLength={32}
              aria-label={`Category ${index + 1} emoji`}
              className="bg-zinc-900/50 border-white/10 font-mono text-xs w-14 shrink-0 text-center px-1"
            />
            <Input
              value={category.label}
              onChange={(e) => updateCategory(index, { label: e.target.value })}
              placeholder={`Category ${index + 1} label`}
              maxLength={80}
              aria-label={`Category ${index + 1} label`}
              className="bg-zinc-900/50 border-white/10 font-mono text-xs flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeCategory(index)}
              disabled={categories.length <= 1}
              aria-label={`Remove category ${index + 1}`}
              className="size-8 shrink-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {categories.length < max && (
        <Button
          type="button"
          variant="outline"
          onClick={addCategory}
          className="w-full font-mono text-[10px] uppercase tracking-widest border-dashed border-white/10 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30"
        >
          <Plus className="size-3 mr-1" />
          Add Category
        </Button>
      )}
    </div>
  );
}
