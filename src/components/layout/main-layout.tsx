"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export interface MainLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    totalXp?: number;
  } | null;
  sidebarItems?: {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
  }[];
  className?: string;
  showSidebar?: boolean;
}

export function MainLayout({
  children,
  user,
  sidebarItems = [],
  className,
  showSidebar = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={user} />

      <div className="flex">
        {showSidebar && user && sidebarItems.length > 0 && (
          <Sidebar items={sidebarItems} />
        )}

        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)]",
            showSidebar && user && sidebarItems.length > 0
              ? "lg:pl-0"
              : "",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
