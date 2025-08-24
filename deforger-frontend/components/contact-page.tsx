"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MessageSquare,
  Users,
  Newspaper,
  HeadphonesIcon,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

export function ContactPage() {
  const contactReasons = [
    {
      icon: MessageSquare,
      title: "General Questions",
      description: "If you want to know more about our platform",
    },
    {
      icon: Users,
      title: "Partnership Inquiries",
      description: "If you're interested in collaborating with us",
    },
    {
      icon: Newspaper,
      title: "Press & Media",
      description: "For media requests and interviews",
    },
    {
      icon: HeadphonesIcon,
      title: "Feedback & Support",
      description: "If you've encountered an issue or have an idea",
    },
  ];

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/Kimchiigu" },
    { name: "Twitter", icon: Twitter, href: "#" },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/in/christopher-hygunawan/",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Let&apos;s Connect
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We&apos;re excited to hear from you! Whether you have a question, a
            partnership proposal, or feedback on how we can improve DeForger,
            our team is ready to listen.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground">
                Send us a message
              </h2>
              <form className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="bg-background/50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    className="bg-background/50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    className="bg-background/50 min-h-[120px]"
                  />
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Primary Contact */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Primary Contact
                  </h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  For all inquiries, please reach out to us at:
                </p>
                <a
                  href="mailto:christopher.hygunawan@gmail.com"
                  className="text-lg font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                >
                  christopher.hygunawan@gmail.com
                </a>
              </CardContent>
            </Card>

            {/* What to Contact Us For */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  What to Contact Us For
                </h2>
                <div className="space-y-4">
                  {contactReasons.map((reason, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/40"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center flex-shrink-0">
                        <reason.icon className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {reason.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {reason.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Follow Our Journey
                </h2>
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="icon"
                      className="border-border/40 bg-background/50 hover:bg-purple-600/10 hover:text-white cursor-pointer"
                      onClick={() => window.open(social.href, "_blank")}
                    >
                      <social.icon className="w-4 h-4" />
                      <span className="sr-only">{social.name}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Stay updated with our latest developments and connect with our
                  community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
