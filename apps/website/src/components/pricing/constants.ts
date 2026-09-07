import type { CorePackage, PricingData } from "@/types/pricing";
import { SiBitcoin, SiEthereum, SiBinance, SiSolana } from "react-icons/si";
import type { IconType } from "react-icons";

export type { CorePackage, PricingData };

/**
 * Supported cryptocurrencies for Multicoin Gateway (Plisio)
 * Focused on 4 top native cryptocurrencies (BTC, ETH, BNB, SOL) for a balanced 2x2 grid.
 * All stablecoin payments (USDC/USDT) are handled via Direct Web3 Wallet on L2s for $0 gas fees.
 */
export const supportedCryptos: Array<{
  id: string;
  name: string;
  icon: IconType;
  color: string;
}> = [
  { id: "BTC", name: "Bitcoin", icon: SiBitcoin, color: "#F7931A" },
  { id: "ETH", name: "Ethereum", icon: SiEthereum, color: "#627EEA" },
  { id: "BNB", name: "BNB Chain", icon: SiBinance, color: "#F3BA2F" },
  { id: "SOL", name: "Solana", icon: SiSolana, color: "#14F195" },
];
