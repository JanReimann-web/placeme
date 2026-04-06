"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { uploadProfilePhotos } from "@/services/profile-service";
import { useAuth } from "@/hooks/use-auth";

export function PhotoUploader({
  profileId,
  onUploaded,
}: {
  profileId: string;
  onUploaded?: () => void;
}) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (!user || !fileList?.length) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadProfilePhotos(user.uid, profileId, Array.from(fileList));
      onUploaded?.();
      event.target.value = "";
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="travel-panel rounded-[32px] border border-dashed border-[var(--line-strong)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-sea)]">
            Upload reference photos
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--ink-strong)]">
            Grow this person&apos;s travel identity base
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Aim for at least 8 strong images with varied angles and lighting.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Front portrait", "Side angles", "Half + full body", "Good lighting"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-[var(--line-soft)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-semibold text-[var(--ink-soft)]"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
        <label className="inline-flex min-w-[220px] cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--surface-dark)] px-5 py-3 text-sm font-semibold text-[var(--surface-base)]">
          <ImagePlus className="h-4 w-4" />
          {uploading ? "Uploading..." : "Choose photos"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleChange}
            disabled={uploading}
          />
        </label>
      </div>
      {error ? (
        <div className="mt-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}
