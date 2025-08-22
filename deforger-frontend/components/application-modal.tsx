"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RoleRequirement } from "@/lib/types"

interface ApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  role: RoleRequirement
  projectName: string
  onSubmit: (message: string) => void
}

export function ApplicationModal({ isOpen, onClose, role, projectName, onSubmit }: ApplicationModalProps) {
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    onSubmit(message)
    setMessage("")
    setIsSubmitting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass-strong w-full max-w-md">
        <CardHeader>
          <CardTitle className="gradient-text">Apply for Role</CardTitle>
          <CardDescription>
            {role.roleName} at {projectName}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Requirements */}
            <div>
              <Label className="text-sm font-medium">Required Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {role.requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="border-accent/30 text-accent">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Application Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Why are you interested in this role?</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your experience and why you'd be a great fit for this project..."
                rows={4}
                required
                className="resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 gradient-primary text-white hover:opacity-90 transition-opacity"
                disabled={isSubmitting || !message.trim()}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
