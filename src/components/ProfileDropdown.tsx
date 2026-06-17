"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { 
  User as UserIcon, 
  Camera, 
  Settings as SettingsIcon, 
  HardDrive, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to format bytes to human-readable size
const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  email: string | null | undefined;
  onChangePhotoClick: () => void;
  onSignOut: () => void;
  usedStorage: number;
  maxStorage: number;
}

export function ProfileDropdown({
  isOpen,
  onClose,
  profile,
  email,
  onChangePhotoClick,
  onSignOut,
  usedStorage,
  maxStorage,
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const usedPercentage = Math.min((usedStorage / maxStorage) * 100, 100);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on ESC
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute right-0 top-full mt-2 w-72 bg-[#0B1220]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 transition-all duration-200 origin-top-right",
        isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      )}
      role="menu"
      aria-label="Profile options"
    >
      {/* Header Info */}
      <div className="p-3 select-none">
        <p className="text-sm font-bold truncate text-white">
          {profile?.name || "Vault User"}
        </p>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {email || "user@quub.com"}
        </p>
      </div>

      <div className="h-px bg-white/5 my-1.5" />

      {/* Navigation Items */}
      <div className="space-y-1">
        <Link
          href="/profile/me"
          onClick={onClose}
          className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider p-2.5 text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors duration-150"
          role="menuitem"
        >
          <UserIcon className="w-4 h-4 text-gray-400" />
          <span>My Profile</span>
        </Link>

        <button
          onClick={() => {
            onChangePhotoClick();
            onClose();
          }}
          className="w-full flex items-center gap-3 text-xs font-bold uppercase tracking-wider p-2.5 text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors duration-150 text-left"
          role="menuitem"
        >
          <Camera className="w-4 h-4 text-gray-400" />
          <span>Change Profile Photo</span>
        </button>

        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider p-2.5 text-gray-300 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors duration-150"
          role="menuitem"
        >
          <SettingsIcon className="w-4 h-4 text-gray-400" />
          <span>Account Settings</span>
        </Link>
      </div>

      <div className="h-px bg-white/5 my-1.5" />

      {/* Storage Indicator */}
      <div className="p-3 select-none">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" /> Storage Used
          </span>
          <span>{formatBytes(usedStorage)} / {formatBytes(maxStorage)}</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${usedPercentage}%` }}
          />
        </div>
      </div>

      <div className="h-px bg-white/5 my-1.5" />

      {/* Sign Out */}
      <button
        onClick={() => {
          onSignOut();
          onClose();
        }}
        className="w-full flex items-center gap-3 text-xs font-bold uppercase tracking-wider p-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors duration-150 text-left"
        role="menuitem"
      >
        <LogOut className="w-4 h-4 text-rose-500" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
