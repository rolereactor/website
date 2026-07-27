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

const BASE_RATE = 15;
const rateCard = [
  { min: 5, max: 9, rate: 15, bonus: 0 },
  { min: 10, max: 24, rate: 16.5, bonus: 10 },
  { min: 25, max: 99, rate: 17.4, bonus: 16 },
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
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 mb-4"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image
                  src="/bmcbrand/bmc-logo-yellow.png"
                  alt="BMC Logo"
                  width={48}
                  height={48}
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Buy Me a Coffee
                </h1>
                <p className="text-zinc-400 text-sm">
                  Donate any amount, get Cores instantly
                </p>
              </div>
            </div>
          </div>

          {/* Rate Card */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800 mb-6">
            <h2 className="text-sm font-black text-zinc-400 tracking-widest uppercase mb-2">
              Rate Card
            </h2>
            <p className="text-[10px] text-zinc-500 mb-4 font-bold">
              Base rate: {BASE_RATE} cores/$
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {rateCard.map((tier, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                >
                  <div className="text-xs text-zinc-500 mb-1">
                    ${tier.min}
                    {tier.max !== Infinity ? `-${tier.max}` : "+"}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <div className="text-lg font-bold text-cyan-400 whitespace-nowrap">
                      {tier.rate}
                    </div>
                    {tier.bonus > 0 && (
                      <div className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">
                        +{tier.bonus}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code & Username */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800 mb-6 space-y-4">
            {/* Unique Code */}
            <div>
              <h3 className="text-xs font-black text-zinc-400 tracking-widest uppercase mb-2">
                Your Unique Code
              </h3>
              <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-3 flex items-center justify-between">
                <span
                  className={cn(
                    "text-xl font-black text-white tracking-widest",
                    audiowide.className
                  )}
                >
                  {data.code}
                </span>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-lg w-8 h-8"
                  onClick={() => copyToClipboard(data.code, "code")}
                >
                  {copiedCode ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Discord Name */}
            <div>
              <h3 className="text-xs font-black text-zinc-400 tracking-widest uppercase mb-2">
                Your Discord Name
              </h3>
              <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-3 flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {data.username}
                </span>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-lg w-8 h-8"
                  onClick={() => copyToClipboard(data.username, "name")}
                >
                  {copiedName ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Code Expiry Countdown */}
            <CodeExpiryTimer expiresAt={data.expiresAt} />
          </div>

          {/* Instructions with Image Placeholders */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800 mb-6">
            <h2 className="text-sm font-black text-zinc-400 tracking-widest uppercase mb-4">
              How to Donate
            </h2>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold text-lg">1.</span>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Click &quot;Donate&quot; below to open Buy Me a Coffee
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      A new tab will open with the donation page
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/bmac/bmac_step_1.png"
                    alt="Step 1: Click Donate"
                    width={400}
                    height={200}
                    className="drop-shadow-lg w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold text-lg">2.</span>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Choose how many coffees to buy
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      1 coffee = $5. More coffees = more Cores!
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/bmac/bmac_step_2.png"
                    alt="Step 2: Choose coffees"
                    width={400}
                    height={200}
                    className="drop-shadow-lg w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold text-lg">3.</span>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Copy your Discord name above → paste into the Name box on
                      BMAC
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      It&apos;s the field that says &quot;Name or
                      @yoursocial&quot; — for secondary verification
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/bmac/bmac_step_3.png"
                    alt="Step 3: Paste Discord name"
                    width={400}
                    height={200}
                    className="drop-shadow-lg w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold text-lg">4.</span>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Copy your unique code above → paste into the message box
                      on BMAC
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      It&apos;s the field that says &quot;Say something
                      nice...&quot; — this links your donation to your account
                    </p>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/bmac/bmac_step_4.png"
                    alt="Step 4: Paste unique code"
                    width={400}
                    height={200}
                    className="drop-shadow-lg w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Step 5 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold text-lg">5.</span>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Complete the donation
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Cores are added automatically within seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Donate link — always opens BMAC */}
            <a
              href={data.buyMeACoffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black transition-all shadow-[0_0_20px_-5px_rgba(255,221,0,0.4)]">
                <Image
                  src="/bmcbrand/bmc-logo.svg"
                  alt="BMC"
                  width={18}
                  height={18}
                  className="mr-3"
                />
                Donate on Buy Me a Coffee
                <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </a>

            {/* Status check — polls the bot for real confirmation */}
            <Button
              variant="secondary"
              className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/5"
              onClick={checkPaymentStatus}
              disabled={checkingStatus || paymentStatus === "credited"}
            >
              {checkingStatus ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-2" />
                  Checking...
                </>
              ) : paymentStatus === "pending" ? (
                "Still Waiting — Check Again"
              ) : paymentStatus === "credited" ? (
                <>
                  <Check className="w-3 h-3 mr-2" />
                  Cores Received! Redirecting...
                </>
              ) : (
                "I've Completed Payment — Check Status"
              )}
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-[9px] text-zinc-600 text-center mt-6 leading-relaxed font-bold uppercase tracking-widest">
            Cores are non-refundable digital assets.
            <br />
            Delivery is automatic after donation confirmation.
          </p>
        </div>
      </div>
    </main>
  );
}
