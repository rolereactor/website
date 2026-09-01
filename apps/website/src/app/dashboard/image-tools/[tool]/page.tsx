import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Expand, Shrink, ArrowRightLeft, ImageUpscale } from "lucide-react";

import { ImageToolName } from "@/types/image-tools";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import { ToolNav } from "../_components/tool-nav";
import { ToolPageClient } from "../_components/tool-page-client";

const TOOL_META = {
  resize: {
    label: "Resize",
    description: "Change image dimensions by pixels or percentage",
    icon: Expand,
  },
  compress: {
    label: "Compress",
    description: "Reduce file size while maintaining quality",
    icon: Shrink,
  },
  convert: {
    label: "Convert",
    description: "Convert between JPG, PNG, GIF, and WebP formats",
    icon: ArrowRightLeft,
  },
  upscale: {
    label: "Upscale",
    description: "AI-powered 2× / 4× resolution boost",
    icon: ImageUpscale,
  },
} as const;

const VALID_TOOLS = ImageToolName.options;

interface PageProps {
  params: Promise<{ tool: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tool } = await params;
  const meta = TOOL_META[tool as keyof typeof TOOL_META];
  if (!meta) return { title: "Image Tools" };
  return {
    title: `${meta.label} Image — Image Tools`,
    description: meta.description,
  };
}

export function generateStaticParams() {
  return VALID_TOOLS.map((tool) => ({ tool }));
}

export default async function ToolPage({ params }: PageProps) {
  const { tool } = await params;

  if (!VALID_TOOLS.includes(tool as (typeof VALID_TOOLS)[number])) {
    notFound();
  }

  const validTool = tool as (typeof VALID_TOOLS)[number];
  const meta = TOOL_META[validTool];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        category="Tools & Configuration"
        categoryIcon={meta.icon}
        title={`${meta.label} Image`}
        description={meta.description}
        className="md:flex-col md:items-start xl:flex-row xl:items-end"
      >
        {/* Tool nav pills — align right inside PageHeader */}
        <ToolNav />
      </PageHeader>

      <ToolPageClient tool={validTool} />
    </div>
  );
}
