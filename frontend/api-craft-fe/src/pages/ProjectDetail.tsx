import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, X, Loader2, Calendar, GitCommit, Users as UsersIcon } from "lucide-react";
import { projectsAPI, usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [updateContent, setUpdateContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [collaboratorDialogOpen, setCollaboratorDialogOpen] = useState(false);

  const { data: project, isLoading, refetch } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const response = await projectsAPI.getById(id!);
      return response.project;
    },
  });

  const { data: searchResults } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { users: [] };
      const response = await usersAPI.search(searchQuery);
      return response;
    },
    enabled: searchQuery.length > 0,
  });

  const addUpdateMutation = useMutation({
    mutationFn: async (content: string) => {
      return await projectsAPI.addUpdate(id!, content);
    },
    onSuccess: () => {
      toast({ title: t("project.updateAdded"), description: t("project.updateAddedSuccess") });
      setUpdateContent("");
      refetch();
    },
    onError: () => {
      toast({ title: t("project.error"), description: t("project.updateError"), variant: "destructive" });
    },
  });

  const addCollaboratorMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await projectsAPI.addCollaborator(id!, userId);
    },
    onSuccess: () => {
      toast({ title: t("project.collaboratorAdded"), description: t("project.collaboratorAddedSuccess") });
      setSearchQuery("");
      setCollaboratorDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast({ title: t("project.error"), description: error.message, variant: "destructive" });
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await projectsAPI.removeCollaborator(id!, userId);
    },
    onSuccess: () => {
      toast({ title: t("project.collaboratorRemoved"), description: t("project.collaboratorRemovedSuccess") });
      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">{t("project.notFound")}</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    done: { label: t("project.statusDone"), className: "bg-green-500 hover:bg-green-600" },
    "in-progress": { label: t("project.statusInProgress"), className: "bg-orange-500 hover:bg-orange-600" },
    future: { label: t("project.statusFuture"), className: "bg-blue-500 hover:bg-blue-600" },
  };

  const status = statusConfig[project.status];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("project.backToDashboard")}
        </Button>

        <div className="space-y-6">
          {/* Project Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{project.title}</CardTitle>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={project.owner.avatar} />
                      <AvatarFallback>{project.owner.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{project.owner.fullName || project.owner.username}</span>
                    <span>•</span>
                    <Calendar className="h-4 w-4" />
                    <span>{t("project.created")} {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                <Badge className={status.className}>{status.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>

          {/* Collaborators */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  {t("project.collaborators")}
                </CardTitle>
                <Dialog open={collaboratorDialogOpen} onOpenChange={setCollaboratorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {t("project.addCollaborator")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("project.addCollaborator")}</DialogTitle>
                      <DialogDescription>{t("project.searchUsers")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder={t("project.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchResults?.users && searchResults.users.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {searchResults.users.map((user: any) => (
                            <div key={user._id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.fullName || user.username}</p>
                                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addCollaboratorMutation.mutate(user._id)}
                                disabled={addCollaboratorMutation.isPending}
                              >
                                {t("project.add")}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {project.collaborators.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t("project.noCollaborators")}</p>
              ) : (
                <div className="space-y-2">
                  {project.collaborators.map((collab) => (
                    <div key={collab._id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={collab.avatar} />
                          <AvatarFallback>{collab.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{collab.fullName || collab.username}</p>
                          <p className="text-sm text-muted-foreground">@{collab.username}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCollaboratorMutation.mutate(collab._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Updates Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCommit className="h-5 w-5" />
                {t("project.timeline")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (updateContent.trim()) {
                    addUpdateMutation.mutate(updateContent);
                  }
                }}
                className="mb-6"
              >
                <Textarea
                  placeholder={t("project.updatePlaceholder")}
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  rows={3}
                  className="mb-2"
                />
                <Button type="submit" disabled={!updateContent.trim() || addUpdateMutation.isPending}>
                  {addUpdateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("project.adding")}
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("project.addUpdate")}
                    </>
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              {project.updates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t("project.noUpdates")}</p>
              ) : (
                <div className="space-y-4">
                  {[...project.updates].reverse().map((update, index) => (
                    <div key={update._id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {index < project.updates.length - 1 && (
                          <div className="flex-1 w-px bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className="text-sm font-medium">{update.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
