"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  src?: string | null;
  fallbackText?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export function ProfileAvatar({
  src,
  fallbackText = "U",
  onClick,
  className,
  ariaLabel = "User Profile Menu",
}: ProfileAvatarProps) {
  const defaultFallback = fallbackText.trim() ? fallbackText.trim().substring(0, 2).toUpperCase() : "U";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200 ease-out hover:scale-105 active:scale-95 group",
        "w-[36px] h-[36px] md:w-[40px] md:h-[40px] lg:w-[44px] lg:h-[44px]",
        onClick ? "cursor-pointer" : "cursor-default",
        className
      )}
      aria-haspopup={onClick ? "true" : undefined}
      aria-label={ariaLabel}
    >
      <Avatar className="w-full h-full rounded-xl border border-white/10 group-hover:border-white/20 transition-colors duration-200">
        <AvatarImage
          src={src || undefined}
          alt={fallbackText}
          className="object-cover w-full h-full"
        />
        <AvatarFallback className="w-full h-full flex items-center justify-center text-xs font-black bg-blue-600 text-white select-none rounded-xl">
          {defaultFallback}
        </AvatarFallback>
      </Avatar>
    </button>
  );
}
