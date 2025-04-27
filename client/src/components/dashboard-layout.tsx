"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Home,
  Settings,
  MessageSquare,
  UserCircle,
  Globe,
  BarChart3,
  Menu,
  X,
  LogOut,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "@/lib/auth-context";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, title, isActive, onClick }: NavItemProps) {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}
      >
        {icon}
        <span>{title}</span>
      </div>
    </Link>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    _id: string;
    username: string;
    name: string;
    email: string;
    preferredLanguage: string;
    bio: string;
    location: string;
    avatar: string;
    interests: string[];
    socialLinks: {
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
    rating: number;
    debateStats: {
      won: number;
      lost: number;
      drawn: number;
    };
    createdAt: string;
    lastActive: string;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  const navItems = [
    {
      href: "/dashboard",
      icon: <Home className="h-4 w-4" />,
      title: "Dashboard"
    },
    {
      href: "/dashboard/discover",
      icon: <Globe className="h-4 w-4" />,
      title: "Discover Debates"
    },
    {
      href: "/dashboard/connections",
      icon: <Users className="h-4 w-4" />,
      title: "Connections"
    },
    {
      href: "/dashboard/activity",
      icon: <Activity className="h-4 w-4" />,
      title: "Activity"
    },
    {
      href: "/dashboard/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      title: "Analytics"
    },
    {
      href: "/dashboard/profile",
      icon: <UserCircle className="h-4 w-4" />,
      title: "Profile"
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
      title: "Settings"
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/10">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col p-0">
              <div className="flex items-center border-b px-6 py-4">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
                  <Globe className="h-6 w-6 text-primary" />
                  <span>Langlobe</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 overflow-auto py-4">
                <div className="flex flex-col gap-1 px-3">
                  {navItems.map((item) => (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      title={item.title}
                      isActive={pathname === item.href}
                      onClick={() => setOpen(false)}
                    />
                  ))}
                </div>
              </nav>
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary-foreground">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => logout()}>
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Log out</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Globe className="h-6 w-6 text-primary" />
            <span>Langlobe</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary-foreground">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Desktop sidebar */}
      <div className="hidden h-screen md:flex">
        <aside className="fixed inset-y-0 left-0 w-64 border-r bg-background">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Globe className="h-6 w-6 text-primary" />
              <span>Langlobe</span>
            </Link>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                title={item.title}
                isActive={pathname === item.href}
              />
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t p-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary-foreground">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col truncate">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">User settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="ml-64 flex-1 overflow-y-auto">
          {/* Desktop topbar */}
          <div className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex flex-1 items-center justify-end gap-4">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary-foreground">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Mobile content */}
      <main className="flex-1 overflow-y-auto md:hidden">
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
