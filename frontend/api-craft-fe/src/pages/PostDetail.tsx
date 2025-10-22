import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  ArrowUp,
  Lightbulb,
  Eye,
  Globe,
  Lock,
  Send,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { postsAPI, commentsAPI, reactionsAPI, authAPI, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const reactionIcons = {
  like: ThumbsUp,
  upvote: ArrowUp,
  helpful: Lightbulb,
  insightful: Eye,
};

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [reactionCount, setReactionCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/auth");
      return;
    }

    if (id) {
      loadPost();
      loadComments();
      loadCurrentUser();
      checkReaction();
    }
  }, [id]);

  const loadCurrentUser = async () => {
    try {
      const response = await authAPI.getMe();
      setCurrentUser(response.user);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const loadPost = async () => {
    try {
      const response = await postsAPI.getPost(id!);
      setPost(response.post);
      setReactionCount(response.post.reactionsCount);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load post",
        variant: "destructive",
      });
      navigate("/feed");
    }
  };

  const loadComments = async () => {
    try {
      const response = await commentsAPI.getComments(id!);
      setComments(response.comments || []);
    } catch (error: any) {
      console.error("Failed to load comments:", error);
    }
  };

  const checkReaction = async () => {
    try {
      const reactionData = await reactionsAPI.checkReaction(id!);
      if (reactionData.reacted && reactionData.reaction) {
        setCurrentReaction(reactionData.reaction.type);
      }
    } catch (error) {
      console.error("Failed to check reaction:", error);
    }
  };

  const handleReaction = async (type: string) => {
    try {
      const response = await reactionsAPI.toggle({ postId: id!, type: type as any });

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

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await commentsAPI.create({
        postId: id!,
        content: newComment,
      });

      toast({
        title: "Success",
        description: "Comment added",
      });

      setNewComment("");
      loadComments();
      loadPost(); // Refresh to update comment count
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsAPI.delete(commentId);
      toast({
        title: "Success",
        description: "Comment deleted",
      });
      loadComments();
      loadPost();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Post Card */}
        <Card className="overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {post.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.author.fullName || post.author.username}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
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
            </div>

            {/* Content */}
            <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
            <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="grid gap-3 mb-4">
                {post.images.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Post image ${index + 1}`}
                    className="rounded-lg w-full object-cover"
                  />
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between py-3 border-y border-border">
              <span className="text-sm text-muted-foreground">{reactionCount} reactions</span>
              <span className="text-sm text-muted-foreground">{post.commentsCount} comments</span>
            </div>

            {/* Reactions */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {Object.entries(reactionIcons).map(([type, Icon]) => (
                <Button
                  key={type}
                  variant={currentReaction === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleReaction(type)}
                  className="flex items-center justify-center space-x-1"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs capitalize">{type}</span>
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <Card className="mt-4 p-6">
          <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>

          {/* Add Comment */}
          <div className="flex space-x-3 mb-6">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentUser?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                maxLength={1000}
                className="mb-2"
              />
              <Button
                onClick={handleCommentSubmit}
                disabled={isSubmitting || !newComment.trim()}
                size="sm"
              >
                <Send className="h-4 w-4 mr-1" />
                Comment
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3 p-3 rounded-lg bg-secondary">
                <Avatar>
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {comment.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {comment.author.fullName || comment.author.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {currentUser?._id === comment.author._id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 text-sm">{comment.content}</p>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-6">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PostDetail;
