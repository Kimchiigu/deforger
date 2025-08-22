"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProjectCard } from "@/components/project-card"
import { mockProjects } from "@/lib/mock-data"

interface ProjectsPageProps {
  onViewProject: (projectId: number) => void
}

export function ProjectsPage({ onViewProject }: ProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [showTokenizedOnly, setShowTokenizedOnly] = useState(false)

  // Get all unique skills from projects
  const allSkills = useMemo(() => {
    const skills = new Set<string>()
    mockProjects.forEach((project) => {
      project.openRoles.forEach((role) => {
        role.requiredSkills.forEach((skill) => skills.add(skill))
      })
    })
    return Array.from(skills).sort()
  }, [])

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.vision.toLowerCase().includes(searchQuery.toLowerCase())

      // Skills filter
      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) => project.openRoles.some((role) => role.requiredSkills.includes(skill)))

      // Tokenization filter
      const matchesTokenization = !showTokenizedOnly || project.isTokenized

      return matchesSearch && matchesSkills && matchesTokenization
    })
  }, [searchQuery, selectedSkills, showTokenizedOnly])

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">Discover Projects</h1>
        <p className="text-muted-foreground text-lg">Find your next opportunity in the decentralized future</p>
      </div>

      {/* Search and Filters */}
      <div className="glass p-6 rounded-lg mb-8 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSkills([])
                setShowTokenizedOnly(false)
                setSearchQuery("")
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>

          {/* Tokenization Filter */}
          <div>
            <Button
              variant={showTokenizedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTokenizedOnly(!showTokenizedOnly)}
              className={showTokenizedOnly ? "gradient-primary text-white" : ""}
            >
              Tokenized Projects Only
            </Button>
          </div>

          {/* Skills Filter */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Filter by Skills</p>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedSkills.includes(skill)
                      ? "bg-accent text-accent-foreground border-accent"
                      : "hover:border-accent/50"
                  }`}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          Showing {filteredProjects.length} of {mockProjects.length} projects
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onViewDetails={onViewProject} />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  )
}
