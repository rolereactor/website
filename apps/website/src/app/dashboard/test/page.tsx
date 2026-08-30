import Link from "next/link";
import { PageHeader } from "@/app/dashboard/_components/page-header";
import {
  AlertTriangle,
  Beaker,
  Ghost,
  HelpCircle,
  Layers,
  List,
  ListCollapse,
  Menu,
  MessageSquare,
  Minus,
  MousePointerClick,
  PanelRight,
  Square,
  Tag,
  TextCursor,
  ToggleRight,
  Type,
  User,
  UserCircle,
} from "lucide-react";

export default function IndexesPage() {
  const components = [
    {
      title: "Accordion",
      href: "/dashboard/test/accordion",
      icon: ListCollapse,
    },
    { title: "Alert", href: "/dashboard/test/alert", icon: AlertTriangle },
    { title: "Avatar", href: "/dashboard/test/avatar", icon: UserCircle },
    { title: "Badge", href: "/dashboard/test/badge", icon: Tag },
    {
      title: "Button",
      href: "/dashboard/test/button",
      icon: MousePointerClick,
    },
    { title: "Card", href: "/dashboard/test/card", icon: Square },
    { title: "Dialog", href: "/dashboard/test/dialog", icon: MessageSquare },
    {
      title: "Dropdown Menu",
      href: "/dashboard/test/dropdown-menu",
      icon: Menu,
    },
    { title: "Input", href: "/dashboard/test/input", icon: TextCursor },
    { title: "Label", href: "/dashboard/test/label", icon: Type },
    { title: "Select", href: "/dashboard/test/select", icon: List },
    { title: "Separator", href: "/dashboard/test/separator", icon: Minus },
    { title: "Sheet", href: "/dashboard/test/sheet", icon: PanelRight },
    { title: "Skeleton", href: "/dashboard/test/skeleton", icon: Ghost },
    { title: "Switch", href: "/dashboard/test/switch", icon: ToggleRight },
    { title: "Tabs", href: "/dashboard/test/tabs", icon: Layers },
    { title: "Tooltip", href: "/dashboard/test/tooltip", icon: HelpCircle },
    { title: "User Menu", href: "/dashboard/test/user-menu", icon: User },
  ];

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        category="Development"
        categoryIcon={Beaker}
        title="Component Lab"
        description="Neural interface testing grounds for experimental UI modules"
      />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Components</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {components.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="p-4 rounded-2xl border border-white/5 bg-zinc-950/40 backdrop-blur-md hover:bg-white/5 hover:border-cyan-500/30 transition-all group flex flex-col gap-3 items-center justify-center text-center h-32 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <item.icon className="w-8 h-8 text-zinc-500 group-hover:text-cyan-400 transition-all duration-500 z-10 group-hover:scale-110" />
              <span className="font-bold text-zinc-400 group-hover:text-white transition-colors z-10 font-mono text-xs uppercase tracking-widest">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
