"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Search,
  Users,
  Coins,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export function HowItWorksPage() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create Your On-Chain Profile",
      description:
        "Sign up on DeForger. Whether you're an innovator with an idea or a professional with skills, you'll create a secure, decentralized profile.",
      behindScenes:
        "Your identity and data are stored on the Internet Computer, giving you full ownership.",
      features: [
        "Secure blockchain identity",
        "Immutable reputation system",
        "Full data ownership",
      ],
    },
    {
      number: "02",
      icon: Search,
      title: "Discover & Connect",
      description:
        "Post your project vision and specify roles you need, or browse opportunities that match your skills. Our AI agents work 24/7 to make perfect matches.",
      behindScenes:
        "Fetch.ai agents continuously scan and match project requirements with professional profiles.",
      features: [
        "AI-powered matching",
        "Real-time notifications",
        "Smart recommendations",
      ],
    },
    {
      number: "03",
      icon: Users,
      title: "Collaborate with Confidence",
      description:
        "Apply to projects, accept offers, and join teams. All communications and agreements are recorded on-chain for ultimate transparency and trust.",
      behindScenes:
        "The ICP backend ensures that all interactions are immutable and auditable by project members.",
      features: [
        "Transparent agreements",
        "Immutable records",
        "Team collaboration tools",
      ],
    },
    {
      number: "04",
      icon: Coins,
      title: "Tokenize, Fund, and Grow",
      description:
        "Project owners can tokenize their project to raise funds. Investors and team members can buy shares, gaining ownership and supporting growth.",
      behindScenes:
        "The platform manages tokenized shares as Real World Assets (RWAs) on the ICP ledger, ensuring clear ownership records.",
      features: [
        "Project tokenization",
        "Transparent ownership",
        "Investment opportunities",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            From Idea to Investment
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">
            in Four Simple Steps
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            DeForger makes building and joining decentralized projects
            straightforward. Follow our simple workflow to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 md:space-y-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute left-8 top-24 w-0.5 h-32 bg-gradient-to-b from-purple-600/50 to-indigo-600/50" />
              )}

              <Card className="group relative overflow-hidden border-border/40 bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-all duration-300">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    {/* Step Number and Icon */}
                    <div className="flex-shrink-0 flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                          {step.number}
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center">
                          <step.icon className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Behind the Scenes */}
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/40 mb-6">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Behind the Scenes
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {step.behindScenes}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {step.features.map((feature, featureIndex) => (
                          <Badge
                            key={featureIndex}
                            variant="secondary"
                            className="bg-purple-600/10 text-purple-600 border-purple-600/20"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Arrow for larger screens */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:flex items-center justify-center">
                        <ArrowRight className="w-6 h-6 text-purple-600/50" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="border-border/40 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 backdrop-blur-xl">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the decentralized future of work and innovation. Create
                your profile and start building today.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
