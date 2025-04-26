"use client";

import type React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  isLoggedIn?: boolean;
  userDisplayName?: string;
  userAvatar?: string;
}

export function MainLayout({
  children,
  hideFooter = false,
  isLoggedIn = false,
  userDisplayName,
  userAvatar,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        isLoggedIn={isLoggedIn}
        userDisplayName={userDisplayName}
        userAvatar={userAvatar}
      />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
