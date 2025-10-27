import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Globe, Lock, X, ArrowLeft } from "lucide-react";
import { postsAPI, authAPI, getToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [tags, setTags] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/auth");
      return;
    }

    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load current user
      const userResponse = await authAPI.getMe();
      setCurrentUser(userResponse.user);

      // Load post data
      const postResponse = await postsAPI.getPost(id!);
      const post = postResponse.post;

      // Check if user owns this post
      if (post.author._id !== userResponse.user._id) {
        toast({
          title: t("common.error"),
          description: "You can only edit your own posts",
          variant: "destructive",
        });
        navigate(`/post/${id}`);
        return;
      }

      // Pre-populate form
      setTitle(post.title);
      setContent(post.content);
      setVisibility(post.visibility);
      setTags(post.tags?.join(", ") || "");
      setExistingImages(post.images || []);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || "Failed to load post",
        variant: "destructive",
      });
      navigate("/feed");
    } finally {
      setLoading(false);
    }
  };

  const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedImages = Array.from(e.target.files);
      const totalImages = existingImages.length + newImages.length + selectedImages.length;

      if (totalImages > 5) {
        toast({
          title: t("post.tooManyImages"),
          description: t("post.tooManyImagesDesc"),
          variant: "destructive",
        });
        return;
      }
      setNewImages([...newImages, ...selectedImages]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: t("post.missingInfo"),
        description: t("post.missingInfoDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("visibility", visibility);

      if (tags.trim()) {
        const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag);
        tagArray.forEach(tag => formData.append("tags[]", tag));
      }

      // Include existing images (by URLs)
      existingImages.forEach(img => {
        formData.append("existingImages[]", img);
      });

      // Include new images (as files)
      newImages.forEach(image => {
        formData.append("images", image);
      });

      await postsAPI.update(id!, formData);

      toast({
        title: t("common.success"),
        description: "Post updated successfully",
      });

      // Navigate with timestamp to force re-fetch
      navigate(`/post/${id}?updated=${Date.now()}`);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/post/${id}`)}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Post
          </Button>
          <h1 className="text-2xl font-bold">{t("post.editPost")}</h1>
        </div>

        <Card className="p-4">
          <div className="flex space-x-3">
            <Avatar>
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentUser?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Input
                placeholder={t("post.whatsTheIssue")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="font-semibold"
              />
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder={t("post.shareThoughts")}
              />

              {/* Tags Input */}
              <Input
                placeholder={t("post.tagsPlaceholder")}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="text-sm"
              />

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Images:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {existingImages.map((img, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${img}`}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => removeExistingImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Previews */}
              {newImages.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">New Images:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {newImages.map((img, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`New ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                    <label>
                      <Image className="h-4 w-4 mr-1" />
                      <span className="text-xs">{t("post.photo")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleNewImageSelect}
                        disabled={existingImages.length + newImages.length >= 5}
                      />
                    </label>
                  </Button>

                  <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-3 w-3" />
                          <span>{t("post.public")}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center space-x-2">
                          <Lock className="h-3 w-3" />
                          <span>{t("post.friends")}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/post/${id}`)}
                    size="sm"
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    size="sm"
                  >
                    {isSubmitting ? t("common.save") + "..." : t("common.save")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EditPost;
