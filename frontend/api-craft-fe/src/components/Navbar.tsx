import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, LogOut, User, Users, Trophy, Filter, Menu, X } from "lucide-react";
import { removeToken, usersAPI, getToken } from "@/lib/api";
import logo from "@/assets/talknfix-logo.png";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden flex-shrink-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                {/* Language Switcher */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Language</span>
                  <LanguageSwitcher />
                </div>

                {/* Advanced Search */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/advanced-search");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Search
                </Button>

                {/* Leaderboard */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/leaderboard");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>

                {/* Friends */}
                <Button
                  variant="outline"
                  className="w-full justify-start relative"
                  onClick={() => {
                    navigate("/friends");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Friends
                  {friendRequestCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {friendRequestCount}
                    </Badge>
                  )}
                </Button>

                {/* Notifications */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setMobileMenuOpen(false);
                  }}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>

                {/* Profile */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>

                {/* Logout */}
                <Button
                  variant="destructive"
                  className="w-full justify-start mt-4"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo - Always visible */}
          <Link to="/feed" className="flex items-center space-x-3 flex-shrink-0">
            <img src={logo} alt="TalknFix" className="h-8 md:h-10 w-auto" />
          </Link>

          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
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
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Search icon for mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/advanced-search")}
              className="md:hidden hover:bg-secondary"
              title="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Desktop menu items */}
            <div className="hidden md:flex items-center space-x-2">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/advanced-search")}
                className="hover:bg-secondary"
                title="Advanced Search"
              >
                <Filter className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/leaderboard")}
                className="hover:bg-secondary"
                title="Leaderboard"
              >
                <Trophy className="h-5 w-5" />
              </Button>
            </div>

            {/* Always visible menu items */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/friends")}
              className="hover:bg-secondary relative"
              title="Friends"
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
              className="hidden md:flex hover:bg-secondary"
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
