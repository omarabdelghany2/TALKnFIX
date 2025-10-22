import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, LogOut, User, Users } from "lucide-react";
import { removeToken, usersAPI, getToken } from "@/lib/api";
import logo from "@/assets/talknfix-logo.png";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  useEffect(() => {
    loadFriendRequests();

    // Refresh friend requests count every 30 seconds
    const interval = setInterval(loadFriendRequests, 30000);

    // Listen for custom event to refresh friend requests
    const handleRefresh = () => loadFriendRequests();
    window.addEventListener('friendRequestsUpdated', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('friendRequestsUpdated', handleRefresh);
    };
  }, []);

  const loadFriendRequests = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await usersAPI.getFriendRequests();
      setFriendRequestCount(response.requests?.length || 0);
    } catch (error) {
      console.error("Failed to load friend requests:", error);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate("/auth");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/feed" className="flex items-center space-x-3">
            <img src={logo} alt="TalknFix" className="h-10 w-auto" />
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={t('nav.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-none"
              />
            </div>
          </form>

          {/* Right Menu */}
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/friends")}
              className="hover:bg-secondary relative"
            >
              <Users className="h-5 w-5" />
              {friendRequestCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {friendRequestCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-secondary"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="hover:bg-secondary"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
