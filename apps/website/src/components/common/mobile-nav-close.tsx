"use client";

import { useEffect } from "react";

export function MobileNavClose() {
  useEffect(() => {
    const handleCloseMobileNav = () => {
      // Find and click the mobile menu toggle button if it's open
      const toggleBtn = document.querySelector(
        'button[aria-label="Toggle Menu"]'
      ) as HTMLButtonElement | null;

      if (toggleBtn) {
        // Check if the menu is actually open by looking at data attributes
        const isOpen = toggleBtn.getAttribute("data-state") === "open";

        if (isOpen) {
          toggleBtn.click();
        }
      }

      // Force close any open navigation menus in the navbar
      const nav = document.querySelector("#nd-nav");
      if (nav) {
        const openItems = nav.querySelectorAll("[data-state='open']");
        openItems.forEach((item) => {
          if (item instanceof HTMLElement && item.tagName === "BUTTON") {
            item.click();
          }
        });
      }

      // Reset body styles
      document.body.style.overflow = "";
    };

    window.addEventListener("close-mobile-nav", handleCloseMobileNav);
    return () =>
      window.removeEventListener("close-mobile-nav", handleCloseMobileNav);
  }, []);

  return null;
}
