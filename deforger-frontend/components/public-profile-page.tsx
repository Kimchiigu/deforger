"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { backendActor } from "@/utils/service/actor-locator";
import { Project, UserProfile } from "@/lib/types";

interface PublicProfilePageProps {
  userId: string;
  onBack: () => void;
  onNavigate: (page: string, data?: any) => void;
}

export function PublicProfilePage({
  userId,
  onBack,
  onNavigate,
}: PublicProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const profileResult = await backendActor.getUserProfile(userId);
        if (profileResult.length > 0) {
          setProfile(profileResult[0] as UserProfile);
        } else {
          throw new Error("User not found");
        }

        const allProjectsResult = await backendActor.getAllProjects();
        const formattedProjects = allProjectsResult.map((p: any) => ({
          ...p,
          id: Number(p.id),
        }));

        const filtered = formattedProjects.filter(
          (p: Project) => p.owner === userId || p.team.includes(userId)
        );
        setUserProjects(filtered);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (isLoading) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center p-10">User not found.</div>;
  }

  const ownedProjects = userProjects.filter((p) => p.owner === profile.id);
  const collaboratingProjects = userProjects.filter(
    (p) => p.owner !== profile.id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Search
      </Button>

      <div className="max-w-7xl mx-auto">
        <Card className="glass mb-8">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <CardTitle className="text-2xl gradient-text">
              {profile.name}
            </CardTitle>
            <CardDescription className="text-lg">
              {profile.role}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Column */}
          <div className="lg:col-span-1 space-y-8">
            <h2 className="text-2xl font-bold gradient-text">Projects</h2>
            {userProjects.length > 0 ? (
              <div className="space-y-6">
                {ownedProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="glass hover:glass-strong transition-all"
                  >
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2 pt-1">
                        {project.vision}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() =>
                          onNavigate("project-detail", {
                            projectId: project.id,
                          })
                        }
                        className="w-full"
                        variant="outline"
                      >
                        View Project
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {collaboratingProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="glass hover:glass-strong transition-all"
                  >
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className="border-blue-500/50 text-blue-400 w-fit mt-2"
                      >
                        Team Member
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() =>
                          onNavigate("project-detail", {
                            projectId: project.id,
                          })
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
            ) : (
              <Card className="glass text-center py-12">
                <CardContent>
                  <h3 className="text-lg font-semibold">No Projects Yet</h3>
                  <p className="text-muted-foreground">
                    This user hasn&apos;t joined or created any projects.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Profile Details Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </Label>
                    <p className="text-foreground mt-1">{profile.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Username
                    </Label>
                    <p className="text-foreground mt-1">@{profile.username}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Role
                  </Label>
                  <p className="text-foreground mt-1">{profile.role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Skills
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                {profile.portfolioUrl && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Portfolio
                    </Label>
                    <p className="text-foreground mt-1">
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 transition-colors"
                      >
                        {profile.portfolioUrl}
                      </a>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
