import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url?: string;
  created_at: string;
}

/** Notification insert type */
type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;

/** Notification update type */
interface NotificationUpdate {
  read?: boolean;
}

class NotificationManager {
  private supabase: SupabaseClient<Database> = createClient();
  private channel: RealtimeChannel | null = null;
  private listeners: Map<string, (notification: Notification) => void> = new Map();

  initialize(userId: string) {
    if (this.channel) {
      this.cleanup();
    }

    // Subscribe to notifications for this user
    this.channel = this.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          if (payload.new) {
            this.handleNewNotification(payload.new as Notification);
          }
        }
      )
      .subscribe();

    // Also subscribe to broadcasts for instant notifications
    this.channel?.on('broadcast', { event: 'notification' }, ({ payload }) => {
      if (payload.user_id === userId) {
        this.handleNewNotification(payload as Notification);
      }
    });
  }

  private handleNewNotification(notification: Notification) {
    // Show browser notification if permission granted
    this.showBrowserNotification(notification);

    // Notify all listeners
    this.listeners.forEach(listener => {
      listener(notification);
    });
  }

  private async showBrowserNotification(notification: Notification) {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: notification.id,
        requireInteraction: notification.type === 'error' || notification.type === 'warning',
      });
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      logger.info('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  subscribe(id: string, callback: (notification: Notification) => void) {
    this.listeners.set(id, callback);
    return () => this.listeners.delete(id);
  }

  async getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching notifications:', error as Error);
      return [];
    }

    return (data as unknown as Notification[]) || [];
  }

  async markAsRead(notificationId: string) {
    const update: NotificationUpdate = { read: true };
    const { error } = await this.supabase
      .from('notifications')
      .update(update)
      .eq('id', notificationId);

    if (error) {
      logger.error('Error marking notification as read:', error as Error);
      return false;
    }

    return true;
  }

  async markAllAsRead(userId: string) {
    const update: NotificationUpdate = { read: true };
    const { error } = await this.supabase
      .from('notifications')
      .update(update)
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      logger.error('Error marking all notifications as read:', error as Error);
      return false;
    }

    return true;
  }

  async deleteNotification(notificationId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      logger.error('Error deleting notification:', error as Error);
      return false;
    }

    return true;
  }

  async sendNotification(notification: NotificationInsert) {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      logger.error('Error sending notification:', error as Error);
      return null;
    }

    // Also broadcast for instant delivery
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'notification',
        payload: data,
      });
    }

    return data;
  }

  cleanup() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();

// Helper hooks for React components
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      const userId = getCurrentUserId(); // Implement this based on your auth
      if (!userId) return;

      const data = await notificationManager.getNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);

      // Subscribe to new notifications
      const unsubscribe = notificationManager.subscribe('hook', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        if (!notification.read) {
          setUnreadCount(prev => prev + 1);
        }
      });

      return unsubscribe;
    };

    loadNotifications();
  }, []);

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
    const userId = getCurrentUserId();
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
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logging';

function getCurrentUserId(): string | null {
  // This should be implemented based on your auth system
  // For now, returning null
  return null;
}

