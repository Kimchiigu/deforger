"use client";

import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: {
    name: string;
    description: string;
    owner: string;
    roles: { role: string; skills: string[] }[];
  };
  onNavigate: () => void;
}

export function ProjectCardAI({ project, onNavigate }: ProjectCardProps) {
  return (
    <div
      onClick={onNavigate}
      className="p-3 my-2 rounded-lg bg-accent/20 border border-accent/30 cursor-pointer hover:bg-accent/30 transition-colors"
    >
      <h4 className="font-semibold text-sm text-accent">{project.name}</h4>
      <p className="text-xs text-muted-foreground mt-1 mb-2">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-1">
        {project.roles[0]?.skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="outline" className="text-xs">
            {skill}
          </Badge>
        ))}
        {project.roles[0]?.skills.length > 3 && (
          <Badge variant="outline" className="text-xs">
            + {project.roles[0]?.skills.length - 3} more
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">
          Click to view details
        </span>
        <svg
          className="w-4 h-4 text-accent"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
}
