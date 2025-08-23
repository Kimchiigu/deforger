"use client"

import type React from "react"

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { backendActor } from "@/utils/service/actor-locator";

interface UserProfilePageProps {
  onBack: () => void
}

export function UserProfilePage({ onBack }: UserProfilePageProps) {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    role: user?.role || "",
    skills: user?.skills.join(", ") || "",
    portfolioUrl: user?.portfolioUrl || "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!user) {
    return <div>Please sign in to view your profile</div>;
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("sessionToken");
    if (!token) return showMessage('error', 'Authentication error.');

    try {
      const skillsArray = formData.skills.split(",").map(s => s.trim()).filter(Boolean);
      const success = await backendActor.updateUserProfile(
        token,
        formData.name,
        formData.role,
        skillsArray,
        formData.portfolioUrl
      );

      if (success) {
        showMessage('success', 'Profile updated successfully!');
        // Ideally, refresh user state from auth context
        // For now, we assume the parent component will handle it or a page refresh will occur.
        setIsEditing(false);
      } else {
        showMessage('error', 'Failed to update profile.');
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showMessage('error', 'An error occurred.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordData.newPassword !== passwordData.confirmPassword) {
          return showMessage('error', "Passwords do not match.");
      }
      if (passwordData.newPassword.length < 6) {
          return showMessage('error', "Password must be at least 6 characters.");
      }

      const token = localStorage.getItem("sessionToken");
      if (!token) return showMessage('error', 'Authentication error.');

      try {
          const success = await backendActor.changePassword(token, passwordData.newPassword);
          if (success) {
              showMessage('success', 'Password changed successfully!');
              setPasswordData({ newPassword: "", confirmPassword: "" });
          } else {
              showMessage('error', 'Failed to change password.');
          }
      } catch (error) {
          console.error("Password change error:", error);
          showMessage('error', 'An error occurred.');
      }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      role: user.role,
      skills: user.skills.join(", "),
      portfolioUrl: user.portfolioUrl,
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </Button>

      <div className="max-w-2xl mx-auto">
        {message && (
          <div
            className={`fixed top-20 right-4 z-50 p-4 rounded-lg glass-strong border ${
              message.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Profile Header */}
        <Card className="glass mb-8">
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <CardTitle className="text-2xl gradient-text">
              {isEditing ? formData.name : user.name}
            </CardTitle>
            <CardDescription className="text-lg">
              {isEditing ? formData.role : user.role}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Profile Information */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal information and skills
                </CardDescription>
              </div>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="gradient-primary text-white hover:opacity-90 transition-opacity"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
                <Input
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Your professional role"
                />
                <Textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="React, TypeScript, etc."
                />
                <Input
                  name="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange}
                  placeholder="https://your-portfolio.com"
                />
                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleSaveProfile} className="flex-1">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </Label>
                    <p className="text-foreground mt-1">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Username
                    </Label>
                    <p className="text-foreground mt-1">@{user.username}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Role
                  </Label>
                  <p className="text-foreground mt-1">{user.role}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Skills
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-accent/30 text-accent"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Portfolio
                  </Label>
                  <p className="text-foreground mt-1">
                    <a
                      href={user.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent/80 transition-colors"
                    >
                      {user.portfolioUrl}
                    </a>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="glass mt-8">
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Change your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="glass mt-8">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20">
              <div>
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
