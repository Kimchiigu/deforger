"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { backendActor } from "@/utils/service/actor-locator";
import { RoleRequirement } from "@/lib/types";

interface CreateProjectPageProps {
  onBack: () => void;
  onCreateProject: (project: any) => void;
}

export function CreateProjectPage({
  onBack,
  onCreateProject,
}: CreateProjectPageProps) {
  const [name, setName] = useState("");
  const [vision, setVision] = useState("");
  const [roles, setRoles] = useState<RoleRequirement[]>([]);
  const [currentRoleName, setCurrentRoleName] = useState("");
  const [currentSkill, setCurrentSkill] = useState("");
  const [currentRoleSkills, setCurrentRoleSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSkillToRole = () => {
    if (
      currentSkill.trim() &&
      !currentRoleSkills.includes(currentSkill.trim())
    ) {
      setCurrentRoleSkills([...currentRoleSkills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkillFromRole = (skillToRemove: string) => {
    setCurrentRoleSkills(
      currentRoleSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleAddRole = () => {
    if (currentRoleName.trim() && currentRoleSkills.length > 0) {
      setRoles([
        ...roles,
        {
          roleName: currentRoleName.trim(),
          requiredSkills: currentRoleSkills,
        },
      ]);
      setCurrentRoleName("");
      setCurrentRoleSkills([]);
    }
  };

  const handleRemoveRole = (roleNameToRemove: string) => {
    setRoles(roles.filter((role) => role.roleName !== roleNameToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !vision || roles.length === 0) {
      alert("Please fill in all fields and add at least one role.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("sessionToken");
      if (!token) {
        alert("You must be logged in to create a project.");
        setIsSubmitting(false);
        return;
      }

      const newProjectId = await backendActor.createProject(
        token,
        name,
        vision,
        roles
      );
      console.log("Project created with ID:", newProjectId);

      // You can call a refresh function passed via props or just navigate back
      onCreateProject({
        id: Number(newProjectId),
        name,
        vision,
        openRoles: roles,
      });
      onBack();
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Error: Could not create the project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            ← Back to Projects
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Create New Project
          </h1>
          <p className="text-muted-foreground mt-2">
            Launch your vision and build your team on the blockchain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Decentralized AI Marketplace"
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="vision">Project Vision</Label>
                <Textarea
                  id="vision"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="Describe your project's goals, vision, and what you're building."
                  required
                  className="mt-2 min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Define Open Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role creation form */}
              <div className="p-4 border border-white/10 rounded-lg space-y-4">
                <Input
                  value={currentRoleName}
                  onChange={(e) => setCurrentRoleName(e.target.value)}
                  placeholder="Role Name (e.g., Frontend Developer)"
                />
                <div className="flex gap-2">
                  <Input
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Add a required skill (e.g., React)"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkillToRole();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkillToRole}
                    size="icon"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentRoleSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkillFromRole(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={handleAddRole}
                  className="w-full"
                >
                  Add Role
                </Button>
              </div>

              {/* List of added roles */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Added Roles
                </h4>
                {roles.map((role, index) => (
                  <div
                    key={index}
                    className="p-3 border border-white/20 rounded-lg flex justify-between items-start"
                  >
                    <div>
                      <p className="font-semibold">{role.roleName}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {role.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRole(role.roleName)}
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {roles.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    No roles added yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-primary text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Project..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
