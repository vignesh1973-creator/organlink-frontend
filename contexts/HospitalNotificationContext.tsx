import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useHospitalAuth } from "./HospitalAuthContext";

interface HospitalNotification {
  notification_id: string;
  hospital_id: string;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  metadata?: Record<string, any> | string | null;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}

interface HospitalNotificationContextType {
  notifications: HospitalNotification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
}

const HospitalNotificationContext = createContext<
  HospitalNotificationContextType | undefined
>(undefined);

export const useHospitalNotifications = () => {
  const context = useContext(HospitalNotificationContext);
  if (!context) {
    throw new Error(
      "useHospitalNotifications must be used within a HospitalNotificationProvider",
    );
  }
  return context;
};

export const HospitalNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [notifications, setNotifications] = useState<HospitalNotification[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const { hospital } = useHospitalAuth();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (!hospital) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("hospital_token");
      const response = await fetch("/api/hospital/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const normalized = (data.notifications || []).map(
          (notification: HospitalNotification) => {
            let parsedMetadata: HospitalNotification["metadata"] =
              notification.metadata ?? null;
            if (
              typeof parsedMetadata === "string" &&
              parsedMetadata.trim().length > 0
            ) {
              try {
                parsedMetadata = JSON.parse(parsedMetadata);
              } catch {
                parsedMetadata = null;
              }
            }
            return { ...notification, metadata: parsedMetadata };
          },
        );
        setNotifications(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [hospital]);

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch(
        `/api/hospital/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === notificationId ? { ...n, is_read: true } : n,
          ),
        );
        return true;
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
    return false;
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch(
        "/api/hospital/notifications/mark-all-read",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        return true;
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
    return false;
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("hospital_token");
      const response = await fetch(
        `/api/hospital/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((n) => n.notification_id !== notificationId),
        );
        return true;
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
    return false;
  };

  // Auto-fetch notifications when hospital context is available
  useEffect(() => {
    if (hospital) {
      fetchNotifications();

      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);

      return () => clearInterval(interval);
    }
  }, [hospital, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <HospitalNotificationContext.Provider value={value}>
      {children}
    </HospitalNotificationContext.Provider>
  );
};
