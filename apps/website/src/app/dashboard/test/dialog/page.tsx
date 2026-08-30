"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Showcase } from "@/components/ui/showcase";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DialogTestPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-widest uppercase italic font-audiowide">
          Neural Shells
        </h1>
        <p className="text-zinc-400 max-w-3xl font-mono text-sm uppercase tracking-tight">
          {"//"} High-fidelity modal override systems.
        </p>
      </div>

      <Separator className="bg-white/10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Showcase title="Standard UI">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Neural Ident</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription className="font-mono text-[10px] uppercase">
                  Modify bio-metric signature data.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="name"
                    className="text-right font-mono text-xs uppercase text-zinc-500"
                  >
                    Host
                  </Label>
                  <Input
                    id="name"
                    defaultValue="K-749"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="username"
                    className="text-right font-mono text-xs uppercase text-zinc-500"
                  >
                    Alias
                  </Label>
                  <Input
                    id="username"
                    defaultValue="@spectre"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="neon" type="submit">
                  Sync Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Showcase>

        <Showcase
          title="Glitch Protocol"
          description="Emergency override with sensory feedback."
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="glitch">Access Kernel</Button>
            </DialogTrigger>
            <DialogContent variant="glitch" className="sm:max-w-106.25">
              <DialogHeader>
                <DialogTitle variant="glitch" className="font-audiowide italic">
                  KERNEL_ROOT_ACCESS
                </DialogTitle>
                <DialogDescription
                  variant="glitch"
                  className="font-mono uppercase"
                >
                  Authorize critical firmware overwrite.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 space-y-4">
                <Alert variant="glitch">
                  <AlertDescription className="font-mono text-[10px]">
                    WARNING: Core temperature exceeding 140°C.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button
                  variant="destructive-glitch"
                  className="font-mono uppercase text-xs"
                >
                  Abort
                </Button>
                <Button variant="neon" className="font-mono uppercase text-xs">
                  Authorize
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Showcase>
      </div>
    </div>
  );
}
