"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Audiowide } from "next/font/google";
import { toast } from "@/lib/toast";
import Image from "next/image";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

interface BmacData {
  code: string;
  username: string;
  buyMeACoffeeUrl: string;
  expiresAt: string;
}

const rateCard = [
  { min: 5, max: 9, rate: 15, bonus: 0 },
  { min: 10, max: 24, rate: 16.5, bonus: 10 },
  { min: 25, max: 49, rate: 17.4, bonus: 16 },
  { min: 50, max: 99, rate: 18, bonus: 20 },
  { min: 100, max: Infinity, rate: 22, bonus: 47 },
];

function CodeExpiryTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const isUrgent = timeLeft.startsWith("00h") || timeLeft === "Expired";

  return (
    <div className="flex items-center justify-between text-xs text-zinc-500">
      <span>Code expires in:</span>
      <span
        className={cn(
          "font-mono font-bold",
          isUrgent ? "text-red-400" : "text-zinc-400"
        )}
      >
        {timeLeft}
      </span>
    </div>
  );
}

export default function DonatePage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<BmacData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "pending" | "credited" | "expired"
  >("idle");

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("discord", { callbackUrl: "/donate" });
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const generateCode = async () => {
      try {
        const response = await fetch("/api/payments/buymeacoffee", {
          method: "POST",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || "Failed to generate code"
          );
        }

        const result = await response.json();
        if (result.success && result.data) {
          setData(result.data);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate code"
        );
        toast.error("Failed to generate payment code");
      } finally {
        setLoading(false);
      }
    };

    generateCode();
  }, [status]);

  const copyToClipboard = async (text: string, type: "code" | "name") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedName(true);
        setTimeout(() => setCopiedName(false), 2000);
      }
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const checkPaymentStatus = async () => {
    setCheckingStatus(true);
    try {
      const res = await fetch("/api/payments/buymeacoffee/status");
      const result = await res.json();
      const s = result?.data?.status;
      if (s === "credited") {
        setPaymentStatus("credited");
        toast.success("🎉 Cores received! Redirecting to your dashboard...");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else if (s === "expired") {
        setPaymentStatus("expired");
        toast.error(
          "Your code has expired. Please refresh to generate a new one."
        );
      } else {
        setPaymentStatus("pending");
        toast.info(
          "Still waiting — Cores are credited within seconds of BMAC confirming."
        );
      }
    } catch {
      toast.error("Could not check payment status. Try again.");
    } finally {
      setCheckingStatus(false);
    }
  };

  // Auto-poll every 10 seconds when status is pending
  useEffect(() => {
    if (paymentStatus !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/payments/buymeacoffee/status");
        const result = await res.json();
        const s = result?.data?.status;
        if (s === "credited") {
          setPaymentStatus("credited");
          toast.success("🎉 Cores received! Redirecting to your dashboard...");
          setTimeout(() => router.push("/dashboard"), 2000);
        } else if (s === "expired") {
          setPaymentStatus("expired");
          toast.error(
            "Your code has expired. Please refresh to generate a new one."
          );
        }
      } catch {
        // Silently fail during auto-poll
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [paymentStatus, router]);

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            Generating your code...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs text-red-400 uppercase tracking-widest">
            {error || "Failed to load"}
          </p>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 mb-4 hover:bg-amber-400/10 hover:text-amber-400 transition-colors relative z-10"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 flex items-center justify-center bg-amber-400/10 rounded-2xl border border-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.15)] overflow-hidden">
                <Image
                  src="/bmcbrand/bmc-logo-yellow.png"
                  alt="BMC Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-400 tracking-tight">
                  Buy Me a Coffee
                </h1>
                <p className="text-amber-100/60 text-sm font-medium mt-1">
                  Donate any amount, get Cores instantly
                </p>
              </div>
            </div>
          </div>

          {/* Rate Card */}
          <div className="bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 border border-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.05)] mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-400/10 transition-colors duration-700" />
            <h2 className="text-xs font-black text-amber-500/70 tracking-widest uppercase mb-4 relative z-10">
              Rate Card
            </h2>
            <div className="space-y-2 relative z-10 bg-black/40 rounded-xl border border-amber-400/5 p-4 mb-4">
              {rateCard.map((tier, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-sm text-zinc-300 font-medium">
                    ${tier.min}
                    {tier.max !== Infinity ? `–${tier.max}` : "+"}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.3)]">
                      {tier.rate} cores/$
                    </span>
                    {tier.bonus > 0 && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]">
                        +{tier.bonus}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative z-10 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs text-blue-200/80 leading-relaxed font-medium">
                <strong className="text-blue-400 font-bold">Note:</strong> Because Buy Me a Coffee handles donations in $5 "Coffee" increments, you won't see your Core amount on their checkout page. 
                Our system will automatically read your total donation amount and instantly credit your account using the exact rates above! (e.g., 3 Coffees = $15 = 247 Cores).
              </p>
            </div>
          </div>

          {/* Code & Username */}
          <div className="bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 border border-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.05)] mb-6 space-y-5 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2 group-hover:bg-amber-400/10 transition-colors duration-700" />

            {/* Unique Code */}
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-amber-500/70 tracking-widest uppercase mb-2">
                Your Unique Code
              </h3>
              <div className="bg-black/60 rounded-xl border border-amber-400/20 p-4 flex items-center justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] group/code hover:border-amber-400/40 transition-colors">
                <span
                  className={cn(
                    "text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 tracking-widest",
                    audiowide.className
                  )}
                >
                  {data.code}
                </span>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-lg w-10 h-10 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer"
                  onClick={() => copyToClipboard(data.code, "code")}
                >
                  {copiedCode ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Discord Name */}
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-amber-500/70 tracking-widest uppercase mb-2">
                Your Discord Name
              </h3>
              <div className="bg-black/60 rounded-xl border border-amber-400/10 p-4 flex items-center justify-between shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] group/name hover:border-amber-400/30 transition-colors">
                <span className="text-base font-bold text-white tracking-wide">
                  {data.username}
                </span>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-lg w-10 h-10 bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer"
                  onClick={() => copyToClipboard(data.username, "name")}
                >
                  {copiedName ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Code Expiry Countdown */}
            <div className="relative z-10 pt-2 border-t border-white/5">
              <CodeExpiryTimer expiresAt={data.expiresAt} />
            </div>
          </div>

          {/* Instructions with Image Placeholders */}
          <div className="bg-zinc-950/40 backdrop-blur-md rounded-2xl p-6 border border-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.05)] mb-8 relative overflow-hidden group">
            <h2 className="text-xs font-black text-amber-500/70 tracking-widest uppercase mb-6 relative z-10">
              How to Donate
            </h2>
            <div className="space-y-8 relative z-10">
              {/* Step 1 */}
              <div className="space-y-4 bg-black/20 rounded-xl p-5 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                    <span className="text-amber-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="text-base text-white font-bold">
                      Click "Donate" below to open Buy Me a Coffee
                    </p>
                    <p className="text-xs text-amber-100/50 mt-1 font-medium">
                      A new tab will open with the donation page
                    </p>
                  </div>
                </div>
                <div className="bg-black/60 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                  <Image
                    src="/images/bmac/bmac_step_1.png"
                    alt="Step 1: Click Donate"
                    width={400}
                    height={200}
                    draggable={false}
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-4 bg-black/20 rounded-xl p-5 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                    <span className="text-amber-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="text-base text-white font-bold">
                      Choose how many coffees to buy
                    </p>
                    <p className="text-xs text-amber-100/50 mt-1 font-medium">
                      1 coffee = $5. More coffees = more Cores!
                    </p>
                  </div>
                </div>
                <div className="bg-black/60 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                  <Image
                    src="/images/bmac/bmac_step_2.png"
                    alt="Step 2: Choose coffees"
                    width={400}
                    height={200}
                    draggable={false}
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4 bg-black/20 rounded-xl p-5 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                    <span className="text-amber-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="text-base text-white font-bold">
                      Copy your Discord name above → paste into the Name box
                    </p>
                    <p className="text-xs text-amber-100/50 mt-1 font-medium">
                      It's the field that says "Name or @yoursocial"
                    </p>
                  </div>
                </div>
                <div className="bg-black/60 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                  <Image
                    src="/images/bmac/bmac_step_3.png"
                    alt="Step 3: Paste Discord name"
                    width={400}
                    height={200}
                    draggable={false}
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-4 bg-black/20 rounded-xl p-5 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.2)]">
                    <span className="text-amber-400 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <p className="text-base text-white font-bold">
                      Copy your unique code above → paste into the message box
                    </p>
                    <p className="text-xs text-amber-100/50 mt-1 font-medium">
                      It's the field that says "Say something nice..." — this
                      links your payment!
                    </p>
                  </div>
                </div>
                <div className="bg-black/60 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                  <Image
                    src="/images/bmac/bmac_step_4.png"
                    alt="Step 4: Paste unique code"
                    width={400}
                    height={200}
                    draggable={false}
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>

              {/* Step 5 */}
              <div className="space-y-4 bg-black/20 rounded-xl p-5 border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                    <Check className="text-emerald-400 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-base text-white font-bold">
                      Complete the donation
                    </p>
                    <p className="text-xs text-emerald-100/50 mt-1 font-medium">
                      Cores are added automatically within seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Donate link — always opens BMAC */}
            <a
              href={data.buyMeACoffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Button className="w-full py-6 h-auto rounded-2xl font-black uppercase tracking-widest text-base bg-gradient-to-r from-[#FFDD00] to-[#F5C200] hover:from-[#F5C200] hover:to-[#E0A800] text-black transition-all shadow-[0_0_20px_-5px_rgba(255,221,0,0.5)] border border-[#FFDD00]/50 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 w-1/2 h-full -skew-x-12 -translate-x-[150%] group-hover:animate-[shimmer_1s_infinite] pointer-events-none" />
                <Image
                  src="/bmcbrand/bmc-logo.svg"
                  alt="BMC"
                  width={24}
                  height={24}
                  className="mr-3"
                />
                Donate on Buy Me a Coffee
                <ExternalLink className="w-5 h-5 ml-2 opacity-60" />
              </Button>
            </a>

            {/* Status check — polls the bot for real confirmation */}
            <Button
              variant="secondary"
              className="w-full py-5 h-auto rounded-2xl font-bold uppercase tracking-widest text-xs bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer"
              onClick={checkPaymentStatus}
              disabled={checkingStatus || paymentStatus === "credited"}
            >
              {checkingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 text-cyan-400" />
                  Checking Status...
                </>
              ) : paymentStatus === "pending" ? (
                <span className="text-cyan-400">Still Waiting — Check Again</span>
              ) : paymentStatus === "credited" ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  <span className="text-emerald-400">
                    Cores Received! Redirecting...
                  </span>
                </>
              ) : (
                <span className="text-zinc-400 group-hover:text-cyan-100">
                  I've Completed Payment — Check Status
                </span>
              )}
            </Button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center shadow-[0_0_15px_rgba(251,191,36,0.05)]">
              <p className="text-xs text-amber-100/80 leading-relaxed font-medium">
                If your Cores do not appear automatically after your donation, please reach out in our{" "}
                <a href="https://discord.gg/D8tYkU75Ry" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold hover:text-amber-300 hover:underline underline-offset-2 transition-all">
                  Discord Support Server
                </a>
                {" "}with your receipt and our team will credit your account manually.
              </p>
            </div>
            <p className="text-[10px] text-zinc-600 text-center leading-relaxed font-bold uppercase tracking-widest">
              Cores are non-refundable digital assets.
              <br />
              Delivery is automatic after donation confirmation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
