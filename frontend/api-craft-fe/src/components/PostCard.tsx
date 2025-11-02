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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { reactionsAPI, postsAPI } from "@/lib/api";
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
  currentUserId?: string;
}

const reactionIcons = {
  like: ThumbsUp,
  upvote: ArrowUp,
  helpful: Lightbulb,
  insightful: Eye,
};

const PostCard = ({ post, onPostClick, onPostDeleted, currentUserId }: PostCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [reactions, setReactions] = useState({
    count: post.reactionsCount,
    userReaction: post.userReaction,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleReaction = async (type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await reactionsAPI.toggle(post._id, type);
      const newReaction = result.reaction;
      setReactions({
        count: newReaction ? reactions.count + (reactions.userReaction ? 0 : 1) : reactions.count - 1,
        userReaction: newReaction,
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
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

  const handleCardClick = () => {
    if (onPostClick) {
      onPostClick(post._id);
    } else {
      navigate(`/post/${post._id}`);
    }
  };

  const isOwnPost = currentUserId === post.author._id;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar>
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
              <p className="font-semibold">{post.author.fullName || post.author.username}</p>
              {post.visibility === "private" ? (
                <Lock className="h-3 w-3 text-muted-foreground" />
              ) : (
                <Globe className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              @{post.author.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <div
          className="prose prose-sm max-w-none line-clamp-3"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      </div>

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
            >
              <Icon className="h-4 w-4 mr-1" />
              {reactions.userReaction === type && reactions.count > 0 && reactions.count}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={handleCardClick}>
          <MessageCircle className="h-4 w-4 mr-1" />
          {post.commentsCount > 0 && post.commentsCount}
        </Button>
      </div>
    </Card>
  );
};

export default PostCard;
