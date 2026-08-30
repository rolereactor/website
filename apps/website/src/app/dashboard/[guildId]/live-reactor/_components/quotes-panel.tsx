"use client";

import { useState, useEffect } from "react";
import { MessageSquareQuote, Plus, Trash2, Loader2, Quote } from "lucide-react";

import { useStreamingStore } from "@/store/use-streaming-store";
import { toast } from "@/lib/toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuotesPanelProps {
  guildId: string;
}

export function QuotesPanel({ guildId }: QuotesPanelProps) {
  const { quotesCache, isLoading, fetchQuotes, addQuote, deleteQuote } =
    useStreamingStore();

  const [newQuoteText, setNewQuoteText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const quotes = quotesCache[guildId] || [];
  const quotesLoading = isLoading[`quotes:${guildId}`];

  useEffect(() => {
    fetchQuotes(guildId);
  }, [guildId, fetchQuotes]);

  const handleAddQuote = async () => {
    if (!newQuoteText.trim()) return;
    try {
      setIsAdding(true);
      await addQuote(guildId, newQuoteText.trim());
      toast.success("Quote added successfully!");
      setNewQuoteText("");
    } catch (err) {
      console.error("Failed to add quote:", err);
      toast.error("Failed to add quote.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteQuote = async (id: number) => {
    try {
      setIsDeleting(id);
      await deleteQuote(guildId, id);
      toast.success("Quote deleted.");
    } catch (err) {
      console.error("Failed to delete quote:", err);
      toast.error("Failed to delete quote.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (quotesLoading && quotes.length === 0) {
    return (
      <Card variant="cyberpunk" showGrid>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Quote */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
              <MessageSquareQuote className="w-4 h-4 text-cyan-400" />
            </div>
            Add Quote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-2">
              <Label variant="cyber">Quote Text</Label>
              <Input
                variant="cyber"
                placeholder="Enter a quote..."
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddQuote();
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="cyber"
                onClick={handleAddQuote}
                disabled={isAdding || !newQuoteText.trim()}
                className="w-full sm:w-auto"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Quote
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <Card variant="cyberpunk" showGrid>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                <Quote className="w-4 h-4 text-emerald-400" />
              </div>
              Quotes
            </CardTitle>
            <span className="text-xs text-zinc-500 font-mono">
              {quotes.length} quote{quotes.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquareQuote className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No quotes yet.</p>
              <p className="text-xs text-zinc-600 mt-1">
                Add your first quote above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-white/2 transition-colors group"
                >
                  <span className="text-xs font-mono text-zinc-600 mt-0.5 shrink-0 w-6 text-right">
                    #{quote.id}
                  </span>
                  <p className="flex-1 text-sm text-zinc-300 wrap-break-word">
                    {quote.text}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 shrink-0"
                    onClick={() => handleDeleteQuote(quote.id)}
                    disabled={isDeleting === quote.id}
                  >
                    {isDeleting === quote.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
