"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, DollarSign, Calendar, Users } from "lucide-react"

interface CreateProjectPageProps {
  onBack: () => void
  onCreateProject: (project: any) => void
}

export function CreateProjectPage({ onBack, onCreateProject }: CreateProjectPageProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    timeline: "",
    skills: [] as string[],
    roles: [] as string[],
  })
  const [newSkill, setNewSkill] = useState("")
  const [newRole, setNewRole] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newProject = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      budget: Number.parseFloat(formData.budget) || 0,
      timeline: formData.timeline,
      skillsRequired: formData.skills,
      roles: formData.roles.map((role) => ({
        title: role,
        description: `${role} position for ${formData.title}`,
        skillsRequired: formData.skills.slice(0, 3),
        applications: 0,
      })),
      owner: "current-user",
      teamMembers: [],
      isTokenized: false,
      createdAt: new Date().toISOString(),
      status: "Open",
      category: "Development",
    }

    onCreateProject(newProject)
    onBack()
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const addRole = () => {
    if (newRole.trim() && !formData.roles.includes(newRole.trim())) {
      setFormData((prev) => ({
        ...prev,
        roles: [...prev.roles, newRole.trim()],
      }))
      setNewRole("")
    }
  }

  const removeRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r !== role),
    }))
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4 text-muted-foreground hover:text-foreground">
            ← Back to Projects
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Create New Project
          </h1>
          <p className="text-muted-foreground mt-2">Launch your project and connect with talented professionals</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your project title"
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project, goals, and requirements..."
                  required
                  className="mt-2 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget (USD)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData((prev) => ({ ...prev, budget: e.target.value }))}
                    placeholder="10000"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="timeline" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Timeline
                  </Label>
                  <Input
                    id="timeline"
                    value={formData.timeline}
                    onChange={(e) => setFormData((prev) => ({ ...prev, timeline: e.target.value }))}
                    placeholder="3 months"
                    required
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., React, Python, Design)"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Team Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Add a role (e.g., Frontend Developer, Designer)"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRole())}
                />
                <Button type="button" onClick={addRole} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.roles.map((role) => (
                  <Badge key={role} variant="outline" className="flex items-center gap-1">
                    {role}
                    <button type="button" onClick={() => removeRole(role)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
