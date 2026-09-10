import { Audiowide, Inter, Orbitron, Rajdhani } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["sans-serif"],
});

export const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
  fallback: ["sans-serif"],
});

export const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  fallback: ["sans-serif"],
});
