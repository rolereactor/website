"use client";

import React from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useReadContract,
} from "wagmi";
import { parseUnits, formatUnits, erc20Abi } from "viem";
import { useAppKit } from "@reown/appkit/react";
import { useUserStore } from "@/store/use-user-store";
import { useNotificationStore } from "@/store/use-notification-store";

import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CryptoCheckoutProps {
  packageId?: string;
  usdAmount: number;
  receiverAddress: string;
  onSuccess?: (hash: string) => void;
  className?: string;
}

const allowTestnet =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ALLOW_TESTNET === "true";

const STABLECOIN_CONFIGS: Record<
  number,
  | {
      address: `0x${string}`;
      decimals: number;
      symbol: string;
      chainName: string;
    }
  | undefined
> = {
  1: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    symbol: "USDC",
    chainName: "Ethereum",
  },
  137: {
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    decimals: 6,
    symbol: "USDC",
    chainName: "Polygon",
  },
  8453: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    symbol: "USDC",
    chainName: "Base",
  },
  42161: {
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    decimals: 6,
    symbol: "USDC",
    chainName: "Arbitrum",
  },
  10: {
    address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    decimals: 6,
    symbol: "USDC",
    chainName: "Optimism",
  },
  56: {
    address: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18,
    symbol: "USDT",
    chainName: "BSC",
  },
  ...(allowTestnet
    ? {
        11155111: {
          address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
          decimals: 6,
          symbol: "USDC",
          chainName: "Sepolia",
        },
      }
    : {}),
};

