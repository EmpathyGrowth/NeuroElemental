"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AdminPageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminPageShell({ children, className }: AdminPageShellProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none fixed">
        <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-tl from-blue-500/5 to-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Content */}
      <div
        className={cn(
          "container mx-auto p-6 max-w-7xl relative z-10",
          className
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
