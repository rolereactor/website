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

// Mock data - replace with real API calls
export const mockSponsors: Sponsor[] = [
  {
    id: "1",
    name: "Discord Community",
    tier: "gold",
    amount: "$50/month",
    message: "Amazing bot for our server!",
    joinDate: "2024-01-15",
    bmcId: "bmc_123456",
  },
  {
    id: "2",
    name: "Gaming Guild",
    tier: "gold",
    amount: "$30/month",
    message: "Perfect for managing our gaming roles",
    joinDate: "2024-01-20",
    bmcId: "bmc_123457",
  },
  {
    id: "3",
    name: "Tech Enthusiasts",
    tier: "silver",
    amount: "$20/month",
    message: "Great tool for our tech community",
    joinDate: "2024-02-01",
    bmcId: "bmc_123458",
  },
  {
    id: "4",
    name: "Art Collective",
    tier: "silver",
    amount: "$15/month",
    joinDate: "2024-02-10",
    bmcId: "bmc_123459",
  },
  {
    id: "5",
    name: "Study Group",
    tier: "bronze",
    amount: "$10/month",
    message: "Helps organize our study sessions",
    joinDate: "2024-02-15",
    bmcId: "bmc_123460",
  },
  {
    id: "6",
    name: "Music Lovers",
    tier: "bronze",
    amount: "$10/month",
    joinDate: "2024-02-20",
    bmcId: "bmc_123461",
  },
  {
    id: "7",
    name: "Anonymous Supporter",
    tier: "supporter",
    amount: "$5/month",
    joinDate: "2024-03-01",
    isAnonymous: true,
    bmcId: "bmc_123462",
  },
  {
    id: "8",
    name: "Community Helper",
    tier: "supporter",
    amount: "$5/month",
    joinDate: "2024-03-05",
    bmcId: "bmc_123463",
  },
];

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

// In a real app, you would have functions like:
/*
export async function fetchSponsorsFromBMC(): Promise<Sponsor[]> {
  const response = await fetch('https://developers.buymeacoffee.com/api/v1/supporters', {
    headers: {
      'Authorization': `Bearer ${process.env.BMC_API_KEY}`,
    },
  });
  
  const data = await response.json();
  
  return data.data.map((supporter: {
    id: string;
    supporter_name?: string;
    support_coffee_price: number;
    support_note?: string;
    created_on: string;
  }) => ({
    id: supporter.id,
    name: supporter.supporter_name || 'Anonymous',
    tier: getTierFromAmount(supporter.support_coffee_price),
    amount: formatAmount(supporter.support_coffee_price),
    message: supporter.support_note,
    joinDate: supporter.created_on,
    isAnonymous: !supporter.supporter_name,
    bmcId: supporter.id,
  }));
}
*/

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
