import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Users, Trophy, Rocket, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { readCodeFile } from "@/lib/code-reader";

export default async function CardShowcase() {
  const cardSource = await readCodeFile("src/components/ui/card.tsx");
  const pageSource = await readCodeFile("src/app/dashboard/test/card/page.tsx");

  return (
    <div className="container mx-auto p-8 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white">Card Component</h1>
        <p className="text-zinc-400 text-lg">
          A versatile cyberpunk card component with multiple variants for
          different use cases.
        </p>
      </div>

      {/* Default Variant */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Default Variant
          </h2>
          <p className="text-zinc-400 text-sm">
            The standard card with subtle hover effects and backdrop blur.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>
                This is the default card variant with hover effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-300">
                Perfect for general content display with a clean, modern look.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Another Example</CardTitle>
              <CardDescription>
                Cards automatically adapt to their content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                >
                  Feature
                </Badge>
                <p className="text-zinc-300 text-sm">
                  Use badges and other components inside cards seamlessly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stat Variant */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Stat Variant</h2>
          <p className="text-zinc-400 text-sm">
            Designed for displaying statistics and metrics with icons.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Total Members",
              value: "1,234",
              icon: Users,
              trend: "+12 this week",
              color: "cyan",
            },
            {
              label: "Server Boosts",
              value: "42",
              icon: Rocket,
              trend: "Level 3",
              color: "fuchsia",
            },
            {
              label: "XP Earned",
              value: "98,765",
              icon: Trophy,
              trend: "+2.5k today",
              color: "amber",
            },
          ].map((stat, i) => (
            <Card key={i} variant="stat" className="group">
              <div
                className={cn(
                  "absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity",
                  stat.color === "cyan"
                    ? "text-cyan-500"
                    : stat.color === "fuchsia"
                      ? "text-fuchsia-500"
                      : "text-amber-500"
                )}
              >
                <stat.icon className="w-24 h-24 -mt-6 -mr-6 rotate-12" />
              </div>

              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      "p-2.5 rounded-md bg-linear-to-br border border-white/5 shadow-inner",
                      stat.color === "cyan"
                        ? "from-cyan-500/20 to-blue-500/20 text-cyan-400"
                        : stat.color === "fuchsia"
                          ? "from-fuchsia-500/20 to-pink-500/20 text-fuchsia-400"
                          : "from-amber-500/20 to-orange-500/20 text-amber-400"
                    )}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-none",
                      stat.color === "cyan"
                        ? "text-cyan-400 bg-cyan-500/10"
                        : stat.color === "fuchsia"
                          ? "text-fuchsia-400 bg-fuchsia-500/10"
                          : "text-amber-400 bg-amber-500/10"
                    )}
                  >
                    {stat.trend}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <h3 className="text-3xl font-black tabular-nums tracking-tight text-white">
                    {stat.value}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Feature Variant */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Feature Variant
          </h2>
          <p className="text-zinc-400 text-sm">
            Perfect for showcasing features or modules with icons.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: "XP & Levels",
              desc: "Gamification system with rewards",
              icon: Trophy,
              color: "amber",
            },
            {
              name: "Analytics",
              desc: "Server growth and insights",
              icon: TrendingUp,
              color: "cyan",
            },
            {
              name: "Reaction Roles",
              desc: "Self-service role assignment",
              icon: Users,
              color: "fuchsia",
            },
            {
              name: "Boosts",
              desc: "Server boost tracking",
              icon: Rocket,
              color: "emerald",
            },
          ].map((module, i) => (
            <Card
              key={i}
              variant="feature"
              className="group hover:scale-[1.02]"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 relative z-10">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform",
                      module.color === "amber"
                        ? "bg-amber-500/10 text-amber-500"
                        : module.color === "cyan"
                          ? "bg-cyan-500/10 text-cyan-500"
                          : module.color === "emerald"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-fuchsia-500/10 text-fuchsia-500"
                    )}
                  >
                    <module.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {module.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {module.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          ))}
        </div>
      </section>

      {/* Glass Variant */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Glass Variant</h2>
          <p className="text-zinc-400 text-sm">
            Enhanced backdrop blur with consistent cyberpunk styling.
          </p>
        </div>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="text-emerald-500 w-5 h-5" />
              Server Growth Insights
            </CardTitle>
            <CardDescription>Last 14 Days • Joins vs Leaves</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-50 flex items-center justify-center bg-zinc-950/40 rounded-md border border-white/5">
              <p className="text-zinc-500 text-sm">
                Chart or detailed content goes here
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
              <span className="text-[11px] text-zinc-300 font-black uppercase tracking-wider">
                Joins
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.4)]" />
              <span className="text-[11px] text-zinc-300 font-black uppercase tracking-wider">
                Leaves
              </span>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* Source Code */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Components</h2>
          <p className="text-zinc-400 text-sm mb-4">
            Source code for the Card component.
          </p>
        </div>
        <CodeBlock
          title="src/components/ui/card.tsx"
          language="tsx"
          showLineNumbers
          code={cardSource}
          collapsible
          defaultExpanded={false}
        />
      </section>

      {/* Usage Examples */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Usage</h2>
          <p className="text-zinc-400 text-sm mb-4">
            How this page uses the Card component.
          </p>
        </div>
        <CodeBlock
          title="src/app/dashboard/test/card/page.tsx"
          language="tsx"
          showLineNumbers
          code={pageSource}
          collapsible
          defaultExpanded={false}
        />
      </section>
    </div>
  );
}
