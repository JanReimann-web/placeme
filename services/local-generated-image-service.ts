"use client";

import type { GeneratedImage } from "@/types/domain";

const DB_NAME = "placeme-local-generated-images";
const DB_VERSION = 1;
const IMAGE_STORE = "images";
const CHANGE_EVENT = "placeme-local-generated-images-changed";

interface LocalGeneratedImageRecord extends Omit<GeneratedImage, "imageURL"> {
  imageBlob?: Blob;
  imageURL?: string;
  importedAt: string;
}

function openLocalImageDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        const store = db.createObjectStore(IMAGE_STORE, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
        store.createIndex("jobId", "jobId", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function closeDb(db: IDBDatabase) {
  db.close();
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function emitLocalImageChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeLocalGeneratedImageChanges(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

async function fetchImageBlob(imageURL: string) {
  try {
    const response = await fetch(imageURL, { cache: "force-cache" });

    if (!response.ok) {
      return null;
    }

    return await response.blob();
  } catch {
    return null;
  }
}

function toGeneratedImage(record: LocalGeneratedImageRecord): GeneratedImage {
  return {
    id: record.id,
    userId: record.userId,
    jobId: record.jobId,
    sceneKey: record.sceneKey,
    imageURL: record.imageBlob
      ? URL.createObjectURL(record.imageBlob)
      : (record.imageURL ?? ""),
    storagePath: record.storagePath,
    createdAt: record.createdAt,
  };
}

export async function saveGeneratedImageLocally(image: GeneratedImage) {
  const db = await openLocalImageDb();

  try {
    const readTransaction = db.transaction(IMAGE_STORE, "readonly");
    const readStore = readTransaction.objectStore(IMAGE_STORE);
    const existing = await requestToPromise<LocalGeneratedImageRecord | undefined>(
      readStore.get(image.id),
    );

    if (existing?.imageBlob && existing.imageURL === image.imageURL) {
      return;
    }

    const imageBlob = await fetchImageBlob(image.imageURL);
    const record: LocalGeneratedImageRecord = {
      ...image,
      imageURL: image.imageURL,
      imageBlob: imageBlob ?? existing?.imageBlob,
      importedAt: new Date().toISOString(),
    };
    const writeTransaction = db.transaction(IMAGE_STORE, "readwrite");
    const writeStore = writeTransaction.objectStore(IMAGE_STORE);

    await requestToPromise(writeStore.put(record));
    emitLocalImageChange();
  } finally {
    closeDb(db);
  }
}

export async function saveGeneratedImagesLocally(images: GeneratedImage[]) {
  for (const image of images) {
    await saveGeneratedImageLocally(image);
  }
}

export async function listLocalGeneratedImages(userId: string) {
  const db = await openLocalImageDb();

  try {
    const transaction = db.transaction(IMAGE_STORE, "readonly");
    const store = transaction.objectStore(IMAGE_STORE);
    const index = store.index("userId");
    const records = await requestToPromise<LocalGeneratedImageRecord[]>(
      index.getAll(userId),
    );

    return records
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(toGeneratedImage);
  } finally {
    closeDb(db);
  }
}

export async function listLocalJobImages(userId: string, jobId: string) {
  const images = await listLocalGeneratedImages(userId);
  return images
    .filter((image) => image.jobId === jobId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function deleteLocalGeneratedImage(userId: string, imageId: string) {
  const db = await openLocalImageDb();

  try {
    const transaction = db.transaction(IMAGE_STORE, "readwrite");
    const store = transaction.objectStore(IMAGE_STORE);
    const existing = await requestToPromise<LocalGeneratedImageRecord | undefined>(
      store.get(imageId),
    );

    if (existing?.userId !== userId) {
      return;
    }

    await requestToPromise(store.delete(imageId));
    emitLocalImageChange();
  } finally {
    closeDb(db);
  }
}
