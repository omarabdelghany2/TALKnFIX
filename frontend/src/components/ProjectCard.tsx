import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Users, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ProjectCardProps {
  project: {
    _id: string;
    owner: {
      _id: string;
      username: string;
      fullName?: string;
      avatar?: string;
    };
    title: string;
    description: string;
    status: "done" | "in-progress" | "future";
    collaborators: {
      _id: string;
      username: string;
      fullName?: string;
      avatar?: string;
    }[];
    updates: any[];
    createdAt: string;
    updatedAt: string;
  };
  onUpdate?: () => void;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { t } = useTranslation();

  const statusConfig = {
    done: { label: t("project.statusDone"), variant: "default" as const, className: "bg-green-500 hover:bg-green-600" },
    "in-progress": { label: t("project.statusInProgress"), variant: "secondary" as const, className: "bg-orange-500 hover:bg-orange-600" },
    future: { label: t("project.statusFuture"), variant: "outline" as const, className: "bg-blue-500 hover:bg-blue-600" },
  };

  const status = statusConfig[project.status];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="line-clamp-1">{project.title}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={project.owner.avatar} />
                <AvatarFallback>{project.owner.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{project.owner.fullName || project.owner.username}</span>
            </CardDescription>
          </div>
          <Badge className={status.className}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{t("project.updates", { count: project.updates.length })}</span>
          </div>
          
          {project.collaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-muted-foreground" />
              <div className="flex -space-x-2">
                {project.collaborators.slice(0, 3).map((collab) => (
                  <Avatar key={collab._id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={collab.avatar} />
                    <AvatarFallback className="text-xs">{collab.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                ))}
                {project.collaborators.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-[10px] font-medium">+{project.collaborators.length - 3}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{t("project.updated")} {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to={`/project/${project._id}`}>{t("project.viewDetails")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
