'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCheck, Trash2, Loader2, ExternalLink, RefreshCw, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement' | 'course' | 'system';
  read: boolean;
  action_url?: string;
  created_at: string;
}

interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      if (filter === 'unread') {
        params.append('unread', 'true');
      }

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data: NotificationResponse = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setPagination(data.pagination);
      }
    } catch (error) {
      logger.error('Failed to fetch notifications', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filter, pagination.limit, pagination.offset]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    setMarkingRead(notificationId);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success('Notification marked as read');
      }
    } catch (error) {
      logger.error('Failed to mark notification as read', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to update notification');
    } finally {
      setMarkingRead(null);
    }
  };

  const markAllAsRead = async () => {
    setMarkingRead('all');
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      logger.error('Failed to mark all as read', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to update notifications');
    } finally {
      setMarkingRead(null);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setDeletingId(notificationId);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const deletedNotification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        toast.success('Notification deleted');
      }
    } catch (error) {
      logger.error('Failed to delete notification', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'achievement':
        return '🏆';
      case 'course':
        return '📚';
      case 'system':
        return '⚙️';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-amber-500';
      case 'error':
        return 'border-l-red-500';
      case 'achievement':
        return 'border-l-purple-500';
      case 'course':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-muted-foreground">
          Stay updated on your courses, achievements, and more
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Your Notifications
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {pagination.total} total notifications
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(value: 'all' | 'unread') => setFilter(value)}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchNotifications} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={markingRead === 'all'}
              >
                {markingRead === 'all' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCheck className="h-4 w-4 mr-2" />
                )}
                Mark all read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground/70">
                {filter === 'unread' ? 'You have no unread notifications' : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border hover:bg-accent/50 transition-colors ${
                    !notification.read ? 'bg-primary/5 border-primary/20' : 'border-border'
                  } border-l-4 ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex gap-4">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              disabled={markingRead === notification.id}
                              title="Mark as read"
                            >
                              {markingRead === notification.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                            disabled={deletingId === notification.id}
                            title="Delete notification"
                          >
                            {deletingId === notification.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground/70">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {notification.action_url && (
                          <Link
                            href={notification.action_url}
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                            onClick={() => {
                              if (!notification.read) {
                                markAsRead(notification.id);
                              }
                            }}
                          >
                            View details
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {pagination.hasMore && (
                <div className="pt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setPagination((prev) => ({
                      ...prev,
                      offset: prev.offset + prev.limit,
                    }))}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
