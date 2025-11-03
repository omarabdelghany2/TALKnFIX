import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search as SearchIcon, UserPlus, UserCheck } from "lucide-react";
import { usersAPI, authAPI, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/auth");
      return;
    }

    loadCurrentUser();
    const initialQuery = searchParams.get("q");
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await authAPI.getMe();
      setCurrentUser(response.user);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await usersAPI.search(query);
      setResults(response.users || []);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("search.failedToSearch"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await usersAPI.sendFriendRequest(userId);
      setSentRequests(new Set([...sentRequests, userId]));
      toast({
        title: t("common.success"),
        description: t("search.friendRequestSent"),
      });
      loadCurrentUser(); // Refresh to update friend status
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("search.failedToSend"),
        variant: "destructive",
      });
    }
  };

  const isFriend = (userId: string) => {
    return currentUser?.friends?.some((f: any) => f._id === userId);
  };

  const hasPendingRequest = (userId: string) => {
    return sentRequests.has(userId);
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar onSearch={performSearch} />
      
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{t("search.searchUsers")}</h1>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              placeholder={t("search.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <SearchIcon className="h-4 w-4 mr-2" />
              {t("search.search")}
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">{t("search.searching")}</p>
            </Card>
          ) : results.length === 0 ? (
            searchQuery && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">{t("search.noUsersFound")}</p>
              </Card>
            )
          ) : (
            results.map((user) => (
              <Card key={user._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.fullName || user.username}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>

                  {currentUser?._id !== user._id && (
                    <div>
                      {isFriend(user._id) ? (
                        <Button variant="outline" size="sm" disabled>
                          <UserCheck className="h-4 w-4 mr-2" />
                          {t("search.friends")}
                        </Button>
                      ) : hasPendingRequest(user._id) ? (
                        <Button variant="outline" size="sm" disabled>
                          {t("search.requestSent")}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSendRequest(user._id)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {t("search.addFriend")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
