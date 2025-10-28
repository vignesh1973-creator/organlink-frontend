import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "security" | "warning" | "success" | "info";
  time: string;
  read: boolean;
  fullMessage?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real system events from backend
  useEffect(() => {
    const fetchSystemNotifications = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch("/api/admin/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Convert recent activities to notifications
          const activityNotifications: Notification[] = (data.recentActivities || []).map((activity: any, index: number) => {
            const getNotifType = (actType: string): "security" | "warning" | "success" | "info" => {
              if (actType === "hospital_registered") return "success";
              if (actType === "policy_created") return "info";
              if (actType === "system_alert") return "warning";
              return "info";
            };

            const getTimeAgo = (timestamp: string | Date) => {
              const date = new Date(timestamp);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              if (diffMins < 60) return `${diffMins}m ago`;
              const diffHours = Math.floor(diffMins / 60);
              if (diffHours < 24) return `${diffHours}h ago`;
              const diffDays = Math.floor(diffHours / 24);
              return `${diffDays}d ago`;
            };

            return {
              id: index + 1,
              title: activity.title || "System Event",
              message: activity.description || activity.message || "",
              fullMessage: activity.description || activity.message || "",
              type: getNotifType(activity.type),
              time: getTimeAgo(activity.timestamp),
              read: false,
            };
          });

          setNotifications(activityNotifications.slice(0, 10)); // Keep last 10
        }
      } catch (error) {
        console.error("Failed to fetch system notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSystemNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
