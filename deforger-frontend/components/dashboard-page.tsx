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
import { useAuth } from "@/contexts/auth-context";
import { backendActor } from "@/utils/service/actor-locator";
import { Project, AgentMatch, UserProfile } from "@/lib/types";

// Helper function to get user initials
const getInitials = (name: string = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("");

interface DashboardPageProps {
  onViewProject: (projectId: number) => void;
  onViewProfile: () => void;
}

export function DashboardPage({
  onViewProject,
  onViewProfile,
}: DashboardPageProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [agentMatches, setAgentMatches] = useState<AgentMatch[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]); // To display match names
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch all data in parallel
          const [projectsResult, matchesResult] = await Promise.all([
            backendActor.getAllProjects(),
            backendActor.getAllAgentMatches(),
          ]);

          // NOTE: Candid returns BigInt for Nat, so we need to convert them.
          const formattedProjects = projectsResult.map((p: any) => ({
            ...p,
            id: Number(p.id),
            totalShares: Number(p.totalShares),
            availableShares: Number(p.availableShares),
            pricePerShare: Number(p.pricePerShare),
            shareBalances: p.shareBalances.map(
              ([id, balance]: [string, bigint]) => [id, Number(balance)]
            ),
          }));

          const formattedMatches = matchesResult.map((m: any) => ({
            ...m,
            matchId: Number(m.matchId),
            projectId: Number(m.projectId),
            timestamp: new Date(Number(m.timestamp / 1000000n)).toISOString(), // Convert nanoseconds to ISO string
          }));

          setProjects(formattedProjects);
          setAgentMatches(formattedMatches.slice(0, 5)); // Get most recent 5

          // To display user names in "Recent Matches", we need to fetch their profiles.
          // This is a simplified approach. In a real app, you might want a dedicated canister method.
          const userIdsInMatches = new Set(
            formattedMatches.map((m: AgentMatch) => m.userId)
          );
          const userProfilePromises = Array.from(userIdsInMatches).map(
            (userId) => backendActor.getUserProfile(userId as string)
          );
          const userProfilesResults = await Promise.all(userProfilePromises);
          const validProfiles = userProfilesResults
            .flat()
            .filter((p) => p) as UserProfile[];
          setAllUsers(validProfiles);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold gradient-text mb-4">
          Welcome to DeForger
        </h1>
        <p className="text-muted-foreground mb-8">
          Please sign in to access your dashboard
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  // Filter data on the frontend
  const userProjects = projects.filter(
    (p) => p.owner === user.id || p.team.includes(user.id)
  );
  const userApplications = projects.flatMap((p) =>
    p.applications.filter((app) => app.applicant === user.id)
  );
  const userShareholdings = projects
    .filter(
      (p) => p.isTokenized && p.shareBalances.some(([id]) => id === user.id)
    )
    .map((project) => {
      const shareholding = project.shareBalances.find(([id]) => id === user.id);
      return { project, shares: shareholding ? shareholding[1] : 0 };
    });

  const totalPortfolioValue = userShareholdings.reduce(
    (total, holding) => total + holding.shares * holding.project.pricePerShare,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Here&apos;s what&apos;s happening in your decentralized workspace
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Projects</p>
                <p className="text-2xl font-bold text-foreground">
                  {userProjects.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Other stat cards... */}
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-2xl font-bold text-foreground">
                  {userApplications.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shareholdings</p>
                <p className="text-2xl font-bold text-foreground">
                  {userShareholdings.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalPortfolioValue.toFixed(2)} ETH
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Projects */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>Projects you own or are part of</CardDescription>
            </CardHeader>
            <CardContent>
              {userProjects.length > 0 ? (
                <div className="space-y-4">
                  {userProjects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-lg border border-white/10 hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground">
                          {project.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {project.isTokenized && (
                            <Badge
                              variant="secondary"
                              className="bg-accent/20 text-accent border-accent/30"
                            >
                              {" "}
                              Tokenized{" "}
                            </Badge>
                          )}
                          {project.owner === user.id && (
                            <Badge
                              variant="outline"
                              className="border-white/20"
                            >
                              {" "}
                              Owner{" "}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {project.vision}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{project.team.length} members</span>
                          <span>{project.openRoles.length} open roles</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewProject(project.id)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No projects yet. Start by exploring available projects!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Applications */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track your project applications</CardDescription>
            </CardHeader>
            <CardContent>
              {userApplications.length > 0 ? (
                <div className="space-y-4">
                  {userApplications.map((application) => {
                    const project = projects.find(
                      (p) => p.id === application.projectId
                    );
                    return (
                      <div
                        key={application.id}
                        className="p-4 rounded-lg border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground">
                            {project?.name}
                          </h3>
                          <Badge
                            variant={
                              application.status === "accepted"
                                ? "default"
                                : application.status === "rejected"
                                ? "destructive"
                                : "outline"
                            }
                            className={
                              application.status === "accepted"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : application.status === "rejected"
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : ""
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {application.message}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewProject(application.projectId)}
                        >
                          View Project
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No applications yet. Apply to projects that interest you!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-white font-medium">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {user.skills.slice(0, 3).map((skill, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs border-white/20"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {user.skills.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-white/20"
                    >
                      +{user.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                onClick={onViewProfile}
                className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* My Shareholdings */}
          {userShareholdings.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>My Shareholdings</CardTitle>
                <CardDescription>Your project investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userShareholdings.map((holding, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-foreground">
                          {holding.project.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {holding.shares} shares
                        </p>
                      </div>
                      <p className="text-xs text-accent">
                        {(
                          holding.shares * holding.project.pricePerShare
                        ).toFixed(3)}{" "}
                        ETH
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Agent Matches */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Recent Matches</CardTitle>
              <CardDescription>Latest AI-powered connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agentMatches.map((match) => {
                  const project = projects.find(
                    (p) => p.id === match.projectId
                  );
                  const matchedUser = allUsers.find(
                    (u) => u.id === match.userId
                  );
                  return (
                    <div
                      key={match.matchId}
                      className="p-3 rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {getInitials(matchedUser?.name)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {matchedUser?.name || "Unknown User"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Matched as {match.roleFilled}
                      </p>
                      <p className="text-xs text-accent">{project?.name}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
