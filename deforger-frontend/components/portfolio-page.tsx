"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { backendActor } from "@/utils/service/actor-locator";
import { Project } from "@/lib/types";
import { MarketOverview } from "./market-overview";
import { TrendingUp, DollarSign, PieChart } from "lucide-react";

interface PortfolioPageProps {
  userId: string;
  onNavigate: (page: string, data?: any) => void;
}

interface Shareholding {
  project: Project;
  shares: number;
}

// Helper function to simulate a daily price change based on project ID
const getSimulatedDailyChange = (projectId: number) => {
  const seed = projectId * 3 + new Date().getDate();
  const change = (seed % 150) / 10 - 5; // Generates a number between -5.0 and +10.0
  return change;
};

export function PortfolioPage({ userId, onNavigate }: PortfolioPageProps) {
  const [shareholdings, setShareholdings] = useState<Shareholding[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const allProjectsResult = await backendActor.getAllProjects();
        const formattedProjects: Project[] = allProjectsResult.map(
          (p: any) => ({
            ...p,
            id: Number(p.id),
            pricePerShare: Number(p.pricePerShare) / 1e8,
            totalShares: Number(p.totalShares),
            // FIX IS HERE: Convert the share balance from BigInt to Number
            shareBalances: p.shareBalances.map(
              ([id, balance]: [string, bigint]) => [id, Number(balance)]
            ),
          })
        );

        const userHoldings = formattedProjects
          .filter(
            (p) =>
              p.isTokenized && p.shareBalances.some(([id]) => id === userId)
          )
          .map((project) => {
            const shareBalance = project.shareBalances.find(
              ([id]) => id === userId
            );
            return { project, shares: shareBalance ? shareBalance[1] : 0 };
          })
          .filter((holding) => holding.shares > 0);

        setShareholdings(userHoldings);
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [userId]);

  const totalValue = shareholdings.reduce(
    (acc, holding) => acc + holding.shares * holding.project.pricePerShare,
    0
  );
  const totalShares = shareholdings.reduce(
    (acc, holding) => acc + holding.shares,
    0
  );

  let portfolio24hChange = 0;
  let bestPerformer = { name: "N/A", change: 0 };

  if (shareholdings.length > 0) {
    const totalValueYesterday = shareholdings.reduce((acc, holding) => {
      const dailyChange = getSimulatedDailyChange(holding.project.id);
      const priceYesterday =
        holding.project.pricePerShare / (1 + dailyChange / 100);
      return acc + holding.shares * priceYesterday;
    }, 0);

    if (totalValueYesterday > 0) {
      portfolio24hChange =
        ((totalValue - totalValueYesterday) / totalValueYesterday) * 100;
    }

    shareholdings.forEach((holding) => {
      const change = getSimulatedDailyChange(holding.project.id);
      if (change > bestPerformer.change) {
        bestPerformer = { name: holding.project.name, change };
      }
    });
  }

  if (isLoading) {
    return <div className="text-center p-10">Loading your portfolio...</div>;
  }

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
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardDescription>Total Value</CardDescription>
            <CardTitle className="text-2xl">
              {totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ICP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`flex items-center gap-1 text-sm ${
                portfolio24hChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{portfolio24hChange.toFixed(1)}% (24h)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
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

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardDescription>Best Performer</CardDescription>
            <CardTitle className="text-lg truncate">
              {bestPerformer.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`flex items-center gap-1 text-sm ${
                bestPerformer.change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{bestPerformer.change.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-2">
            <CardDescription>Avg. Return</CardDescription>
            <CardTitle className="text-2xl">+9.7%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-green-500">
              <span>Since inception</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="container mx-auto py-8">
        <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
        <MarketOverview />
      </div>

      {shareholdings.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Holdings</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {shareholdings.map(({ project, shares }) => {
              const value = shares * project.pricePerShare;
              const percentage =
                project.totalShares > 0
                  ? (shares / project.totalShares) * 100
                  : 0;
              const dailyChange = getSimulatedDailyChange(project.id);

              return (
                <Card
                  key={project.id}
                  className="glass hover:glass-strong transition-all"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
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
                          {value.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          ICP
                        </div>
                        <div
                          className={`text-sm flex items-center gap-1 justify-end ${
                            dailyChange >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {dailyChange.toFixed(1)}%
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
                          {project.pricePerShare.toFixed(4)} ICP
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          onNavigate("project-detail", {
                            projectId: project.id,
                          })
                        }
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
        <Card className="glass text-center py-12">
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
