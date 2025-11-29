import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/admin/AdminLayout";
import { useNotifications } from "@/contexts/NotificationContext";
import { Bell, Check, Trash2, Filter, Clock, Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Notifications() {
  const [filter, setFilter] = useState<string>("all");
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    if (filter === "security") return notification.type === "security";
    if (filter === "warning") return notification.type === "warning";
    if (filter === "success") return notification.type === "success";
    if (filter === "info") return notification.type === "info";
    return true;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "security":
        return "bg-red-50 text-red-700 border-red-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "security":
        return <Shield className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <AdminLayout
      title="Notifications"
      subtitle="Manage all system notifications and alerts"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-medical-50 rounded-lg">
              <Bell className="h-6 w-6 text-medical-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                All Notifications
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                You have {unreadCount} unread notifications
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="read">Read Only</SelectItem>
                <SelectItem value="security">Security Alerts</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="info">Information</SelectItem>
              </SelectContent>
            </Select>

            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                className="bg-medical-600 hover:bg-medical-700 text-white shadow-sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No notifications found
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      {filter === "all"
                        ? "You're all caught up! Check back later for new updates."
                        : `No ${filter} notifications to display at the moment.`}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  layout
                >
                  <Card
                    className={`group cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${!notification.read
                        ? "border-l-medical-500 bg-white"
                        : "border-l-gray-200 bg-gray-50/50"
                      }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex gap-4 sm:gap-6">
                        {/* Icon */}
                        <div className={`flex-shrink-0 mt-1`}>
                          <div className={`p-2 rounded-full ${notification.read ? "bg-gray-100" : "bg-white shadow-sm ring-1 ring-gray-100"
                            }`}>
                            {getTypeIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className={`text-base font-semibold ${notification.read ? "text-gray-700" : "text-gray-900"
                                  }`}>
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <span className="flex h-2 w-2 rounded-full bg-medical-500 ring-2 ring-white" />
                                )}
                              </div>
                              <p className={`text-sm leading-relaxed ${notification.read ? "text-gray-500" : "text-gray-600"
                                }`}>
                                {notification.fullMessage || notification.message}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1 flex-shrink-0">
                              <Badge variant="outline" className={`${getTypeColor(notification.type)} border`}>
                                {notification.type}
                              </Badge>
                              <div className="flex items-center text-xs text-gray-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {notification.time}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                            >
                              <Trash2 className="h-4 w-4 mr-1.5" />
                              <span className="text-xs">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}
