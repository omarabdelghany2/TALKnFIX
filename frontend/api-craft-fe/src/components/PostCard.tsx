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
  EyeOff,
  Edit,
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
}

const reactionIcons = {
  like: ThumbsUp,
  upvote: ArrowUp,
  helpful: Lightbulb,
  insightful: Eye,
};

const PostCard = ({ post, onPostClick, onPostDeleted, onPostHidden }: PostCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentReaction, setCurrentReaction] = useState(post.userReaction || null);
  const [reactionCount, setReactionCount] = useState(post.reactionsCount);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [showFullContent, setShowFullContent] = useState(false);

  // Check if content is long (more than 300 characters of text)
  const contentLength = post.content.replace(/<[^>]*>/g, '').length;
  const isLongContent = contentLength > 300;

  // Get current user ID
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const response = await authAPI.getMe();
        setCurrentUserId(response.user._id);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };
    loadCurrentUser();
  }, []);

  const isOwnPost = currentUserId === post.author._id;

  const handleDeletePost = async () => {
    try {
      await postsAPI.delete(post._id);
      toast({
        title: t("common.success"),
        description: t("postCard.postDeleted"),
      });
      onPostDeleted?.();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("postCard.failedToDelete"),
        variant: "destructive",
      });
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

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.author._id}`);
  };

  const handleReaction = async (type: string) => {
    try {
      const response = await reactionsAPI.toggle({ postId: post._id, type: type as any });

      if (!response.reacted) {
        setCurrentReaction(null);
        setReactionCount(prev => prev - 1);
      } else if (response.message === "Reaction added") {
        setCurrentReaction(type);
        setReactionCount(prev => prev + 1);
      } else {
        setCurrentReaction(type);
      }
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("postCard.failedToReact"),
        variant: "destructive",
      });
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

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleAuthorClick}
          >
            <Avatar>
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.author.fullName || post.author.username}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                <span>•</span>
                {post.visibility === "public" ? (
                  <div className="flex items-center space-x-1">
                    <Globe className="h-3 w-3" />
                    <span>{t("postCard.public")}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Lock className="h-3 w-3" />
                    <span>{t("postCard.friends")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwnPost ? (
                <>
                  <DropdownMenuItem onClick={() => navigate(`/post/${post._id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t("postCard.editPost")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeletePost}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("postCard.deletePost")}
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleHidePost}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  {t("postCard.hidePost")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
        <div
          className={`prose prose-sm max-w-none text-foreground post-content ${!showFullContent && isLongContent ? 'line-clamp-4' : ''}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {/* Read More Button */}
        {isLongContent && !showFullContent && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPostClick?.(post._id);
            }}
            className="text-primary hover:underline text-sm font-medium mt-1"
          >
            {t("common.readMore", "Read More")} →
          </button>
        )}

        {/* ChatGPT-style code block styling with mobile responsiveness */}
        <style>{`
          .post-content pre {
            background: #1e1e1e;
            color: #d4d4d4;
            font-family: 'Courier New', Courier, monospace;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin: 0.5rem 0;
            overflow-x: auto;
            max-width: 100%;
            /* Mobile responsive */
            font-size: 0.7rem;
          }

          @media (min-width: 768px) {
            .post-content pre {
              padding: 1rem;
              font-size: 0.9rem;
            }
          }

          .post-content pre code {
            background: none;
            color: inherit;
            padding: 0;
            white-space: pre;
            word-break: normal;
            overflow-wrap: normal;
          }

          .post-content p {
            margin: 0.25rem 0;
            word-break: break-word;
          }

          .post-content strong {
            font-weight: bold;
          }

          .post-content em {
            font-style: italic;
          }

          .post-content code:not(pre code) {
            background: rgba(0, 0, 0, 0.1);
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
          }
        `}</style>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Images - Instagram Style Carousel */}
      {post.images && post.images.length > 0 && (
        <div className="relative w-full bg-gray-100 dark:bg-gray-900 select-none">
          {/* Image Container */}
          <div
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {post.images.map((img, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <img
                    src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${img}`}
                    alt={`Post image ${index + 1}`}
                    className="w-full object-contain max-h-[500px] bg-black"
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

      {/* Stats */}
      <div className="px-4 py-2 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{reactionCount} {t("postCard.reactions")}</span>
          <span>{post.commentsCount} {t("postCard.comments")}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 border-t border-border pt-1">
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(reactionIcons).map(([type, Icon]) => (
            <Button
              key={type}
              variant={currentReaction === type ? "default" : "ghost"}
              size="sm"
              onClick={() => handleReaction(type)}
              className="flex items-center space-x-1"
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs capitalize">{t(`postCard.${type}`)}</span>
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-1 flex items-center justify-center space-x-2"
          onClick={() => onPostClick?.(post._id)}
        >
          <MessageCircle className="h-4 w-4" />
          <span>{t("postCard.comment")}</span>
        </Button>
      </div>
    </Card>
  );
};

export default PostCard;
