import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { projectsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface CreateProjectCardProps {
  onProjectCreated?: () => void;
}

const CreateProjectCard = ({ onProjectCreated }: CreateProjectCardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "in-progress" as "done" | "in-progress" | "future",
    category: "business" as "business" | "team" | "killer",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: t("project.error"),
        description: t("project.fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await projectsAPI.create(formData);
      toast({
        title: t("project.created"),
        description: t("project.createdSuccess"),
      });
      setFormData({ title: "", description: "", status: "in-progress", category: "business" });
      setIsOpen(false);
      onProjectCreated?.();
    } catch (error) {
      toast({
        title: t("project.error"),
        description: t("project.createError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="w-full md:w-auto"
      >
        <Plus className="mr-2 h-5 w-5" />
        {t("project.createNew")}
      </Button>
    );
  }

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle>{t("project.createNew")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("project.title")}</Label>
            <Input
              id="title"
              placeholder={t("project.titlePlaceholder")}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("project.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("project.descriptionPlaceholder")}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isLoading}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t("project.status")}</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="done">{t("project.statusDone")}</SelectItem>
                <SelectItem value="in-progress">{t("project.statusInProgress")}</SelectItem>
                <SelectItem value="future">{t("project.statusFuture")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t("project.category")}</Label>
            <Select
              value={formData.category}
              onValueChange={(value: any) => setFormData({ ...formData, category: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">{t("project.categoryBusiness")}</SelectItem>
                <SelectItem value="team">{t("project.categoryTeam")}</SelectItem>
                <SelectItem value="killer">{t("project.categoryKiller")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("project.creating")}
                </>
              ) : (
                t("project.create")
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              {t("project.cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateProjectCard;
