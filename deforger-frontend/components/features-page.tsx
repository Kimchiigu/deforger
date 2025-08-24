"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Shield, Coins, User, MessageSquare, Zap } from "lucide-react";

export function FeaturesPage() {
  const features = [
    {
      icon: Bot,
      title: "Autonomous Talent Matchmaking",
      description:
        "Stop searching, start building. Our AI agent works 24/7 to connect your project with the perfect talent based on skills and roles. Professionals get matched with exciting opportunities that fit their expertise.",
      technology:
        "Powered by Fetch.ai's uAgents, which proactively scan on-chain project requirements and user profiles.",
      badge: "AI-Powered",
    },
    {
      icon: Shield,
      title: "Decentralized Collaboration Hub",
      description:
        "Build your team and manage your project in a transparent, censorship-resistant environment. All agreements, applications, and communications are recorded immutably on the blockchain.",
      technology:
        "Built on the Internet Computer (ICP) using Motoko canisters for secure, on-chain data storage and execution.",
      badge: "Blockchain",
    },
    {
      icon: Coins,
      title: "RWA Project Tokenization & Investment",
      description:
        "For founders: Raise capital directly by tokenizing your project's equity. For investors: Discover and invest in early-stage projects by purchasing tokenized shares (Real World Assets), becoming a true stakeholder.",
      technology:
        "On-chain share management system on ICP, providing a transparent ledger of ownership.",
      badge: "Tokenization",
    },
    {
      icon: User,
      title: "Secure & Sovereign On-Chain Identity",
      description:
        "Create a professional profile that you truly own. Your skills, experience, and contributions are part of an immutable on-chain record, building a verifiable reputation over time.",
      technology: "Custom account system on ICP with secure authentication.",
      badge: "Identity",
    },
    {
      icon: MessageSquare,
      title: "AI-Powered Platform Copilot",
      description:
        "Interact with the entire platform using natural language. Register, create a project, or buy shares just by chatting with your AI agent.",
      technology:
        "Integration between Fetch.ai agents and the ASI:ONE language model for function-calling and natural language understanding.",
      badge: "Natural Language",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              The Future of Decentralized Collaboration
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            DeForger combines the security of blockchain with the intelligence
            of AI agents to create a unique platform for building and investing
            in new ventures.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:gap-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-all duration-300"
            >
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                  {/* Icon and Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-8 h-8 text-purple-600" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-purple-600/10 text-purple-600 border-purple-600/20"
                    >
                      {feature.badge}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/40">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          Technology:
                        </span>{" "}
                        {feature.technology}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="border-border/40 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 backdrop-blur-xl">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Ready to Experience the Future?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of innovators and professionals who are already
                building the next generation of decentralized projects.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
