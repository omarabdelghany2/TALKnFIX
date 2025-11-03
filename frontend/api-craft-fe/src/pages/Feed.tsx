import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreatePostCard from "@/components/CreatePostCard";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { postsAPI, authAPI, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Feed = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

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

  const loadFeed = async (page = 1, append = false) => {
    try {
      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await postsAPI.getFeed(page);

      if (append) {
        setPosts(prev => [...prev, ...(response.posts || [])]);
      } else {
        setPosts(response.posts || []);
      }

      if (response.pagination) {
        setCurrentPage(response.pagination.currentPage);
        setHasNextPage(response.pagination.hasNextPage);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("feed.failedToLoad"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    loadFeed(currentPage + 1, true);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <CreatePostCard onPostCreated={loadFeed} currentUser={currentUser} />

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("feed.noPostsYet")}</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostClick={handlePostClick}
                  onPostDeleted={() => loadFeed(1, false)}
                  currentUserId={currentUser?._id}
                />
              ))}
            </div>

            {hasNextPage && (
              <div className="flex justify-center mt-8 mb-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    `Load More (${currentPage}/${totalPages})`
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
