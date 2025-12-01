'use client';

import { useEffect, useState } from 'react';
import { notificationManager, type Notification } from '@/lib/notifications/realtime';
import { logger } from '@/lib/logging';

/**
 * React hook to manage notifications for the current user
 * Provides real-time notification updates and management functions
 *
 * @param userId - The user ID to subscribe to notifications for
 * @returns Notification state and management functions
 */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const data = await notificationManager.getNotifications(userId);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);

        // Initialize realtime subscription
        notificationManager.initialize(userId);

        // Subscribe to new notifications
        unsubscribe = notificationManager.subscribe('hook', (notification) => {
          setNotifications(prev => [notification, ...prev]);
          if (!notification.read) {
            setUnreadCount(prev => prev + 1);
          }
        });
      } catch (error) {
        logger.error('Error loading notifications:', error as Error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      notificationManager.cleanup();
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    const success = await notificationManager.markAsRead(notificationId);
    if (success) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    const success = await notificationManager.markAllAsRead(userId);
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const success = await notificationManager.deleteNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
