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
import { reactionsAPI, postsAPI, authAPI, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [currentReaction, setCurrentReaction] = useState(post.userReaction || null);
  const [reactionCount, setReactionCount] = useState(post.reactionsCount);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
        title: "Success",
        description: "Post deleted",
      });
      onPostDeleted?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleHidePost = async () => {
    try {
      await postsAPI.hide(post._id);
      toast({
        title: "Success",
        description: "Post hidden from your feed",
      });
      onPostHidden?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to hide post",
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
        title: "Error",
        description: error.message || "Failed to react to post",
        variant: "destructive",
      });
    }
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
                    <span>Public</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Lock className="h-3 w-3" />
                    <span>Friends</span>
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
                  <DropdownMenuItem onClick={() => navigate(`/post/${post._id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeletePost}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleHidePost}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2 cursor-pointer" onClick={() => onPostClick?.(post._id)}>
        <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
        <p className="text-foreground line-clamp-3">{post.content}</p>
        
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

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="px-4 pb-2">
          <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Post image ${index + 1}`}
                className="rounded-lg w-full object-cover max-h-80"
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 py-2 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{reactionCount} reactions</span>
          <span>{post.commentsCount} comments</span>
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
              <span className="text-xs capitalize">{type}</span>
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
          <span>Comment</span>
        </Button>
      </div>
    </Card>
  );
};

export default PostCard;
