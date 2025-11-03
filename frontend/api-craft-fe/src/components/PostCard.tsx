import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ThumbsUp,
  ArrowUp,
  Lightbulb,
  Eye,
  MessageCircle,
  MoreVertical,
  Globe,
  Lock,
  Trash2,
  Edit,
  EyeOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { reactionsAPI, postsAPI, authAPI, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from "isomorphic-dompurify";

interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  title: string;
  content: string;
  images?: string[];
  visibility: "public" | "private";
  tags?: string[];
  reactionsCount: number;
  commentsCount: number;
  createdAt: string;
  userReaction?: string;
}

interface PostCardProps {
  post: Post;
  onPostClick?: (postId: string) => void;
  onPostDeleted?: () => void;
  onPostHidden?: () => void;
  currentUserId?: string;
}

const reactionIcons = {
  like: ThumbsUp,
  upvote: ArrowUp,
  helpful: Lightbulb,
  insightful: Eye,
};

const PostCard = ({ post, onPostClick, onPostDeleted, onPostHidden, currentUserId }: PostCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [reactions, setReactions] = useState({
    count: post.reactionsCount,
    userReaction: post.userReaction,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [localCurrentUserId, setLocalCurrentUserId] = useState<string | null>(currentUserId || null);
  const [isContentTruncated, setIsContentTruncated] = useState(false);

  // Get current user ID if not provided
  useEffect(() => {
    if (!currentUserId) {
      const loadCurrentUser = async () => {
        try {
          const token = getToken();
          if (!token) return;
          const response = await authAPI.getMe();
          setLocalCurrentUserId(response.user._id);
        } catch (error) {
          console.error("Failed to load user:", error);
        }
      };
      loadCurrentUser();
    }
  }, [currentUserId]);

  // Check if content needs truncation (character count > 300)
  useEffect(() => {
    const plainText = post.content.replace(/<[^>]*>/g, '');
    setIsContentTruncated(plainText.length > 300);
  }, [post.content]);

  const handleReaction = async (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await reactionsAPI.toggle({ postId: post._id, type: type as any });

      if (!response.reacted) {
        // Reaction removed
        setReactions({
          count: Math.max(0, reactions.count - 1),
          userReaction: null,
        });
      } else if (response.message === "Reaction added") {
        // New reaction added
        setReactions({
          count: reactions.count + 1,
          userReaction: type,
        });
      } else {
        // Reaction type changed (count stays the same)
        setReactions({
          count: reactions.count,
          userReaction: type,
        });
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("postCard.failedToReact"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("post.deleteConfirm"))) return;
    setIsDeleting(true);
    try {
      await postsAPI.delete(post._id);
      toast({
        title: t("common.success"),
        description: t("post.postDeleted"),
      });
      if (onPostDeleted) onPostDeleted();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleHidePost = async () => {
    try {
      await postsAPI.hide(post._id);
      toast({
        title: t("common.success"),
        description: t("postCard.postHidden"),
      });
      onPostHidden?.();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("postCard.failedToHide"),
        variant: "destructive",
      });
    }
  };

  const handleCardClick = () => {
    if (onPostClick) {
      onPostClick(post._id);
    } else {
      navigate(`/post/${post._id}`);
    }
  };

  // Carousel navigation handlers
  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.images && currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Touch handlers for swipe on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && post.images && currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }

    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const isOwnPost = (localCurrentUserId || currentUserId) === post.author._id;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${post.author._id}`);
            }}
          >
            {post.author.avatar ? (
              <AvatarImage src={post.author.avatar} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p
                className="font-semibold cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${post.author._id}`);
                }}
              >
                {post.author.fullName || post.author.username}
              </p>
              {post.visibility === "private" ? (
                <Lock className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Globe className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <p
              className="text-sm text-muted-foreground cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${post.author._id}`);
              }}
            >
              @{post.author.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost ? (
              <>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/post/${post._id}/edit`);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("common.delete")}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleHidePost();
              }}>
                <EyeOff className="mr-2 h-4 w-4" />
                {t("postCard.hidePost")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <div
          className="prose prose-sm max-w-none line-clamp-3"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
        {isContentTruncated && (
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto font-semibold text-primary hover:text-primary/80 mt-1"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/post/${post._id}`);
            }}
          >
            {t("postCard.readMore")}
          </Button>
        )}
      </div>

      {/* Images - Instagram Style Carousel */}
      {post.images && post.images.length > 0 && (
        <div className="relative w-full bg-gray-100 dark:bg-gray-900 select-none mb-4 -mx-6">
          {/* Image Container with fixed height */}
          <div
            className="relative overflow-hidden h-[400px] md:h-[500px]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {post.images.map((img, index) => (
                <div key={index} className="w-full h-full flex-shrink-0 flex items-center justify-center bg-black">
                  <img
                    src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${img}`}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows (Desktop) */}
          {post.images.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={goToPrevImage}
                  className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {currentImageIndex < post.images.length - 1 && (
                <button
                  onClick={goToNextImage}
                  className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}

          {/* Dots Indicator */}
          {post.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {post.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`transition-all rounded-full ${
                    index === currentImageIndex
                      ? 'bg-white w-2 h-2'
                      : 'bg-white/60 w-1.5 h-1.5 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Image Counter (Top Right) */}
          {post.images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {currentImageIndex + 1} / {post.images.length}
            </div>
          )}
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <div className="flex gap-1">
          {Object.entries(reactionIcons).map(([type, Icon]) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              onClick={(e) => handleReaction(type, e)}
              className={reactions.userReaction === type ? "text-primary" : ""}
              title={t(`postCard.${type}`)}
            >
              <Icon className="h-4 w-4 mr-1" />
              {reactions.userReaction === type && reactions.count > 0 && reactions.count}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={handleCardClick} title={t("postCard.comment")}>
          <MessageCircle className="h-4 w-4 mr-1" />
          {post.commentsCount > 0 && post.commentsCount}
        </Button>
      </div>
    </Card>
  );
};

export default PostCard;
