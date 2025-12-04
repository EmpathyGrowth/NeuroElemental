import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/supabase';
import { logger } from '@/lib/logging';

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
    const { error } = await (this.supabase as any)
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
    const { error } = await (this.supabase as any)
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
    const { data, error } = await (this.supabase as any)
      .from('notifications')
      .insert(notification)
      .select()
      .single() as { data: Notification | null; error: Error | null };

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

