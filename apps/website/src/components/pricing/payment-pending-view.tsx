"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Audiowide } from "next/font/google";
import { useCoreBalance } from "@/hooks/use-core-balance";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface PendingPaymentInfo {
  orderId: string;
  expectedCores: number;
  initialBalance: number;
}

interface PaymentPendingViewProps {
  pendingPayment: PendingPaymentInfo | null;
  onComplete: () => void;
  onReturn: () => void;
}

export function PaymentPendingView({
  pendingPayment,
  onComplete,
  onReturn,
}: PaymentPendingViewProps) {
  const { balance, mutate } = useCoreBalance();
  const [status, setStatus] = useState<"pending" | "confirmed">("pending");
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    setElapsed(0);
    setStatus("pending");
    startTimeRef.current = Date.now();

    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingPayment?.orderId]);

  useEffect(() => {
    if (!pendingPayment || status !== "pending") return;

    const checkBalance = async () => {
      await mutate();

      if (balance !== null && pendingPayment) {
        const balanceIncrease = balance - pendingPayment.initialBalance;
        if (balanceIncrease >= pendingPayment.expectedCores * 0.9) {
          setStatus("confirmed");
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => onComplete(), 1500);
          return;
        }
      }
    };

    pollRef.current = setInterval(checkBalance, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pendingPayment, status, balance, mutate, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    if (status === "confirmed") {
      return (
        <>
          Payment confirmed!
          <br />
          Crediting your balance...
        </>
      );
    }
    if (elapsed < 30) {
      return (
        <>
          External payment window opened.
          <br />
          Awaiting network confirmation...
        </>
      );
    }
    if (elapsed < 120) {
      return (
        <>
          Still waiting for confirmation.
          <br />
          This may take a few minutes depending on the network.
        </>
      );
    }
    return (
      <>
        Payment still processing.
        <br />
        If you completed the payment, cores will appear shortly.
      </>
    );
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-12 text-center space-y-6 relative overflow-hidden min-h-100 [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent_70%)]" />

      {status === "confirmed" ? (
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-2 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative z-10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
      ) : (
        <div className="w-20 h-20 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center mb-2 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative z-10">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      )}

      <div className="space-y-2 relative z-10">
        <h3
          className={cn(
            "text-xl font-black text-white tracking-widest",
            audiowide.className
          )}
        >
          {status === "confirmed" ? "ENERGY RECEIVED" : "LINK ESTABLISHED"}
        </h3>
        <p className="text-xs text-zinc-500 max-w-70 font-bold uppercase tracking-wider leading-relaxed">
          {getStatusText()}
        </p>
      </div>

      {pendingPayment && status === "pending" && (
        <div className="relative z-10 space-y-2">
          <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            {pendingPayment.expectedCores} Cores
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Checking every 5s ({formatTime(elapsed)})</span>
          </div>
        </div>
      )}

      <Button
        className="w-full max-w-60 mt-6 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 rounded-xl h-12 font-black uppercase tracking-widest text-xs relative z-10 transition-all hover:border-cyan-500/30"
        onClick={onReturn}
      >
        Return to Dashboard
      </Button>
    </div>
  );
}
