"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Project } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"

interface ProjectCardProps {
  project: Project
  onViewDetails: (projectId: number) => void
}

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const owner = mockUsers.find((user) => user.id === project.owner)
  const allRequiredSkills = project.openRoles.flatMap((role) => role.requiredSkills)
  const uniqueSkills = [...new Set(allRequiredSkills)].slice(0, 4) // Show max 4 skills

  return (
    <Card className="glass hover:glass-strong transition-all duration-300 group cursor-pointer border-white/10 hover:border-accent/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:gradient-text transition-all duration-300">
              {project.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              by {owner?.name || "Unknown"}
            </CardDescription>
          </div>
          {project.isTokenized && (
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
              Tokenized
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/80 line-clamp-3">{project.vision}</p>

        <div className="space-y-3">
          {/* Skills */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-1">
              {uniqueSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs border-white/20">
                  {skill}
                </Badge>
              ))}
              {allRequiredSkills.length > 4 && (
                <Badge variant="outline" className="text-xs border-white/20">
                  +{allRequiredSkills.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Team Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-muted-foreground">{project.team.length} members</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8"
                />
              </svg>
              <span className="text-muted-foreground">{project.openRoles.length} open roles</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onViewDetails(project.id)}
          className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