export function CryptoCheckout({
  packageId = "$10",
  usdAmount = 10,
  receiverAddress = process.env.NEXT_PUBLIC_WEB3_RECEIVER_ADDRESS ||
    "0xC850f03295Bb614d52038FB83f78f72ed8f7c65d",
  onSuccess,
  className = "",
}: CryptoCheckoutProps) {
  const { isConnected, address } = useAccount();
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isFullyComplete, setIsFullyComplete] = React.useState(false);
  const [lastAttemptedHash, setLastAttemptedHash] = React.useState<
    string | null
  >(null);
  const chainId = useChainId();
  const { open } = useAppKit();
  const { user, fetchUser } = useUserStore();
  const { fetchNotifications } = useNotificationStore();
  const {
    data: hash,
    writeContract,
    isPending: isSending,
  } = useWriteContract();

  React.useEffect(() => {
    if (hash && address) {
      localStorage.setItem(
        "pendingWeb3Payment",
        JSON.stringify({
          txHash: hash,
          packageId,
          chainId,
          senderAddress: address,
          timestamp: Date.now(),
        })
      );
    }
  }, [hash, packageId, chainId, address]);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const stablecoin = STABLECOIN_CONFIGS[chainId];
  const symbol = stablecoin?.symbol || "USDC";

  // Read user's stablecoin balance on the current chain
  const { data: rawBalance, isLoading: isBalanceLoading } = useReadContract({
    address: stablecoin?.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!stablecoin,
    },
  });

  const tokenBalance =
    rawBalance !== undefined && stablecoin
      ? Number(formatUnits(rawBalance, stablecoin.decimals))
      : null;

  const hasEnoughBalance =
    tokenBalance !== null ? tokenBalance >= usdAmount : true;

  const handlePayment = () => {
    if (
      !receiverAddress ||
      receiverAddress === "0x0000000000000000000000000000000000000000"
    ) {
      toast.error("Receiver address not configured.");
      return;
    }
    if (!stablecoin) {
      toast.error(`Stablecoin not supported on this network.`);
      return;
    }

    try {
      const amountUnits = parseUnits(usdAmount.toString(), stablecoin.decimals);

      writeContract({
        address: stablecoin.address,
        abi: erc20Abi,
        functionName: "transfer",
        args: [receiverAddress as `0x${string}`, amountUnits],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to initiate transaction");
    }
  };

  React.useEffect(() => {
    if (
      isSuccess &&
      hash &&
      hash !== lastAttemptedHash &&
      !isVerifying &&
      !isFullyComplete
    ) {
      setLastAttemptedHash(hash);
      setIsVerifying(true);
      toast.info("Verifying transaction...");

      fetch("/api/payments/verify-web3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: hash,
          packageId,
          chainId,
          senderAddress: address,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            // If already processed, it means they recovered a transaction that actually succeeded previously
            if (err.error?.message === "Transaction already processed") {
              return true;
            }
            throw new Error(err.error?.message || "Verification failed");
          }
          return true;
        })
        .then(() => {
          setIsFullyComplete(true);
          toast.success("Payment successful!");
          localStorage.removeItem("pendingWeb3Payment");
          if (user?.userId) {
            fetchUser(user.userId, true);
          }
          fetchNotifications();
          onSuccess?.(hash);
        })
        .catch((err) => {
          console.error(err);
          toast.error(
            err.message ||
              "Could not verify payment. Please contact support if you were charged."
          );
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [
    isSuccess,
    hash,
    onSuccess,
    isVerifying,
    isFullyComplete,
    packageId,
    chainId,
    lastAttemptedHash,
    fetchNotifications,
    fetchUser,
    user?.userId,
    address,
  ]);

  if (isFullyComplete) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 border border-green-500/30 rounded-2xl bg-green-500/5 backdrop-blur-sm shadow-[0_0_30px_rgba(34,197,94,0.15)] ${className}`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
          <CheckCircle2 className="w-16 h-16 text-green-400 mb-6 relative z-10 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </div>
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-2">
          Payment Complete
        </h3>
        <p className="text-sm text-green-200/70 text-center font-medium">
          Thank you! Your transaction was verified and your balance has been
          updated.
        </p>
      </div>
    );
  }

  const isBusy = isSending || isConfirming || isVerifying;
  let buttonText = `Send ${usdAmount} ${symbol}`;
  if (isSending) buttonText = "Confirm in Wallet...";
  else if (isConfirming) buttonText = "Confirming on Blockchain...";
  else if (isVerifying) buttonText = "Verifying Payment...";
  else if (!hasEnoughBalance) buttonText = `Insufficient ${symbol} Balance`;

  return (
    <div
      className={`flex flex-col items-center p-8 border border-cyan-500/20 rounded-2xl bg-zinc-950/40 backdrop-blur-md shadow-[0_0_40px_rgba(6,182,212,0.1)] w-full max-w-sm mx-auto relative overflow-hidden group ${className}`}
    >
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700 pointer-events-none" />

      <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100 to-cyan-500 mb-8 relative z-10 tracking-tight">
        Pay with Stablecoin
      </h3>

      {!isConnected ? (
        <div className="w-full flex justify-center relative z-10">
          <button
            onClick={() => open()}
            className="group relative w-full py-4 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-[1px] bg-zinc-950 rounded-[11px] z-10 transition-colors group-hover:bg-zinc-900" />
            <div className="relative z-20 flex items-center justify-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-bold text-lg tracking-wide group-hover:from-cyan-300 group-hover:to-blue-300 transition-all">
                Connect Wallet
              </span>
            </div>
            <div className="absolute inset-0 z-30 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-6 relative z-10">
          {/* Wallet & Network Info Box */}
          <div className="w-full p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-500/70 uppercase tracking-wider font-semibold">
                Connected Wallet
              </span>
              {stablecoin && (
                <span className="text-[9px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {stablecoin.chainName}
                </span>
              )}
            </div>
            <p className="text-sm font-mono text-cyan-100/90 tracking-wider">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
            {stablecoin && (
              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                <span className="text-zinc-500">Your {symbol} Balance:</span>
                {isBalanceLoading ? (
                  <span className="text-zinc-400 animate-pulse text-[11px]">
                    Checking...
                  </span>
                ) : tokenBalance !== null ? (
                  <span
                    className={`font-semibold font-mono ${
                      hasEnoughBalance
                        ? "text-emerald-400"
                        : "text-rose-400 font-bold"
                    }`}
                  >
                    {tokenBalance.toFixed(2)} {symbol}
                  </span>
                ) : (
                  <span className="text-zinc-500">--</span>
                )}
              </div>
            )}
          </div>

          <div className="text-center mb-2 w-full">
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold mb-2">
              Total Amount
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 drop-shadow-md">
                ${usdAmount.toFixed(2)}
              </p>
            </div>
            {!stablecoin ? (
              <p className="text-xs font-semibold text-red-400 mt-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 inline-block shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                Network not supported. Switch network.
              </p>
            ) : (
              <p className="text-sm font-mono text-cyan-400 mt-2 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 inline-block shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                Exactly {usdAmount} {symbol}
              </p>
            )}

            {/* Insufficient Balance Alert */}
            {!hasEnoughBalance && (
              <div className="w-full mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Insufficient {symbol} Balance</span>
                </div>
                <p className="text-rose-200/70 text-[11px] leading-relaxed">
                  You need {usdAmount} {symbol} on {stablecoin?.chainName}.
                  Switch network in AppKit or use the Multicoin Gateway to pay
                  with BTC/ETH.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handlePayment}
            disabled={isBusy || !stablecoin || !hasEnoughBalance}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] border border-cyan-400/30"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin text-cyan-300" />
                <span className="text-sm">{buttonText}</span>
              </>
            ) : (
              buttonText
            )}
          </button>

          <div className="w-full flex justify-center mt-4">
            <button
              onClick={() => open()}
              className="text-xs font-semibold text-zinc-500 hover:text-cyan-400 transition-colors px-4 py-2 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20"
            >
              Manage Wallet & Network
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
