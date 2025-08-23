"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApplicationModal } from "@/components/application-modal";
import {
  TokenizationModal,
  TokenizationData,
} from "@/components/tokenization-modal";
import { ProjectChat } from "@/components/project-chat";
import { useAuth } from "@/contexts/auth-context";
import { RoleRequirement, Project, UserProfile } from "@/lib/types";
import { backendActor } from "@/utils/service/actor-locator";

interface ProjectDetailPageProps {
  projectId: number;
  onBack: () => void;
}

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<RoleRequirement | null>(
    null
  );
  const [shareAmount, setShareAmount] = useState("");
  const [showTokenizationModal, setShowTokenizationModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const { user } = useAuth();

  const fetchProjectData = async () => {
    try {
      const projectResult = await backendActor.getProject(projectId);
      if (projectResult.length > 0) {
        const p = projectResult[0];
        const formattedProject = {
          ...p,
          id: Number(p.id),
          totalShares: Number(p.totalShares),
          availableShares: Number(p.availableShares),
          pricePerShare: Number(p.pricePerShare),
          shareBalances: p.shareBalances.map(
            ([id, balance]: [string, bigint]) => [id, Number(balance)]
          ),
        };
        setProject(formattedProject);

        // Fetch user profiles for team members and applicants
        const userIds = new Set([
          ...formattedProject.team,
          ...formattedProject.applications.map((a) => a.applicant),
          formattedProject.owner,
        ]);

        const userProfilePromises = Array.from(userIds).map((id) =>
          backendActor.getUserProfile(id)
        );
        const profiles = await Promise.all(userProfilePromises);
        setAllUsers(profiles.flat().filter((p) => p) as UserProfile[]);
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const showSuccess = (message: string) => {
    setShowSuccessMessage(message);
    setTimeout(() => setShowSuccessMessage(""), 3000);
  };

  const handleApply = async (message: string) => {
    const token = localStorage.getItem("sessionToken");
    if (!token || !selectedRole) {
      alert("You must be logged in to apply.");
      return;
    }
    try {
      const success = await backendActor.applyToProject(
        token,
        project!.id,
        message
      );
      if (success) {
        setShowSuccessMessage("Application submitted successfully!");
        fetchProjectData();
      } else {
        alert(
          "Application failed. You might already be on the team or have applied."
        );
      }
    } catch (error) {
      console.error("Application error:", error);
      alert("An error occurred during application.");
    } finally {
      setTimeout(() => setShowSuccessMessage(""), 3000);
    }
  };

  const handleReviewApplication = async (
    applicationId: number,
    accept: boolean
  ) => {
    const token = localStorage.getItem("sessionToken");
    if (!token) return alert("Authentication error.");
    try {
      const success = await backendActor.reviewApplication(
        token,
        applicationId,
        accept
      );
      if (success) {
        setShowSuccessMessage(
          `Application ${accept ? "accepted" : "rejected"}!`
        );
        fetchProjectData();
      } else {
        alert("Failed to review application.");
      }
    } catch (error) {
      console.error("Review error:", error);
    }
  };

  const handleTokenizeProject = async (tokenData: TokenizationData) => {
    const token = localStorage.getItem("sessionToken");
    if (!token || !project) return alert("Authentication error.");

    try {
      const priceInE8s = BigInt(Math.round(tokenData.pricePerShare * 1e8));

      const success = await backendActor.tokenizeProject(
        token,
        BigInt(project.id),
        BigInt(tokenData.totalShares),
        priceInE8s
      );
      if (success) {
        showSuccess("Project successfully tokenized!");
        fetchProjectData();
      } else {
        alert("Tokenization failed.");
      }
    } catch (error) {
      console.error("Tokenization error:", error);
    }
  };

  const handleBuyShares = async () => {
    const token = localStorage.getItem("sessionToken");
    const amount = Number.parseInt(shareAmount);
    if (!token || !project || !amount || amount <= 0)
      return alert("Invalid amount or authentication error.");

    try {
      // NOTE: In a real app, this would involve an ICP/ETH transfer.
      // Here, we simulate the logic as if the payment was confirmed.
      const success = await backendActor.buyShares(
        token,
        BigInt(project.id),
        BigInt(amount)
      );
      if (success) {
        showSuccess(`Successfully purchased ${amount} shares!`);
        setShareAmount("");
        fetchProjectData();
      } else {
        alert("Failed to buy shares. Not enough available or not tokenized.");
      }
    } catch (error) {
      console.error("Buy shares error:", error);
      alert("An error occurred while buying shares.");
    }
  };

  if (isLoading)
    return <div className="text-center p-10">Loading project...</div>;
  if (!project)
    return <div className="text-center p-10">Project not found</div>;

  const owner = allUsers.find((u) => u.id === project.owner);
  const teamMembers = allUsers.filter((u) => project.team.includes(u.id));
  const isOwner = user?.id === project.owner;
  const isTeamMember = user && project.team.includes(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-lg glass-strong border border-green-500/30 bg-green-500/10">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-green-400 text-sm">{showSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* Back Button */}
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
        Back to Projects
      </Button>

      {/* Project Header */}
      <div className="glass p-8 rounded-lg mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              {project.name}
            </h1>
            <p className="text-muted-foreground">Created by {owner?.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            {project.isTokenized && (
              <Badge className="bg-accent/20 text-accent border-accent/30">
                Tokenized
              </Badge>
            )}
            <Badge variant="outline" className="border-white/20">
              {project.team.length} members
            </Badge>
          </div>
        </div>

        <p className="text-lg text-foreground/90 leading-relaxed">
          {project.vision}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Team Section */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open Roles Section */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Open Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.openRoles.map((role, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground">
                        {role.roleName}
                      </h3>
                      {user && !isTeamMember && (
                        <Button size="sm" onClick={() => setSelectedRole(role)}>
                          Apply
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.requiredSkills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Applications Section (Owner Only) */}
          {isOwner && project.applications.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.applications.map((application) => {
                    const applicant = allUsers.find(
                      (u) => u.id === application.applicant
                    );
                    return (
                      <div
                        key={application.id}
                        className="p-4 rounded-lg border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {applicant?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {applicant?.role}
                            </p>
                          </div>
                          <Badge
                            variant={
                              application.status === "accepted"
                                ? "default"
                                : "outline"
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 mb-3">
                          {application.message}
                        </p>
                        {application.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleReviewApplication(application.id, true)
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleReviewApplication(application.id, false)
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {isTeamMember && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Team Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectChat
                  projectId={projectId}
                  projectName={project.name}
                  teamMembers={project.team}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {project.isTokenized ? (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Project Shares</CardTitle>
                <CardDescription>
                  Invest in this project's success
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <h4 className="font-medium text-accent mb-3">
                    Market Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Market Cap</p>
                      <p className="font-semibold text-foreground text-wrap break-all">
                        {(
                          project.totalShares * project.pricePerShare
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        ICP
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price per Share</p>
                      <p className="font-semibold text-foreground">
                        {project.pricePerShare.toFixed(4)} ICP
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Available</p>
                      <p className="font-semibold text-foreground">
                        {project.availableShares.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Supply</p>
                      <p className="font-semibold text-foreground">
                        {project.totalShares.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="shares">Number of Shares</Label>
                  <Input
                    id="shares"
                    type="number"
                    value={shareAmount}
                    onChange={(e) => setShareAmount(e.target.value)}
                    placeholder="0"
                    max={project.availableShares}
                    min="1"
                  />
                  {shareAmount && (
                    <div className="p-3 rounded-lg bg-muted/20">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Total Cost:
                        </span>
                        <span className="font-semibold text-foreground">
                          {(
                            Number.parseInt(shareAmount) * project.pricePerShare
                          ).toFixed(4)}{" "}
                          ICP
                        </span>
                      </div>
                    </div>
                  )}
                  <Button
                    className="w-full gradient-primary text-white"
                    onClick={handleBuyShares}
                    disabled={
                      !shareAmount ||
                      Number.parseInt(shareAmount) <= 0 ||
                      Number.parseInt(shareAmount) > project.availableShares
                    }
                  >
                    Buy Shares
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            isOwner && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Tokenize Project</CardTitle>
                  <CardDescription>
                    Enable investment and shared ownership
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full gradient-primary text-white"
                    onClick={() => setShowTokenizationModal(true)}
                  >
                    Tokenize Project
                  </Button>
                </CardContent>
              </Card>
            )
          )}

          {/* Project Stats */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Team Size</span>
                <span className="font-medium">{project.team.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open Roles</span>
                <span className="font-medium">{project.openRoles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applications</span>
                <span className="font-medium">
                  {project.applications.length}
                </span>
              </div>
              {project.isTokenized && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-medium">
                    {(project.totalShares * project.pricePerShare).toFixed(1)}{" "}
                    ICP
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Modal */}
      {selectedRole && (
        <ApplicationModal
          isOpen={!!selectedRole}
          onClose={() => setSelectedRole(null)}
          role={selectedRole}
          projectName={project.name}
          onSubmit={handleApply}
        />
      )}

      <TokenizationModal
        isOpen={showTokenizationModal}
        onClose={() => setShowTokenizationModal(false)}
        projectName={project.name}
        onTokenize={handleTokenizeProject}
      />
    </div>
  );
}
