import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Image, Globe, Lock, X } from "lucide-react";
import { useState } from "react";
import { postsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
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
          title: t('post.tooManyImages'),
          description: t('post.tooManyImagesDesc'),
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

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: t('post.missingInfo'),
        description: t('post.missingInfoDesc'),
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

      images.forEach(image => {
        formData.append("images", image);
      });

      await postsAPI.create(formData);

      toast({
        title: t('common.success'),
        description: t('post.postCreated'),
      });

      // Reset form
      setTitle("");
      setContent("");
      setTags("");
      setImages([]);
      setVisibility("public");
      
      onPostCreated?.();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('post.postFailed'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex space-x-3">
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {currentUser?.username?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Input
            placeholder={t('post.whatsTheIssue')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="font-semibold"
          />
          <Textarea
            placeholder={t('post.shareThoughts')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
            rows={3}
            className="resize-none"
          />

          {/* Tags Input */}
          <Input
            placeholder={t('post.tagsPlaceholder')}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="text-sm"
          />

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild className="cursor-pointer">
                <label>
                  <Image className="h-4 w-4 mr-1" />
                  <span className="text-xs">{t('post.photo')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
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
                      <span>{t('post.public')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-3 w-3" />
                      <span>{t('post.friends')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !content.trim()}
              size="sm"
            >
              {isSubmitting ? t('post.posting') : t('post.post')}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CreatePostCard;
