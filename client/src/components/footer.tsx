"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export function Footer() {
  const router = useRouter();

  // Handles smooth scroll or navigation for Features and About
  const handleFooterNav = (href: string) => (e: React.MouseEvent) => {
    if (href === "/features" || href === "/#features") {
      e.preventDefault();
      if (window.location.pathname === "/") {
        const el = document.getElementById("features");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        router.push("/#features");
      }
    } else if (href === "/about" || href === "/#about") {
      e.preventDefault();
      if (window.location.pathname === "/") {
        const el = document.getElementById("about");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        router.push("/#about");
      }
    } else if (["/pricing", "/contact", "/terms", "/privacy", "/cookies"].includes(href)) {
      e.preventDefault();
      if (window.location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/");
      }
    }
  };

  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-4 sm:items-start">
            <Link href="/" className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Debatably</span>
            </Link>
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              Breaking language barriers with real-time translation for cross-cultural dialogue.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 sm:justify-end">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Product</h3>
              <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleFooterNav("/features")}>Features</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleFooterNav("/pricing")}>Pricing</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Company</h3>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleFooterNav("/about")}>About</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleFooterNav("/contact")}>Contact</Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Legal</h3>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleFooterNav("/terms")}>Terms</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleFooterNav("/privacy")}>Privacy</Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground" onClick={handleFooterNav("/cookies")}>Cookies</Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Debatably. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
