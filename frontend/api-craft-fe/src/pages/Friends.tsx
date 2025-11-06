import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserCheck, X, Check } from "lucide-react";
import { usersAPI, authAPI, getToken, getAvatarUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Friends = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/auth");
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userResponse, requestsResponse] = await Promise.all([
        authAPI.getMe(),
        usersAPI.getFriendRequests(),
      ]);
      setCurrentUser(userResponse.user);
      setFriendRequests(requestsResponse.requests || []);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("friendsPage.failedToLoad"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await usersAPI.acceptFriendRequest(requestId);
      toast({
        title: t("common.success"),
        description: t("friendsPage.requestAccepted"),
      });
      loadData();
      // Notify Navbar to refresh friend requests count
      window.dispatchEvent(new Event('friendRequestsUpdated'));
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("friendsPage.failedToAccept"),
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await usersAPI.rejectFriendRequest(requestId);
      toast({
        title: t("common.success"),
        description: t("friendsPage.requestRejected"),
      });
      loadData();
      // Notify Navbar to refresh friend requests count
      window.dispatchEvent(new Event('friendRequestsUpdated'));
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("friendsPage.failedToReject"),
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await usersAPI.removeFriend(friendId);
      toast({
        title: t("common.success"),
        description: t("friendsPage.friendRemoved"),
      });
      loadData();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("friendsPage.failedToRemove"),
        variant: "destructive",
      });
    }
  };

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">{t("friendsPage.title")}</h1>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="friends">
              {t("friendsPage.myFriends")}
              <Badge variant="secondary" className="ml-2">
                {currentUser?.friends?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="requests">
              {t("friendsPage.requests")}
              <Badge variant="secondary" className="ml-2">
                {friendRequests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <div className="grid gap-4 md:grid-cols-2">
              {currentUser?.friends?.length === 0 ? (
                <Card className="col-span-2 p-8 text-center">
                  <p className="text-muted-foreground">{t("friendsPage.noFriendsYet")}</p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate("/search")}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t("friendsPage.findFriends")}
                  </Button>
                </Card>
              ) : (
                currentUser?.friends
                  ?.filter((friend: any) => friend && friend._id)
                  .map((friend: any) => (
                    <Card key={friend._id} className="p-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={getAvatarUrl(friend?.avatar)} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {friend?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{friend?.fullName || friend?.username || 'Unknown User'}</p>
                          <p className="text-sm text-muted-foreground">@{friend?.username || 'unknown'}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFriend(friend._id)}
                        >
                          {t("friendsPage.remove")}
                        </Button>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-4">
              {friendRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">{t("friendsPage.noPendingRequests")}</p>
                </Card>
              ) : (
                friendRequests
                  .filter((request) => request.from && request.from._id)
                  .map((request) => (
                    <Card key={request._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={getAvatarUrl(request.from?.avatar)} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {request.from?.username?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{request.from?.fullName || request.from?.username || 'Unknown User'}</p>
                            <p className="text-sm text-muted-foreground">@{request.from?.username || 'unknown'}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.from._id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {t("friendsPage.accept")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectRequest(request.from._id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {t("friendsPage.reject")}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;
