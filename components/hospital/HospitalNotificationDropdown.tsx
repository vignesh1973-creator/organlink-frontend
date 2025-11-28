import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  X,
  Check,
  Heart,
  Users,
  AlertTriangle,
  Info,
  Trash2,
  CheckCheck,
  ChevronRight,
} from "lucide-react";
import { useHospitalNotifications } from "@/contexts/HospitalNotificationContext";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface HospitalNotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HospitalNotificationDropdown({
  isOpen,
  onClose,
}: HospitalNotificationDropdownProps) {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useHospitalNotifications();
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  const selectedNotification = useMemo(
    () =>
      notifications.find((n) => n.notification_id === selectedNotificationId) ||
      null,
    [notifications, selectedNotificationId],
  );

  const parsedMetadata = useMemo(() => {
    if (
      !selectedNotification?.metadata ||
      typeof selectedNotification.metadata !== "object"
    ) {
      return null;
    }
    return selectedNotification.metadata as Record<string, any>;
  }, [selectedNotification]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedNotificationId(null);
      return;
    }

    if (notifications.length > 0 && !selectedNotificationId) {
      setSelectedNotificationId(notifications[0].notification_id);
    }
  }, [isOpen, notifications, selectedNotificationId]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "organ_request":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "organ_match":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "request_response":
        return <Users className="h-4 w-4 text-green-500" />;
      case "match_response":
        return <Users className="h-4 w-4 text-green-500" />;
      case "urgent_case":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "system":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatDateIST = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-4 right-4 top-20 z-50 md:absolute md:top-full md:right-0 md:left-auto md:w-80 md:mt-2">
      <Card ref={dropdownRef} className="shadow-lg border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-medical-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-6 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">
                  You'll see updates about matches and requests here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notification) => {
                  const isSelected =
                    selectedNotificationId === notification.notification_id;
                  return (
                    <div
                      key={notification.notification_id}
                      className={cn(
                        "p-4 hover:bg-gray-50 transition-colors cursor-pointer relative",
                        !notification.is_read &&
                        "bg-blue-50 border-l-4 border-l-blue-500",
                        isSelected &&
                        "ring-1 ring-medical-500 bg-medical-50/60",
                      )}
                      onClick={() => {
                        setSelectedNotificationId(notification.notification_id);
                        if (!notification.is_read) {
                          markAsRead(notification.notification_id);
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4
                              className={cn(
                                "text-sm font-medium text-gray-900 truncate",
                                (!notification.is_read || isSelected) &&
                                "font-semibold",
                              )}
                            >
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.notification_id);
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(
                                    notification.notification_id,
                                  );
                                }}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.created_at)}
                            </span>

                            {(notification.type === "organ_request" || notification.type === "organ_match") && (
                              <Badge variant="outline" className="text-xs">
                                Match Request
                              </Badge>
                            )}

                            {(notification.type === "request_response" || notification.type === "match_response") && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700"
                              >
                                Response
                              </Badge>
                            )}

                            {notification.type === "urgent_case" && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-red-50 text-red-700"
                              >
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {notifications.length > 10 && (
                  <div className="p-3 text-center border-t">
                    <p className="text-xs text-gray-500">
                      Showing 10 of {notifications.length} notifications
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>

        {selectedNotification && (
          <div className="border-t bg-gray-50 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedNotification.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Request ID:{" "}
                  {selectedNotification.related_id ||
                    parsedMetadata?.request_id ||
                    "N/A"}
                </p>
                {parsedMetadata?.patient_id && (
                  <p className="text-xs text-gray-500">
                    Patient ID: {parsedMetadata.patient_id}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  // Mark as read before navigating
                  if (!selectedNotification.is_read) {
                    await markAsRead(selectedNotification.notification_id);
                  }

                  onClose();

                  // Route based on notification type
                  // organ_request = Incoming (donor hospital receiving request)
                  // request_response/match_response = My Requests (patient hospital receiving response)
                  // internal_match = My Requests (same hospital match)
                  const type = selectedNotification.type;

                  if (type === "organ_request" || type === "organ_match") {
                    // Donor hospital - view incoming request
                    navigate("/hospital/ai-matching?tab=incoming");
                  } else if (type === "request_response" || type === "match_response" || type === "internal_match") {
                    // Patient hospital - view sent request status
                    navigate("/hospital/ai-matching?tab=outgoing");
                  } else {
                    // Default to AI Matching search tab
                    navigate("/hospital/ai-matching?tab=search");
                  }
                }}
                className="text-xs"
              >
                View in AI Matching
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <p className="text-sm text-gray-700">
              {selectedNotification.message}
            </p>

            {parsedMetadata?.matches?.length ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Top Matching Donors
                </p>
                {parsedMetadata.matches.slice(0, 3).map((match: any) => (
                  <div
                    key={`${match.donor_id ?? "donor"}-${match.hospital_id ?? "hospital"}`}
                    className="rounded-md border bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {match.donor_name || "Donor"}
                        </p>
                        {match.hospital_name && (
                          <p className="text-xs text-gray-500">
                            {match.hospital_name}
                          </p>
                        )}
                      </div>
                      {typeof match.match_score === "number" && (
                        <Badge className="text-xs bg-green-100 text-green-700">
                          {match.match_score}% Match
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                      {match.blood_type && (
                        <span>Blood: {match.blood_type}</span>
                      )}
                      {Array.isArray(match.organs_available) &&
                        match.organs_available.length > 0 && (
                          <span>
                            Organs: {match.organs_available.join(", ")}
                          </span>
                        )}
                    </div>
                    {match.explanation && (
                      <p className="mt-2 text-xs text-gray-500 italic">
                        {match.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Detailed match data will appear when available for this
                notification.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
