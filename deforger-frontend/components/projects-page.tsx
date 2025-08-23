"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/project-card";
import { backendActor } from "@/utils/service/actor-locator";
import { Project } from "@/lib/types";

interface ProjectsPageProps {
  onViewProject: (projectId: number) => void;
}

export function ProjectsPage({ onViewProject }: ProjectsPageProps) {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showTokenizedOnly, setShowTokenizedOnly] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsResult = await backendActor.getAllProjects();
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
        setAllProjects(formattedProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    allProjects.forEach((project) => {
      project.openRoles.forEach((role) => {
        role.requiredSkills.forEach((skill) => skills.add(skill));
      });
    });
    return Array.from(skills).sort();
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.vision.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) =>
          project.openRoles.some((role) => role.requiredSkills.includes(skill))
        );

      const matchesTokenization = !showTokenizedOnly || project.isTokenized;

      return matchesSearch && matchesSkills && matchesTokenization;
    });
  }, [searchQuery, selectedSkills, showTokenizedOnly, allProjects]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">
          Discover Projects
        </h1>
        <p className="text-muted-foreground text-lg">
          Find your next opportunity in the decentralized future
        </p>
      </div>

      <div className="glass p-6 rounded-lg mb-8 space-y-6">
        <div className="relative">
          <Input
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSkills([]);
                setShowTokenizedOnly(false);
                setSearchQuery("");
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
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
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Filter by Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => (
                <Badge
                  key={skill}
                  variant={
                    selectedSkills.includes(skill) ? "default" : "outline"
                  }
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

      <div className="mb-6">
        <p className="text-muted-foreground">
          Showing {filteredProjects.length} of {allProjects.length} projects
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading projects...</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={onViewProject}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-foreground mb-2">
                No projects found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
