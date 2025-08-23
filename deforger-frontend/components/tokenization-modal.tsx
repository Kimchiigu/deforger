"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TokenizationModalProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  onTokenize: (tokenData: TokenizationData) => void
}

export interface TokenizationData {
  totalShares: number
  pricePerShare: number
  ownerShares: number
}

export function TokenizationModal({ isOpen, onClose, projectName, onTokenize }: TokenizationModalProps) {
  const [formData, setFormData] = useState({
    totalShares: "10000",
    pricePerShare: "0.1",
    ownerShares: "5000",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    onTokenize({
      totalShares: Number.parseInt(formData.totalShares),
      pricePerShare: Number.parseFloat(formData.pricePerShare),
      ownerShares: Number.parseInt(formData.ownerShares),
    })

    setIsSubmitting(false)
    onClose()
  }

  const totalValue = Number.parseInt(formData.totalShares) * Number.parseFloat(formData.pricePerShare)
  const ownerValue = Number.parseInt(formData.ownerShares) * Number.parseFloat(formData.pricePerShare)
  const availableShares = Number.parseInt(formData.totalShares) - Number.parseInt(formData.ownerShares)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass-strong w-full max-w-lg">
        <CardHeader>
          <CardTitle className="gradient-text">Tokenize Project</CardTitle>
          <CardDescription>
            Transform {projectName} into a tradeable asset with shared ownership
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tokenization Benefits */}
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <h4 className="font-medium text-accent mb-2">
                Benefits of Tokenization
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enable community investment and shared ownership</li>
                <li>• Create liquid markets for project equity</li>
                <li>• Attract funding from global investors</li>
                <li>• Incentivize long-term collaboration</li>
              </ul>
            </div>

            {/* Token Configuration */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalShares">Total Shares</Label>
                  <Input
                    id="totalShares"
                    name="totalShares"
                    type="number"
                    value={formData.totalShares}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerShare">Price per Share (ICP)</Label>
                  <Input
                    id="pricePerShare"
                    name="pricePerShare"
                    type="number"
                    step="0.1"
                    value={formData.pricePerShare}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerShares">
                  Your Shares (as project owner)
                </Label>
                <Input
                  id="ownerShares"
                  name="ownerShares"
                  type="number"
                  value={formData.ownerShares}
                  onChange={handleInputChange}
                  max={formData.totalShares}
                  required
                />
              </div>
            </div>

            <div className="p-4 rounded-lg border border-white/10 space-y-3">
              <h4 className="font-medium text-foreground">
                Tokenization Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Market Cap</p>
                  <p className="font-semibold text-foreground">
                    {totalValue.toLocaleString()} ICP
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Your Holdings</p>
                  <p className="font-semibold text-foreground">
                    {ownerValue.toLocaleString()} ICP
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Available for Sale</p>
                  <p className="font-semibold text-foreground">
                    {availableShares.toLocaleString()} shares
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Your Ownership</p>
                  <p className="font-semibold text-foreground">
                    {(
                      (Number.parseInt(formData.ownerShares) /
                        Number.parseInt(formData.totalShares)) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-destructive mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Important Notice
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tokenization is irreversible. Once created, project tokens
                    will be governed by smart contracts and community decisions.
                  </p>
                </div>
              </div>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Tokens..." : "Tokenize Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
