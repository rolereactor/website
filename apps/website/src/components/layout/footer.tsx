"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { links } from "@/constants/links";
import { Heart } from "lucide-react";

export function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="border-t border-gray-800/50 py-12 px-4 bg-gray-950/90 backdrop-blur-md">
      <div>
        <div className="max-w-(--spacing-fd-container) mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* Brand */}
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Image
                src="/logo.png"
                width={42}
                height={42}
                alt="Role Reactor Logo"
              />
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-500 rounded-lg blur-md opacity-20 scale-110"></div>
            </div>
            <div>
              <span className="font-semibold text-(--color-fd-foreground)">
                Role Reactor
              </span>
              <div className="text-xs text-gray-400">Discord Bot</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-6 text-sm">
            <Link
              href="/docs"
              className="text-gray-400 hover:text-(--color-fd-foreground) transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-(--color-fd-foreground) transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-(--color-fd-foreground) transition-colors"
            >
              Terms of Use
            </Link>
            <Link
              href="/contact"
              className="text-gray-400 hover:text-(--color-fd-foreground) transition-colors"
            >
              Contact
            </Link>
            <Link
              href={links.support}
              className="text-gray-400 hover:text-(--color-fd-foreground) transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Support
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex items-center justify-center mt-8 pt-8 border-t border-gray-800/50 text-center text-xs text-gray-400">
          <span>
            © {mounted ? new Date().getFullYear() : 2025} Role Reactor. Built
            with{" "}
          </span>
          <Heart className="text-pink-500 w-4 h-4 mx-1" /> by
          <Link
            href={links.author.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 font-medium transition-all duration-200 mx-1"
          >
            Role Reactor
          </Link>
        </div>
      </div>
    </footer>
  );
}
