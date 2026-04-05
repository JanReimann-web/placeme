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
    <div className="rounded-[28px] border border-dashed border-[var(--line-strong)] bg-[var(--surface-subtle)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--ink-strong)]">
            Upload reference photos
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
            Aim for at least 8 strong images with varied angles and lighting.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--surface-dark)] px-5 py-3 text-sm font-semibold text-[var(--surface-base)]">
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
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
