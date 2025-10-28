import { ReactNode, useEffect, useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, Building2, Bell, User, Settings, HelpCircle, ChevronDown } from "lucide-react";
import OrganizationSidebar from "./OrganizationSidebar";
import OrganizationNotificationDropdown from "./OrganizationNotificationDropdown";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useOrganizationAuth } from "@/contexts/OrganizationAuthContext";
import { setPortalTitle } from "@/utils/pageTitle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export default function OrganizationLayout({
  children,
  title = "Organization Portal",
  subtitle,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isLoading } = useOrganizationAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("organization_token");
        const res = await fetch("/api/organization/policies/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          const unread = data.notifications.filter((n: any) => !n.is_read).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Failed to fetch notification count:", error);
      }
    };
    
    if (user) {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/organization/login");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    setPortalTitle("ORGANIZATION");
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/organization/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <NavLink to="/organization/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">OrganLink</h1>
                  <p className="text-xs text-gray-500">ORGANIZATION PORTAL</p>
                </div>
              </NavLink>
              
              {/* Navigation Links */}
              <nav className="hidden md:flex space-x-8">
                <NavLink
                  to="/organization/policies"
                  className={() => {
                    const isExactPolicies = location.pathname === '/organization/policies';
                    return `text-sm font-medium ${
                      isExactPolicies ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`;
                  }}
                >
                  Policies
                </NavLink>
                <NavLink
                  to="/organization/policies/propose"
                  className={() => {
                    const isPropose = location.pathname === '/organization/policies/propose';
                    return `text-sm font-medium ${
                      isPropose ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`;
                  }}
                >
                  Propose
                </NavLink>
              </nav>
            </div>

            {/* Right side - Notifications and User */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                <OrganizationNotificationDropdown
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-sm hover:bg-gray-100">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">ORG-GLOBAL</p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
