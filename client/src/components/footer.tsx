import Link from "next/link";
import { Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-4 sm:items-start">
            <Link href="/" className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">Langlobe</span>
            </Link>
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              Breaking language barriers with real-time translation for cross-cultural dialogue.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 sm:justify-end">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Product</h3>
              <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Company</h3>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                Blog
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Legal</h3>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
                Cookies
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Langlobe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
