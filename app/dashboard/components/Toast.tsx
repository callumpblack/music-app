"use client";

import { useEffect } from "react";

export interface ToastMessage {
  text: string;
  kind: "success" | "error";
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role="status"
      className={`animate-fade-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-xl ${
        toast.kind === "success" ? "bg-mint" : "bg-primary"
      }`}
    >
      {toast.text}
    </div>
  );
}
