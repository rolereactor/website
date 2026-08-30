"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Showcase } from "@/components/ui/showcase";
import { Separator } from "@/components/ui/separator";
import { Terminal, Database, Shield } from "lucide-react";

export default function TabsTestPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-widest uppercase italic font-audiowide">
          Neural Layers
        </h1>
        <p className="text-zinc-400 max-w-3xl font-mono text-sm uppercase tracking-tight">
          {"//"} Multi-channel data stream multiplexer.
        </p>
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Showcase
          title="System Config"
          description="Encapsulated settings modules."
        >
          <Tabs defaultValue="account" className="w-full max-w-100">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-950/60 border border-white/10 rounded-xl p-1">
              <TabsTrigger
                value="account"
                className="font-mono text-[10px] uppercase"
              >
                Channel_01
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="font-mono text-[10px] uppercase"
              >
                Channel_02
              </TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card className="rounded-2xl border-white/5 bg-zinc-950/40">
                <CardHeader>
                  <CardTitle className="font-audiowide text-white uppercase text-md">
                    Bio-Metric Data
                  </CardTitle>
                  <CardDescription className="font-mono text-[10px] uppercase">
                    Modify local host parameters.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="font-mono text-[10px] uppercase text-zinc-500"
                    >
                      Host identity
                    </Label>
                    <Input
                      id="name"
                      defaultValue="Pedro Duarte"
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="username"
                      className="font-mono text-[10px] uppercase text-zinc-500"
                    >
                      Node_Alias
                    </Label>
                    <Input
                      id="username"
                      defaultValue="@peduarte"
                      className="font-mono text-xs"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="neon"
                    className="font-mono text-[10px] uppercase"
                  >
                    Initialize Sync
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card className="rounded-2xl border-white/5 bg-zinc-950/40">
                <CardHeader>
                  <CardTitle className="font-audiowide text-white uppercase text-md">
                    Access Cipher
                  </CardTitle>
                  <CardDescription className="font-mono text-[10px] uppercase">
                    Update encryption protocols.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="current"
                      className="font-mono text-[10px] uppercase text-zinc-500"
                    >
                      Legacy Hash
                    </Label>
                    <Input
                      id="current"
                      type="password"
                      placeholder="••••••••"
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="new"
                      className="font-mono text-[10px] uppercase text-zinc-500"
                    >
                      New Protocol
                    </Label>
                    <Input
                      id="new"
                      type="password"
                      placeholder="Keygen_v2..."
                      className="font-mono text-xs"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="neon"
                    className="font-mono text-[10px] uppercase"
                  >
                    Commit Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </Showcase>

        <Showcase
          title="Data Streams"
          description="Visual separation for telemetry types."
        >
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-transparent border-b border-white/10 w-full justify-start rounded-none h-auto p-0 mb-6">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent font-mono text-[10px] uppercase px-6 pb-3 pt-0"
              >
                Broadcast
              </TabsTrigger>
              <TabsTrigger
                value="secure"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent font-mono text-[10px] uppercase px-6 pb-3 pt-0"
              >
                Encrypted
              </TabsTrigger>
              <TabsTrigger
                value="raw"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent font-mono text-[10px] uppercase px-6 pb-3 pt-0"
              >
                Kernel_Raw
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <div className="p-4 border border-white/5 bg-zinc-950/40 rounded-xl flex items-center gap-4">
                <Terminal className="h-4 w-4 text-cyan-500" />
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                  Uplink established. Heartbeat detected.
                </span>
              </div>
            </TabsContent>
            <TabsContent value="secure" className="space-y-4">
              <div className="p-4 border border-purple-500/20 bg-purple-500/5 rounded-xl flex items-center gap-4">
                <Shield className="h-4 w-4 text-purple-400" />
                <span className="font-mono text-[10px] text-purple-300 uppercase tracking-widest">
                  End-to-end neural tunnel active.
                </span>
              </div>
            </TabsContent>
            <TabsContent value="raw" className="space-y-4">
              <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl flex items-center gap-4">
                <Database className="h-4 w-4 text-amber-500" />
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest">
                  0x9F FF 02 1A - Memory dump initiated.
                </span>
              </div>
            </TabsContent>
          </Tabs>
        </Showcase>
      </div>
    </div>
  );
}
