// Sponsor data management
// In a real app, this would fetch from Buy Me a Coffee API

export interface Sponsor {
  id: string;
  name: string;
  tier: "gold" | "silver" | "bronze" | "supporter";
  amount: string;
  avatar?: string;
  message?: string;
  joinDate: string;
  isAnonymous?: boolean;
  bmcId?: string; // Buy Me a Coffee supporter ID
}

// Function to determine tier based on amount
export function getTierFromAmount(
  amount: number
): "gold" | "silver" | "bronze" | "supporter" {
  if (amount >= 50) return "gold";
  if (amount >= 20) return "silver";
  if (amount >= 10) return "bronze";
  return "supporter";
}

// Function to format amount
export function formatAmount(amount: number): string {
  return `$${amount}/month`;
}

// Fetch real sponsors from the bot API via /api/supporters
export async function getSponsors(): Promise<Sponsor[]> {
  try {
    const res = await fetch("/api/supporters");
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.supporters)) {
        return json.data.supporters;
      }
    }
  } catch (error) {
    console.error("Failed to fetch real sponsors:", error);
  }
  return [];
}
