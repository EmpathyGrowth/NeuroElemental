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

/**
 * NotificationManager - Client-side only notification handling
 * Uses lazy initialization to avoid server-side crashes
 */
class NotificationManager {
  private supabase: SupabaseClient<Database> | null = null;
  private channel: RealtimeChannel | null = null;
  private listeners: Map<string, (notification: Notification) => void> = new Map();
  private isServer = typeof window === 'undefined';

  /**
   * Lazy-load the Supabase client only on client side
   */
  private async getClient(): Promise<SupabaseClient<Database> | null> {
    if (this.isServer) {
      return null;
    }
    if (!this.supabase) {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        this.supabase = createClient();
      } catch {
        console.error('[NotificationManager] Failed to initialize Supabase client');
        return null;
      }
    }
    return this.supabase;
  }

  async initialize(userId: string) {
    if (this.isServer) return;
    
    const client = await this.getClient();
    if (!client) return;

    if (this.channel) {
      this.cleanup();
    }

    // Subscribe to notifications for this user
    this.channel = client
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
    if (this.isServer || !('Notification' in window)) {
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
    if (this.isServer || !('Notification' in window)) {
      console.info('[NotificationManager] Notifications not supported');
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
    const client = await this.getClient();
    if (!client) return [];

    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[NotificationManager] Error fetching notifications:', error.message);
      return [];
    }

    return (data as unknown as Notification[]) || [];
  }

  async markAsRead(notificationId: string) {
    const client = await this.getClient();
    if (!client) return false;

    const update: NotificationUpdate = { read: true };
    const { error } = await (client as any)
      .from('notifications')
      .update(update)
      .eq('id', notificationId);

    if (error) {
      console.error('[NotificationManager] Error marking notification as read:', error.message);
      return false;
    }

    return true;
  }

  async markAllAsRead(userId: string) {
    const client = await this.getClient();
    if (!client) return false;

    const update: NotificationUpdate = { read: true };
    const { error } = await (client as any)
      .from('notifications')
      .update(update)
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('[NotificationManager] Error marking all notifications as read:', error.message);
      return false;
    }

    return true;
  }

  async deleteNotification(notificationId: string) {
    const client = await this.getClient();
    if (!client) return false;

    const { error } = await client
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('[NotificationManager] Error deleting notification:', error.message);
      return false;
    }

    return true;
  }

  async sendNotification(notification: NotificationInsert) {
    const client = await this.getClient();
    
    // On server, just log and return - notifications will be sent via other means
    if (!client) {
      console.log('[NotificationManager] Server-side notification request:', notification.title);
      return null;
    }

    const { data, error } = await (client as any)
      .from('notifications')
      .insert(notification)
      .select()
      .single() as { data: Notification | null; error: Error | null };

    if (error) {
      console.error('[NotificationManager] Error sending notification:', error.message);
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

  async cleanup() {
    const client = await this.getClient();
    if (this.channel && client) {
      client.removeChannel(this.channel);
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager();
