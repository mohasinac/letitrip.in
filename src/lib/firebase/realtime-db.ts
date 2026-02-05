/**
 * Firebase Realtime Database Helpers
 * 
 * Utilities for real-time data synchronization using Firebase Realtime Database.
 * Perfect for presence detection, live chat, and real-time notifications.
 */

import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  onDisconnect,
  push,
  query,
  orderByChild,
  limitToLast,
  equalTo,
  serverTimestamp,
  DatabaseReference,
  Unsubscribe,
} from 'firebase/database';
import { realtimeDb } from './config';

/**
 * Realtime database paths
 */
export const RTDB_PATHS = {
  PRESENCE: 'presence',
  CHAT: 'chat',
  NOTIFICATIONS: 'notifications',
  LIVE_UPDATES: 'live_updates',
} as const;

/**
 * Set user online presence
 */
export async function setUserPresence(
  userId: string,
  isOnline: boolean,
  additionalData?: Record<string, any>
): Promise<void> {
  const presenceRef = ref(realtimeDb, `${RTDB_PATHS.PRESENCE}/${userId}`);
  
  const presenceData = {
    online: isOnline,
    lastSeen: serverTimestamp(),
    ...additionalData,
  };

  await set(presenceRef, presenceData);

  // Set up disconnect handler
  if (isOnline) {
    onDisconnect(presenceRef).set({
      online: false,
      lastSeen: serverTimestamp(),
      ...additionalData,
    });
  }
}

/**
 * Listen to user presence
 */
export function listenToUserPresence(
  userId: string,
  callback: (presence: { online: boolean; lastSeen: number | null }) => void
): Unsubscribe {
  const presenceRef = ref(realtimeDb, `${RTDB_PATHS.PRESENCE}/${userId}`);
  
  return onValue(presenceRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || { online: false, lastSeen: null });
  });
}

/**
 * Send chat message
 */
export async function sendChatMessage(
  chatId: string,
  userId: string,
  message: string,
  metadata?: Record<string, any>
): Promise<string> {
  const chatRef = ref(realtimeDb, `${RTDB_PATHS.CHAT}/${chatId}/messages`);
  
  const messageData = {
    userId,
    message,
    timestamp: serverTimestamp(),
    ...metadata,
  };

  const newMessageRef = push(chatRef);
  await set(newMessageRef, messageData);
  
  return newMessageRef.key!;
}

/**
 * Listen to chat messages
 */
export function listenToChatMessages(
  chatId: string,
  callback: (messages: Array<{ id: string; userId: string; message: string; timestamp: number }>) => void,
  limit: number = 50
): Unsubscribe {
  const chatRef = ref(realtimeDb, `${RTDB_PATHS.CHAT}/${chatId}/messages`);
  const chatQuery = query(chatRef, orderByChild('timestamp'), limitToLast(limit));
  
  return onValue(chatQuery, (snapshot) => {
    const messages: any[] = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });
    callback(messages);
  });
}

/**
 * Send notification
 */
export async function sendNotification(
  userId: string,
  notification: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    data?: Record<string, any>;
  }
): Promise<void> {
  const notificationsRef = ref(realtimeDb, `${RTDB_PATHS.NOTIFICATIONS}/${userId}`);
  
  const notificationData = {
    ...notification,
    timestamp: serverTimestamp(),
    read: false,
  };

  const newNotificationRef = push(notificationsRef);
  await set(newNotificationRef, notificationData);
}

/**
 * Listen to user notifications
 */
export function listenToNotifications(
  userId: string,
  callback: (notifications: Array<{ id: string; title: string; message: string; read: boolean }>) => void
): Unsubscribe {
  const notificationsRef = ref(realtimeDb, `${RTDB_PATHS.NOTIFICATIONS}/${userId}`);
  const notificationsQuery = query(notificationsRef, orderByChild('timestamp'), limitToLast(20));
  
  return onValue(notificationsQuery, (snapshot) => {
    const notifications: any[] = [];
    snapshot.forEach((childSnapshot) => {
      notifications.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });
    callback(notifications);
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  const notificationRef = ref(realtimeDb, `${RTDB_PATHS.NOTIFICATIONS}/${userId}/${notificationId}`);
  await update(notificationRef, { read: true });
}

/**
 * Send live update
 */
export async function sendLiveUpdate(
  updateType: string,
  data: Record<string, any>
): Promise<void> {
  const updateRef = ref(realtimeDb, `${RTDB_PATHS.LIVE_UPDATES}/${updateType}`);
  
  const updateData = {
    ...data,
    timestamp: serverTimestamp(),
  };

  await set(updateRef, updateData);
}

/**
 * Listen to live updates
 */
export function listenToLiveUpdates(
  updateType: string,
  callback: (data: any) => void
): Unsubscribe {
  const updateRef = ref(realtimeDb, `${RTDB_PATHS.LIVE_UPDATES}/${updateType}`);
  
  return onValue(updateRef, (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Generic write operation
 */
export async function writeData(path: string, data: any): Promise<void> {
  const dataRef = ref(realtimeDb, path);
  await set(dataRef, data);
}

/**
 * Generic read operation
 */
export async function readData(path: string): Promise<any> {
  const dataRef = ref(realtimeDb, path);
  const snapshot = await get(dataRef);
  return snapshot.val();
}

/**
 * Generic update operation
 */
export async function updateData(path: string, updates: Record<string, any>): Promise<void> {
  const dataRef = ref(realtimeDb, path);
  await update(dataRef, updates);
}

/**
 * Generic delete operation
 */
export async function deleteData(path: string): Promise<void> {
  const dataRef = ref(realtimeDb, path);
  await remove(dataRef);
}

/**
 * Generic listener
 */
export function listenToData(
  path: string,
  callback: (data: any) => void
): Unsubscribe {
  const dataRef = ref(realtimeDb, path);
  return onValue(dataRef, (snapshot) => {
    callback(snapshot.val());
  });
}
