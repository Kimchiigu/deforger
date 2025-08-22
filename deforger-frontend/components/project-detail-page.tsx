"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApplicationModal } from "@/components/application-modal"
import { TokenizationModal } from "@/components/tokenization-modal"
import { ProjectChat } from "@/components/project-chat"
import { useAuth } from "@/contexts/auth-context"
import type { RoleRequirement } from "@/lib/types"
import { mockUsers, mockProjects } from "@/lib/mock-data"

interface ProjectDetailPageProps {
  projectId: number
  onBack: () => void
}

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailPageProps) {
  const [selectedRole, setSelectedRole] = useState<RoleRequirement | null>(null)
  const [shareAmount, setShareAmount] = useState("")
  const [showTokenizationModal, setShowTokenizationModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState("")
  const { user } = useAuth()

  const project = mockProjects.find((p) => p.id === projectId)
  if (!project) return <div>Project not found</div>

  const owner = mockUsers.find((u) => u.id === project.owner)
  const teamMembers = mockUsers.filter((u) => project.team.includes(u.id))
  const isOwner = user?.id === project.owner
  const isTeamMember = user && project.team.includes(user.id)

  const handleApply = (message: string) => {
    console.log("Application submitted:", { projectId, role: selectedRole, message })
    setShowSuccessMessage("Application submitted successfully!")
    setTimeout(() => setShowSuccessMessage(""), 3000)
  }

  const handleBuyShares = () => {
    const amount = Number.parseInt(shareAmount)
    if (amount > 0 && amount <= project.availableShares) {
      console.log("Buying shares:", { projectId, amount, cost: amount * project.pricePerShare })
      setShowSuccessMessage(`Successfully purchased ${amount} shares!`)
      setShareAmount("")
      setTimeout(() => setShowSuccessMessage(""), 3000)
    }
  }

  const handleTokenizeProject = (tokenData: any) => {
    console.log("Tokenizing project:", { projectId, ...tokenData })
    setShowSuccessMessage("Project successfully tokenized!")
    setTimeout(() => setShowSuccessMessage(""), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 rounded-lg glass-strong border border-green-500/30 bg-green-500/10">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-400 text-sm">{showSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-6 text-muted-foreground hover:text-foreground">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </Button>

      {/* Project Header */}
      <div className="glass p-8 rounded-lg mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">{project.name}</h1>
            <p className="text-muted-foreground">Created by {owner?.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            {project.isTokenized && <Badge className="bg-accent/20 text-accent border-accent/30">Tokenized</Badge>}
            <Badge variant="outline" className="border-white/20">
              {project.team.length} members
            </Badge>
          </div>
        </div>

        <p className="text-lg text-foreground/90 leading-relaxed">{project.vision}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Team Section */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Current project contributors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-white font-medium">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
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
              <CardDescription>Join the team and help build the future</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.openRoles.map((role, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-white/10 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{role.roleName}</h3>
                      {user && !isTeamMember && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedRole(role)}
                          className="gradient-primary text-white hover:opacity-90 transition-opacity"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.requiredSkills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="border-white/20">
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
                <CardDescription>Review and manage project applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.applications.map((application) => {
                    const applicant = mockUsers.find((u) => u.id === application.applicant)
                    return (
                      <div key={application.id} className="p-4 rounded-lg border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">{applicant?.name}</p>
                            <p className="text-sm text-muted-foreground">{applicant?.role}</p>
                          </div>
                          <Badge
                            variant={application.status === "accepted" ? "default" : "outline"}
                            className={
                              application.status === "accepted"
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : ""
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/80 mb-3">{application.message}</p>
                        {application.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button size="sm" className="gradient-primary text-white">
                              Accept
                            </Button>
                            <Button size="sm" variant="outline">
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {isTeamMember && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Team Communication</CardTitle>
                <CardDescription>Collaborate with your team members in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectChat projectId={projectId} projectName={project.name} teamMembers={project.team} />
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
                <CardDescription>Invest in this project's success</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Market Overview */}
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <h4 className="font-medium text-accent mb-3">Market Overview</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Market Cap</p>
                      <p className="font-semibold text-foreground">
                        {(project.totalShares * project.pricePerShare).toFixed(1)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price per Share</p>
                      <p className="font-semibold text-foreground">{project.pricePerShare} ETH</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Available</p>
                      <p className="font-semibold text-foreground">{project.availableShares.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Supply</p>
                      <p className="font-semibold text-foreground">{project.totalShares.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Share Purchase */}
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
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-semibold text-foreground">
                          {(Number.parseInt(shareAmount) * project.pricePerShare).toFixed(3)} ETH
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ownership:</span>
                        <span className="font-semibold text-accent">
                          {((Number.parseInt(shareAmount) / project.totalShares) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
                  <Button
                    className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
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

                {/* Shareholder Benefits */}
                <div className="p-3 rounded-lg border border-white/10">
                  <h4 className="font-medium text-foreground mb-2">Shareholder Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Voting rights on project decisions</li>
                    <li>• Revenue sharing from project success</li>
                    <li>• Access to exclusive updates</li>
                    <li>• Tradeable on secondary markets</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            isOwner && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Tokenize Project</CardTitle>
                  <CardDescription>Enable investment and shared ownership</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <h4 className="font-medium text-accent mb-2">Why Tokenize?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Raise funding from global investors</li>
                      <li>• Create liquid markets for equity</li>
                      <li>• Incentivize community participation</li>
                      <li>• Enable transparent governance</li>
                    </ul>
                  </div>
                  <Button
                    className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
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
                <span className="font-medium">{project.applications.length}</span>
              </div>
              {project.isTokenized && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-medium">{(project.totalShares * project.pricePerShare).toFixed(1)} ETH</span>
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
  )
}
