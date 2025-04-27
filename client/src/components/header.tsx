"use client";

import * as React from "react";
import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "./mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface HeaderProps {
  isLoggedIn?: boolean;
  userDisplayName?: string;
  userAvatar?: string;
}

export function Header({ isLoggedIn = false, userDisplayName, userAvatar }: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Features", href: "/features" },
  ];

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
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
    } else if (href === "/") {
      e.preventDefault();
      if (window.location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/");
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center px-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center space-x-2">
          <Globe className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Langlobe</span>
        </Link>

        <nav className="ml-auto hidden space-x-4 md:flex">
          {navigation.map((item) => (
            <Button key={item.name} variant="ghost" asChild>
              <Link href={item.href} onClick={item.name === "Features" || item.name === "About" || item.name === "Home" ? handleNavClick(item.href) : undefined}>{item.name}</Link>
            </Button>
          ))}
        </nav>

        <div className="ml-auto md:ml-4 flex items-center space-x-2">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userAvatar} alt={userDisplayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userDisplayName?.slice(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/debates">My Debates</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/friends">Friends</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <ModeToggle className="hidden md:flex" />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex justify-between items-center">
                <Link
                  href="/"
                  className="flex items-center space-x-2"
                  onClick={() => setOpen(false)}
                >
                  <Globe className="h-6 w-6 text-primary" />
                  <span className="font-bold">Langlobe</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="mt-8 flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    asChild
                    className="justify-start"
                    onClick={item.name === "Features" || item.name === "About" || item.name === "Home" ? handleNavClick(item.href) : () => setOpen(false)}
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </Button>
                ))}
                {!isLoggedIn && (
                  <>
                    <Button
                      variant="ghost"
                      asChild
                      className="justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button
                      asChild
                      className="justify-start"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
