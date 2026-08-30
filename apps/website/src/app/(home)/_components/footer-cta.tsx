"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FaDiscord, FaRocket } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { links } from "@/constants/links";

export function FooterCTA() {
  return (
    <section className="py-20 sm:py-28 px-4 relative">
      <div className="max-w-3xl mx-auto relative z-10 text-center">
        {/* Glow effect behind */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-base sm:text-lg text-zinc-500 max-w-lg mx-auto mb-10">
            Add Role Reactor to your server in under a minute. Free forever, no
            credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative group">
              {/* Animated glow behind Discord button */}
              <div className="absolute -inset-1 bg-[#5865F2]/20 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-500 animate-pulse" />
              <Button
                asChild
                size="lg"
                variant="discord"
                className="relative h-13 px-10 min-w-52 text-sm"
              >
                <Link
                  href={links.inviteBot}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaDiscord size={20} />
                  <span>Add to Discord</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="group h-13 px-10 min-w-52 text-sm"
            >
              <Link href="/docs">
                <FaRocket className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
                <span>Read the Docs</span>
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
