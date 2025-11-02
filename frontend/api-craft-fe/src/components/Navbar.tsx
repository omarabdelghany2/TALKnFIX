import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, LogOut, User, Users, Trophy, Filter, Menu, X, LayoutDashboard } from "lucide-react";
import { removeToken } from "@/lib/api";
import logo from "@/assets/talknfix-logo.png";
import { useState } from "react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate("/auth");
  };

  const navLinks = [
    { to: "/feed", icon: <Search className="mr-2 h-4 w-4" />, label: t("nav.feed") },
    { to: "/dashboard", icon: <LayoutDashboard className="mr-2 h-4 w-4" />, label: t("nav.dashboard") },
    { to: "/friends", icon: <Users className="mr-2 h-4 w-4" />, label: t("nav.friends"), badge: 0 },
    { to: "/leaderboard", icon: <Trophy className="mr-2 h-4 w-4" />, label: t("nav.leaderboard") },
    { to: "/advanced-search", icon: <Filter className="mr-2 h-4 w-4" />, label: t("nav.advancedSearch") },
    { to: "/profile", icon: <User className="mr-2 h-4 w-4" />, label: t("nav.profile") },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/feed" className="flex items-center gap-2">
            <img src={logo} alt="TalkNFix" className="h-10 w-auto" />
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("nav.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </form>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.to}
                variant="ghost"
                size="sm"
                asChild
                className="relative"
              >
                <Link to={link.to}>
                  {link.icon}
                  <span className="hidden md:inline">{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              </Button>
            ))}
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleLogout} title={t("nav.logout")}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder={t("nav.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>
                  <div className="space-y-2">
                    {navLinks.map((link) => (
                      <Button
                        key={link.to}
                        variant="ghost"
                        className="w-full justify-start relative"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to={link.to}>
                          {link.icon}
                          {link.label}
                          {link.badge !== undefined && link.badge > 0 && (
                            <Badge className="ml-auto">
                              {link.badge}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("nav.logout")}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
