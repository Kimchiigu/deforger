"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Target, Lightbulb, Code, Users, Award } from "lucide-react";

export function AboutPage() {
  const technologies = [
    {
      name: "Internet Computer (ICP)",
      description: "Decentralized backend infrastructure",
    },
    { name: "Fetch.ai", description: "Autonomous AI agent framework" },
    { name: "ASI:ONE", description: "Advanced language model integration" },
    { name: "Motoko", description: "Smart contract development" },
    { name: "Real World Assets", description: "Tokenized project ownership" },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Forging the Future of Work
            </h1>
          </div>
        </div>

        {/* Mission Section */}
        <Card className="mb-12 border-border/40 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  &quot;Our mission is to build a trustless and autonomous
                  ecosystem where innovation can thrive. We believe in
                  empowering creators and professionals by removing traditional
                  barriers in team formation and project funding.&quot;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Genesis Story */}
        <Card className="mb-12 border-border/40 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  The Genesis Story: Born from Innovation
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    &quot;DeForger was conceived and built during the NextGen AI
                    Agents Hackathon by ICP x Fetch.AI in 2025.&quot;
                  </p>
                  <p>
                    &quot;The challenge was to create a groundbreaking
                    application by merging the decentralized power of the
                    Internet Computer with the autonomous intelligence of
                    Fetch.ai agents.&quot;
                  </p>
                  <p>
                    &quot;We saw a clear opportunity to solve a real-world
                    problem: the friction and centralization in the talent and
                    startup ecosystem. DeForger is our solution.&quot;
                  </p>
                </div>
                <div className="mt-6">
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <Award className="w-4 h-4 mr-2" />
                    NextGen AI Agents Hackathon 2025
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Section */}
        <Card className="mb-12 border-border/40 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <Code className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Our Technology
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  &quot;We chose a cutting-edge stack to bring our vision to
                  life. The Internet Computer provides the secure, scalable, and
                  decentralized backend, while Fetch.ai gives our platform its
                  intelligence and autonomy. This powerful combination allows us
                  to create a truly unique and resilient platform.&quot;
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-muted/50 border border-border/40"
                    >
                      <h3 className="font-semibold text-foreground mb-2">
                        {tech.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {tech.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Values */}
        <Card className="border-border/40 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 backdrop-blur-xl">
          <CardContent className="p-8 md:p-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Users className="w-12 h-12 text-purple-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Building the Future Together
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                We believe in the power of decentralized collaboration, where
                innovation knows no boundaries and every contributor has a stake
                in the success. Join us in creating a more equitable and
                transparent future for work and entrepreneurship.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
