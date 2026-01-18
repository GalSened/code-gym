"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function AuthLayout({ children, title, description, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="font-bold text-2xl text-gray-900 dark:text-white">Code Gym</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div
          className={cn(
            "w-full max-w-md",
            className
          )}
        >
          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="px-8 pb-8">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} Code Gym. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
