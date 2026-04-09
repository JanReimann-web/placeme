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
  const [uploadProgress, setUploadProgress] = useState<{
    uploadedCount: number;
    totalCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (!user || !fileList?.length) {
      return;
    }

    setUploading(true);
    setUploadProgress({
      uploadedCount: 0,
      totalCount: fileList.length,
    });
    setError(null);

    try {
      await uploadProfilePhotos(
        user.uid,
        profileId,
        Array.from(fileList),
        (uploadedCount, totalCount) => {
          setUploadProgress({ uploadedCount, totalCount });
        },
      );
      onUploaded?.();
      event.target.value = "";
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="travel-panel rounded-[30px] border border-dashed border-[var(--line-strong)] p-5 sm:rounded-[32px] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent-sea)]">
            Upload reference photos
          </p>
          <h3 className="mt-3 text-[1.75rem] font-semibold text-[var(--ink-strong)] sm:text-2xl">
            Grow this profile&apos;s travel identity base
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Aim for at least 8 strong images with varied angles and lighting.
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            You can add several photos at once and continue refining tags later.
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
        <label className="premium-pressable premium-action inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto sm:min-w-[220px]">
          <ImagePlus className="h-4 w-4" />
          {uploading
            ? uploadProgress
              ? `Uploading ${uploadProgress.uploadedCount}/${uploadProgress.totalCount}`
              : "Uploading..."
            : "Choose photos"}
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
      {uploading && uploadProgress ? (
        <div className="mt-4 rounded-[22px] border border-[var(--line-soft)] bg-[var(--surface-subtle)] p-4">
          <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
            <span>Upload progress</span>
            <span>
              {uploadProgress.uploadedCount}/{uploadProgress.totalCount}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-base)]">
            <div
              className="h-full rounded-full bg-[var(--accent-deep)] transition-[width] duration-300"
              style={{
                width: `${(uploadProgress.uploadedCount / uploadProgress.totalCount) * 100}%`,
              }}
            />
          </div>
        </div>
      ) : null}
      {error ? (
        <div className="mt-5 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      ) : null}
    </div>
  );
}
