"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, History, Coins, Bitcoin } from "lucide-react";
import { getUserTransactions } from "../actions";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

interface Transaction {
  paymentId: string;
  provider: string;
  type?: string;
  amount: number;
  coresGranted: number;
  status: string;
  createdAt: string;
  currency?: string;
}

interface ViewTransactionsDialogProps {
  user: {
    id: string;
    username: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewTransactionsDialog({
  user,
  open,
  onOpenChange,
}: ViewTransactionsDialogProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user?.id) {
      loadTransactions(user.id);
    } else {
      setTransactions([]);
    }
  }, [open, user?.id]);

  const loadTransactions = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUserTransactions(userId);
      if (result.success) {
        setTransactions(result.transactions || []);
      } else {
        setError(result.error ?? "Unknown error");
      }
    } catch (err) {
      setError("Failed to load transactions.");
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderBadge = (provider: string) => {
    if (provider === "top.gg") {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] uppercase font-mono px-1">
          Vote Reward
        </Badge>
      );
    }
    if (provider === "premium_system") {
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] uppercase font-mono px-1">
          Pro Engine
        </Badge>
      );
    }
    if (provider === "admin_adjustment") {
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[9px] uppercase font-mono px-1">
          Admin
        </Badge>
      );
    }
    return (
      <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[9px] uppercase font-mono px-1">
        Crypto / {provider}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 border-white/5 bg-zinc-950/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 italic">
            <History className="size-4 text-cyan-500" />
            Transaction History
          </DialogTitle>
          <DialogDescription className="font-mono text-[10px] uppercase tracking-wider">
            Viewing payment and core grant history for:{" "}
            <span className="text-cyan-500">{user?.username || "User"}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto pr-2 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-4">
              <Loader2 className="size-6 text-cyan-500 animate-spin" />
              <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                Fetching records...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="font-mono text-xs text-red-400 uppercase tracking-widest text-center">
                {error}
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 opacity-50">
              <History className="size-8 text-zinc-600 mb-4" />
              <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                No transactions found
              </p>
            </div>
          ) : (
            transactions.map((tx, idx) => (
              <div
                key={tx.paymentId || idx}
                className="group relative p-3 bg-zinc-900/40 border border-white/5 rounded-xl hover:bg-zinc-900/60 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg text-xs font-black",
                        tx.amount > 0
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      )}
                    >
                      {tx.amount > 0 ? (
                        <Bitcoin className="size-4" />
                      ) : (
                        <Coins className="size-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-xs font-bold text-zinc-100 uppercase">
                          {tx.paymentId.length > 20
                            ? tx.paymentId.substring(0, 20) + "..."
                            : tx.paymentId}
                        </p>
                        {getProviderBadge(tx.provider)}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-medium font-mono uppercase">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white font-mono leading-none tracking-tighter">
                      {tx.amount > 0 ? formatCurrency(tx.amount) : "FREE"}
                    </p>
                    <p
                      className={cn(
                        "text-[10px] font-mono font-bold mt-1 uppercase",
                        tx.coresGranted < 0 ? "text-red-400" : "text-cyan-400"
                      )}
                    >
                      {tx.coresGranted > 0 ? "+" : ""}
                      {tx.coresGranted.toLocaleString()} Cores
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
