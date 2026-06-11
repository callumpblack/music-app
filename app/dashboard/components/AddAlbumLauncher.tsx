"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddAlbumModal from "./AddAlbumModal";
import Toast, { ToastMessage } from "./Toast";

interface AddAlbumLauncherProps {
  className?: string;
  label?: string;
}

/** Self-contained "Add album" button + modal, for use outside the library page. */
export default function AddAlbumLauncher({
  className,
  label = "Add an album",
}: AddAlbumLauncherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          "inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-black/30 transition-colors duration-200 hover:bg-primary-deep"
        }
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5" aria-hidden="true">
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
        {label}
      </button>

      {open && (
        <AddAlbumModal
          existing={null}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            setToast({ text: "Album added to your library!", kind: "success" });
            // Re-run the server component so "recent activity" reflects the new album
            router.refresh();
          }}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
