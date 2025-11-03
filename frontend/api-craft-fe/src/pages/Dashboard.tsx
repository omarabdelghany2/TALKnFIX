import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import CreateProjectCard from "@/components/CreateProjectCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projectsAPI, authAPI, usersAPI } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { Loader2, User, Users, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState<"all" | "done" | "in-progress" | "future">("all");
  const [viewMode, setViewMode] = useState<"all" | "my" | "user">("all");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await authAPI.getMe();
      return response.user;
    },
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectsAPI.getAll();
      return response.projects;
    },
  });

  const { data: userSearchResults } = useQuery({
    queryKey: ["userSearch", userSearchQuery],
    queryFn: async () => {
      if (!userSearchQuery.trim()) return { users: [] };
      const response = await usersAPI.search(userSearchQuery);
      return response;
    },
    enabled: userSearchQuery.length > 0 && viewMode === "user",
  });

  const filteredProjects = data?.filter((project) => {
    // Filter by status
    const statusMatch = selectedStatus === "all" ? true : project.status === selectedStatus;

    // Filter by owner or collaborator
    let ownerMatch = true;
    if (viewMode === "my" && currentUser) {
      // Check if user is owner OR collaborator
      const isOwner = project.owner._id === currentUser._id;
      const isCollaborator = project.collaborators?.some((collab: any) => collab._id === currentUser._id);
      ownerMatch = isOwner || isCollaborator;
    } else if (viewMode === "user" && selectedUserId) {
      // Check if selected user is owner OR collaborator
      const isOwner = project.owner._id === selectedUserId;
      const isCollaborator = project.collaborators?.some((collab: any) => collab._id === selectedUserId);
      ownerMatch = isOwner || isCollaborator;
    }

    return statusMatch && ownerMatch;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        {/* View Mode Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "all" ? "default" : "outline"}
              onClick={() => {
                setViewMode("all");
                setSelectedUserId("");
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              {t("dashboard.allProjects")}
            </Button>
            <Button
              variant={viewMode === "my" ? "default" : "outline"}
              onClick={() => {
                setViewMode("my");
                setSelectedUserId("");
              }}
            >
              <User className="mr-2 h-4 w-4" />
              {t("dashboard.myProjects")}
            </Button>
            <Button
              variant={viewMode === "user" ? "default" : "outline"}
              onClick={() => setViewMode("user")}
            >
              <Search className="mr-2 h-4 w-4" />
              {t("dashboard.userProjects")}
            </Button>
          </div>

          {viewMode === "user" && (
            <div className="flex-1 max-w-md w-full relative">
              <Input
                placeholder={t("dashboard.searchUserPlaceholder")}
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full"
              />
              {userSearchResults?.users && userSearchResults.users.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {userSearchResults.users.map((user: any) => (
                    <button
                      key={user._id}
                      onClick={() => {
                        setSelectedUserId(user._id);
                        setUserSearchQuery(user.fullName || user.username);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2"
                    >
                      <span className="font-medium">{user.fullName || user.username}</span>
                      <span className="text-sm text-muted-foreground">@{user.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <CreateProjectCard onProjectCreated={refetch} />

        <Tabs value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)} className="mt-8">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="all">{t("dashboard.all")}</TabsTrigger>
            <TabsTrigger value="done">{t("dashboard.done")}</TabsTrigger>
            <TabsTrigger value="in-progress">{t("dashboard.inProgress")}</TabsTrigger>
            <TabsTrigger value="future">{t("dashboard.future")}</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">{t("dashboard.noProjects")}</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project._id} project={project} onUpdate={refetch} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
