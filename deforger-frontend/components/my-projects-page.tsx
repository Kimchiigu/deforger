"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, DollarSign } from "lucide-react";
import { backendActor } from "@/utils/service/actor-locator";
import { Project } from "@/lib/types";

interface MyProjectsPageProps {
  userId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function MyProjectsPage({ userId, onNavigate }: MyProjectsPageProps) {
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const allProjectsResult = await backendActor.getAllProjects();
        const formattedProjects = allProjectsResult.map((p: any) => ({
          ...p,
          id: Number(p.id),
          pricePerShare: Number(p.pricePerShare) / 1e8,
          totalShares: Number(p.totalShares),
          availableShares: Number(p.availableShares),
        }));

        const filtered = formattedProjects.filter(
          (p: Project) => p.owner === userId || p.team.includes(userId)
        );
        setUserProjects(filtered);
      } catch (error) {
        console.error("Failed to fetch user projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProjects();
  }, [userId]);

  const ownedProjects = userProjects.filter((p) => p.owner === userId);
  const collaboratingProjects = userProjects.filter((p) => p.owner !== userId);

  if (isLoading) {
    return <div className="text-center p-10">Loading your projects...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          My Projects
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage and track your project portfolio
        </p>
      </div>

      {ownedProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Owned Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ownedProjects.map((project) => (
              <Card
                key={project.id}
                className="glass hover:glass-strong transition-all"
              >
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 pt-2">
                    {project.vision}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{project.team.length} members</span>
                    </div>
                    {project.isTokenized && (
                      <Badge
                        variant="outline"
                        className="border-green-500/50 text-green-400"
                      >
                        Tokenized
                      </Badge>
                    )}
                  </div>
                  {project.isTokenized && (
                    <div className="space-y-2">
                      <Progress
                        value={
                          ((project.totalShares - project.availableShares) /
                            project.totalShares) *
                          100
                        }
                        className="h-2"
                      />
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {project.pricePerShare.toFixed(4)} ICP per share
                        </span>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={() =>
                      onNavigate("project-detail", { projectId: project.id })
                    }
                    className="w-full"
                    variant="outline"
                  >
                    Manage Project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {collaboratingProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Collaborating Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {collaboratingProjects.map((project) => (
              <Card
                key={project.id}
                className="glass hover:glass-strong transition-all"
              >
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 pt-2">
                    {project.vision}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{project.team.length} members</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-blue-500/50 text-blue-400"
                    >
                      Team Member
                    </Badge>
                  </div>
                  <Button
                    onClick={() =>
                      onNavigate("project-detail", { projectId: project.id })
                    }
                    className="w-full"
                    variant="outline"
                  >
                    View Project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isLoading && userProjects.length === 0 && (
        <Card className="glass text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first project or joining existing ones
            </p>
            <Button onClick={() => onNavigate("create-project")}>
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
