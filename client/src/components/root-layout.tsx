"use client";

import type React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <div className={`container px-4 md:px-6 lg:px-8 mx-auto ${className}`}>
      {children}
    </div>
  );
}
