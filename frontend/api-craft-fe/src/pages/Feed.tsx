import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import CreatePostCard from "@/components/CreatePostCard";
import PostCard from "@/components/PostCard";
import { postsAPI, authAPI, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Feed = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/auth");
      return;
    }

    loadFeed();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await authAPI.getMe();
      setCurrentUser(response.user);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const loadFeed = async () => {
    try {
      const response = await postsAPI.getFeed();
      setPosts(response.posts || []);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("feed.failedToLoad"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <CreatePostCard onPostCreated={loadFeed} currentUser={currentUser} />

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("feed.loadingPosts")}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("feed.noPosts")}</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostClick={handlePostClick}
                onPostDeleted={loadFeed}
                onPostHidden={loadFeed}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
