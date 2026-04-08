import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "@/firebase/firestore";
import { toIsoString } from "@/lib/utils";
import type { AppNotification } from "@/types/domain";

function normalizeNotificationStatus(
  value: unknown,
): AppNotification["status"] {
  return value === "read" ? "read" : "unread";
}

function normalizeNotificationKind(value: unknown): AppNotification["kind"] {
  return value === "generation-failed"
    ? "generation-failed"
    : "generation-complete";
}

function mapNotification(
  id: string,
  data: Record<string, unknown>,
): AppNotification {
  return {
    id,
    userId: String(data.userId ?? ""),
    kind: normalizeNotificationKind(data.kind),
    title: String(data.title ?? "PlaceMe update"),
    body: String(data.body ?? ""),
    href: data.href ? String(data.href) : null,
    jobId: data.jobId ? String(data.jobId) : null,
    status: normalizeNotificationStatus(data.status),
    createdAt: toIsoString(data.createdAt),
    readAt: data.readAt ? toIsoString(data.readAt) : null,
  };
}

export function subscribeNotifications(
  userId: string,
  onData: (notifications: AppNotification[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const db = getFirestoreDb();
  const notificationsQuery = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      onData(
        snapshot.docs.map((item) =>
          mapNotification(item.id, item.data() as Record<string, unknown>),
        ),
      );
    },
    (error) => onError(error),
  );
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
) {
  const db = getFirestoreDb();

  await updateDoc(doc(db, "notifications", notificationId), {
    userId,
    status: "read",
    readAt: serverTimestamp(),
  });
}

export async function markNotificationsRead(
  notificationIds: string[],
  userId: string,
) {
  if (!notificationIds.length) {
    return;
  }

  const db = getFirestoreDb();
  const batch = writeBatch(db);

  for (const notificationId of notificationIds) {
    batch.update(doc(db, "notifications", notificationId), {
      userId,
      status: "read",
      readAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function deleteNotification(notificationId: string) {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, "notifications", notificationId));
}

export async function upsertNotificationDevice({
  userId,
  deviceId,
  token,
  permission,
  notificationsEnabled,
}: {
  userId: string;
  deviceId: string;
  token: string | null;
  permission: NotificationPermission;
  notificationsEnabled: boolean;
}) {
  const db = getFirestoreDb();
  const deviceRef = doc(db, "notificationDevices", deviceId);

  await setDoc(
    deviceRef,
    {
      id: deviceId,
      userId,
      token,
      permission,
      notificationsEnabled,
      platform: "web",
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}
