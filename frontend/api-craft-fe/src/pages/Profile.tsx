import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  UserCheck,
  Mail,
  Users,
  FileText,
  ThumbsUp,
  MessageCircle,
  Settings
} from "lucide-react";
import { postsAPI, usersAPI, authAPI, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import ReputationBadge from "@/components/ReputationBadge";
import BadgesList from "@/components/BadgesList";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postStats, setPostStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const isOwnProfile = !id || id === currentUser?._id;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/auth");
      return;
    }

    loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUserResponse = await authAPI.getMe();
      setCurrentUser(currentUserResponse.user);

      let targetUserId = id || currentUserResponse.user._id;

      // Load profile user data if viewing someone else's profile
      if (id && id !== currentUserResponse.user._id) {
        const profileResponse = await usersAPI.getProfile(id);
        setProfileUser(profileResponse.user);

        // Check if already friends
        const isFriendCheck = currentUserResponse.user.friends?.some(
          (friend: any) => friend._id === id || friend === id
        );
        setIsFriend(isFriendCheck);
      } else {
        setProfileUser(currentUserResponse.user);
      }

      // Load user's posts
      const postsResponse = await postsAPI.getUserPosts(targetUserId);
      setUserPosts(postsResponse.posts || []);
      setPostStats(postsResponse.stats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!profileUser) return;

    try {
      await usersAPI.sendFriendRequest(profileUser._id);
      setRequestSent(true);
      toast({
        title: "Success",
        description: "Friend request sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async () => {
    if (!profileUser) return;

    try {
      await usersAPI.removeFriend(profileUser._id);
      setIsFriend(false);
      toast({
        title: "Success",
        description: "Friend removed",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove friend",
        variant: "destructive",
      });
    }
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar onSearch={handleSearch} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileUser.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {profileUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {profileUser.fullName || profileUser.username}
                </h1>
                <p className="text-muted-foreground">@{profileUser.username}</p>
                {profileUser.email && isOwnProfile && (
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-1" />
                    {profileUser.email}
                  </div>
                )}
                {profileUser.bio && (
                  <p className="mt-2 text-sm">{profileUser.bio}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {isOwnProfile ? (
                <Button variant="outline" onClick={() => navigate("/friends")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Friends
                </Button>
              ) : (
                <>
                  {isFriend ? (
                    <Button variant="outline" onClick={handleRemoveFriend}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Friends
                    </Button>
                  ) : requestSent ? (
                    <Button variant="outline" disabled>
                      <Mail className="h-4 w-4 mr-2" />
                      Request Sent
                    </Button>
                  ) : (
                    <Button onClick={handleSendFriendRequest}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friend
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Reputation & Level */}
          {profileUser.reputation !== undefined && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Reputation</h3>
                <ReputationBadge
                  reputation={profileUser.reputation || 0}
                  level={profileUser.level || 1}
                  size="lg"
                />
              </div>

              {/* Badges */}
              {profileUser.badges && profileUser.badges.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm mb-3 text-muted-foreground">
                    Achievements ({profileUser.badges.length})
                  </h4>
                  <BadgesList badges={profileUser.badges} showEarnedDate />
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FileText className="h-5 w-5 text-muted-foreground mr-1" />
              </div>
              <p className="text-2xl font-bold">{userPosts.length}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <ThumbsUp className="h-5 w-5 text-muted-foreground mr-1" />
              </div>
              <p className="text-2xl font-bold">{postStats?.totalReactions || 0}</p>
              <p className="text-sm text-muted-foreground">Reactions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <MessageCircle className="h-5 w-5 text-muted-foreground mr-1" />
              </div>
              <p className="text-2xl font-bold">{postStats?.totalComments || 0}</p>
              <p className="text-sm text-muted-foreground">Comments</p>
            </div>
          </div>
        </Card>

        {/* Posts Section */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-6">
            <TabsTrigger value="posts">
              Posts
              <Badge variant="secondary" className="ml-2">
                {userPosts.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-4">
              {userPosts.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isOwnProfile
                      ? "You haven't posted anything yet"
                      : "This user hasn't posted anything yet"}
                  </p>
                  {isOwnProfile && (
                    <Button
                      className="mt-4"
                      onClick={() => navigate("/feed")}
                    >
                      Create Your First Post
                    </Button>
                  )}
                </Card>
              ) : (
                userPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostClick={handlePostClick}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
