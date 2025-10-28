import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  notification_id: string | number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  related_type?: string;
  related_id?: string | number;
}

export default function OrganizationNotificationDropdown({ isOpen, onClose }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("organization_token");
      const res = await fetch("/api/organization/policies/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    try {
      const token = localStorage.getItem("organization_token");
      await fetch(`/api/organization/policies/notifications/${notification.notification_id}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update local state to mark as read
      setNotifications(prev => 
        prev.map(n => 
          n.notification_id === notification.notification_id 
            ? { ...n, is_read: true } 
            : n
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }

    // Redirect to policy page if related to a policy
    if (notification.related_type === 'policy_proposal' && notification.related_id) {
      window.location.href = `/organization/policies/vote/${notification.related_id}`;
    } else if (notification.related_type && notification.related_id) {
      window.location.href = `/organization/policies/vote/${notification.related_id}`;
    }
  };

  const getIcon = (title: string) => {
    if (title.includes('Policy') && title.includes('Proposal')) {
      return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' };
    }
    if (title.includes('Approved')) {
      return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
    }
    return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 z-50">
      <Card className="shadow-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                Mark all read
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No notifications</div>
          ) : (
            notifications.map((notification) => {
              const iconData = getIcon(notification.title);
              const IconComponent = iconData.icon;
              return (
                <div
                  key={notification.notification_id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${iconData.bg}`}>
                      <IconComponent className={`h-4 w-4 ${iconData.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                          <p className="text-gray-400 text-xs mt-2">{getTimeAgo(notification.created_at)}</p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 ml-2"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            View All Notifications
          </Button>
        </div>
      </Card>
    </div>
  );
}