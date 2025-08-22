"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getUserProjects } from "@/lib/mock-data"
import { Star, Users, DollarSign, TrendingUp } from "lucide-react"

interface MyProjectsPageProps {
  userId: string
  onNavigate: (page: string, projectId?: number) => void
}

export function MyProjectsPage({ userId, onNavigate }: MyProjectsPageProps) {
  const userProjects = getUserProjects(userId)
  const ownedProjects = userProjects.filter((p) => p.owner === userId)
  const collaboratingProjects = userProjects.filter((p) => p.owner !== userId)

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          My Projects
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage and track your project portfolio
        </p>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-2xl">{userProjects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardDescription>Owned</CardDescription>
            <CardTitle className="text-2xl">{ownedProjects.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardDescription>Collaborating</CardDescription>
            <CardTitle className="text-2xl">
              {collaboratingProjects.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardDescription>Tokenized</CardDescription>
            <CardTitle className="text-2xl">
              {userProjects.filter((p) => p.isTokenized).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Owned Projects */}
      {ownedProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Owned Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ownedProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-card/50 backdrop-blur-sm border-border/40 hover:bg-card/70 transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            project.type === "startup" ? "default" : "secondary"
                          }
                        >
                          {project.type}
                        </Badge>
                        {project.isTokenized && (
                          <Badge
                            variant="outline"
                            className="border-green-500/50 text-green-400"
                          >
                            Tokenized
                          </Badge>
                        )}
                      </div>
                    </div>
                    {project.reviews && project.reviews.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {(
                            project.reviews.reduce(
                              (acc, r) => acc + r.rating,
                              0
                            ) / project.reviews.length
                          ).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.vision}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{project.team.length} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{project.openRoles.length} open roles</span>
                    </div>
                  </div>

                  {project.isTokenized && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Token Distribution</span>
                        <span>
                          {(
                            ((project.totalShares - project.availableShares) /
                              project.totalShares) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
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
                        <span>${project.pricePerShare} per share</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => onNavigate("project-detail", project.id)}
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

      {/* Collaborating Projects */}
      {collaboratingProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Collaborating Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {collaboratingProjects.map((project) => (
              <Card
                key={project.id}
                className="bg-card/50 backdrop-blur-sm border-border/40 hover:bg-card/70 transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            project.type === "startup" ? "default" : "secondary"
                          }
                        >
                          {project.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-blue-500/50 text-blue-400"
                        >
                          Team Member
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.vision}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{project.team.length} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Active</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => onNavigate("project-detail", project.id)}
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

      {userProjects.length === 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/40 text-center py-12">
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
