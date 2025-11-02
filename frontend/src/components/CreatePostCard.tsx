import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Image, Globe, Lock, X } from "lucide-react";
import { useState } from "react";
import { postsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import RichTextEditor from "./RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreatePostCardProps {
  onPostCreated?: () => void;
  currentUser?: { username: string; fullName?: string };
}

const CreatePostCard = ({ onPostCreated, currentUser }: CreatePostCardProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (images.length + newImages.length > 5) {
        toast({
          title: t("post.tooManyImages"),
          description: t("post.tooManyImagesDesc"),
          variant: "destructive",
        });
        return;
      }
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: t("common.error"),
        description: "Please fill in all fields",
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
      formData.append("tags", tags);
      images.forEach((image) => formData.append("images", image));

      await postsAPI.create(formData);

      toast({
        title: t("common.success"),
        description: t("post.postCreated"),
      });

      // Reset form
      setTitle("");
      setContent("");
      setVisibility("public");
      setTags("");
      setImages([]);

      if (onPostCreated) onPostCreated();
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("post.postFailed"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {currentUser?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Input
              placeholder={t("post.titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>
        </div>

        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder={t("post.contentPlaceholder")}
        />

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={t("post.tagsPlaceholder")}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <Select value={visibility} onValueChange={(v) => setVisibility(v as "public" | "private")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("post.public")}
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {t("post.private")}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <label htmlFor="image-upload">
            <Button type="button" variant="outline" size="sm" asChild>
              <span className="cursor-pointer">
                <Image className="mr-2 h-4 w-4" />
                {t("post.addImages")}
              </span>
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("post.posting") : t("post.post")}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreatePostCard;
