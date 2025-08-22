"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getUserShareholdings } from "@/lib/mock-data"
import { MarketOverview } from "./market-overview"
import { TrendingUp, DollarSign, PieChart } from "lucide-react"

interface PortfolioPageProps {
  userId: string
  onNavigate: (page: string, projectId?: number) => void
}

export function PortfolioPage({ userId, onNavigate }: PortfolioPageProps) {
  const shareholdings = getUserShareholdings(userId)
  const totalValue = shareholdings.reduce((acc, holding) => acc + holding.shares * holding.project.pricePerShare, 0)
  const totalShares = shareholdings.reduce((acc, holding) => acc + holding.shares, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Portfolio
        </h1>
        <p className="text-muted-foreground mt-2 pb-4">
          Track your token holdings and market performance
        </p>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardDescription>Total Value</CardDescription>
            <CardTitle className="text-2xl">${totalValue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+8.5% (24h)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardDescription>Total Shares</CardDescription>
            <CardTitle className="text-2xl">
              {totalShares.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <PieChart className="w-4 h-4" />
              <span>{shareholdings.length} projects</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardDescription>Best Performer</CardDescription>
            <CardTitle className="text-lg">NFT Marketplace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+15.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/40">
          <CardHeader className="pb-2">
            <CardDescription>Avg. Return</CardDescription>
            <CardTitle className="text-2xl">+12.3%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <span>Since inception</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <div className="container mx-auto py-8">
        <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
        <MarketOverview />
      </div>

      {/* Holdings */}
      {shareholdings.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Holdings</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {shareholdings.map(({ project, shares }) => {
              const value = shares * project.pricePerShare;
              const percentage = (shares / project.totalShares) * 100;

              return (
                <Card
                  key={project.id}
                  className="bg-card/50 backdrop-blur-sm border-border/40 hover:bg-card/70 transition-all duration-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              project.type === "startup"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {project.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-green-500/50 text-green-400"
                          >
                            {percentage.toFixed(2)}% owned
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          ${value.toFixed(2)}
                        </div>
                        <div className="text-sm text-green-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +5.2%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Shares Owned
                        </span>
                        <div className="font-medium">
                          {shares.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Price per Share
                        </span>
                        <div className="font-medium">
                          ${project.pricePerShare}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => onNavigate("project-detail", project.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        View Project
                      </Button>
                      <Button variant="outline" size="sm">
                        <DollarSign className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="bg-card/50 backdrop-blur-sm border-border/40 text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">No Holdings Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start investing in tokenized projects to build your portfolio
            </p>
            <Button onClick={() => onNavigate("projects")}>
              Browse Projects
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
