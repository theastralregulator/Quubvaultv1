"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Check, Loader2, AlertCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ChangeProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl: string | null | undefined;
  fallbackText: string;
  userId: string;
  onSave: (newPhotoUrl: string) => Promise<void>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = {
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export function ChangeProfilePhotoModal({
  isOpen,
  onClose,
  currentPhotoUrl,
  fallbackText = "U",
  userId,
  onSave,
}: ChangeProfilePhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const defaultFallback = fallbackText.trim() ? fallbackText.trim().substring(0, 2).toUpperCase() : "U";

  // Clean preview URL when modal closes or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setError(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  // Handle keypress events (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isUploading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isUploading]);

  // Handle outside click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isUploading) {
      onClose();
    }
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const reject = rejectedFiles[0];
      if (reject.errors[0]?.code === "file-too-large") {
        setError("File is too large. Max size is 5MB.");
      } else if (reject.errors[0]?.code === "file-invalid-type") {
        setError("Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.");
      } else {
        setError(reject.errors[0]?.message || "Invalid file selected.");
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      
      // Create live object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: SUPPORTED_FORMATS,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select or drop an image first.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Upload to Google Drive
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", userId);

      const response = await fetch("/api/drive/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image to Google Drive.");
      }

      const uploadResult = await response.json();
      if (!uploadResult.driveFileId) {
        throw new Error("No driveFileId returned from upload.");
      }

      // 2. Generate inline downloadable URL
      const newPhotoUrl = `/api/drive/download?driveFileId=${uploadResult.driveFileId}&inline=true`;

      // 3. Save to database / user record
      await onSave(newPhotoUrl);
      
      onClose();
    } catch (err: any) {
      console.error("[Avatar Upload Error]", err);
      setError(err.message || "An error occurred while uploading. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-[#0B1220] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 transition-all duration-300 transform scale-100 flex flex-col gap-5 text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h2 id="modal-title" className="text-base font-bold uppercase tracking-wider text-gray-200">
            Change Profile Photo
          </h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-white rounded-lg p-1 hover:bg-white/5 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Photo Previews */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          {/* Current Photo */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current</span>
            <Avatar className="w-20 h-20 rounded-2xl border border-white/10">
              <AvatarImage src={currentPhotoUrl || undefined} alt="Current profile picture" />
              <AvatarFallback className="text-xl font-black bg-blue-600/20 text-blue-400 rounded-2xl">
                {defaultFallback}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Arrow indicator if a file is selected */}
          {previewUrl && (
            <div className="text-gray-600 rotate-90 sm:rotate-0 font-bold">➔</div>
          )}

          {/* New Preview */}
          {previewUrl && (
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">New Preview</span>
              <Avatar className="w-20 h-20 rounded-2xl border-2 border-blue-500 shadow-lg shadow-blue-500/15">
                <AvatarImage src={previewUrl} alt="New profile picture preview" />
                <AvatarFallback className="text-xl font-black bg-blue-600 text-white rounded-2xl">
                  {defaultFallback}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Drag & Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
            isDragActive
              ? "border-blue-500 bg-blue-500/5"
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Upload photo area"
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-gray-500 mb-2.5" />
          <p className="text-xs font-bold uppercase tracking-wider text-gray-300">
            {isDragActive ? "Drop the photo here" : "Drag & Drop Image"}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
            or click to browse local files
          </p>
          <p className="text-[9px] text-gray-600 mt-3">
            JPG, PNG or WEBP (Max 5MB)
          </p>
        </div>

        {/* Selected File Label */}
        {selectedFile && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate flex-1 font-semibold">{selectedFile.name}</span>
            <span className="text-[10px] text-gray-500 shrink-0">
              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isUploading}
            className="text-xs font-bold uppercase tracking-wider h-10 px-4 rounded-xl border border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="text-xs font-bold uppercase tracking-wider h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 shadow-lg shadow-blue-600/15"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Uploading...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
