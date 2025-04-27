"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import {
  Globe,
  Mail,
  MapPin,
  Calendar,
  Award,
  BarChart,
  Settings,
  Plus,
  X,
  Save,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Available interests for selection
const availableInterests = [
  "Technology",
  "Politics",
  "Environment",
  "Education",
  "Culture",
  "Science",
  "Arts",
  "Health",
  "Business",
  "Sports",
];

// Language proficiency levels
const proficiencyLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "native", label: "Native" },
];

// Available languages
const availableLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "pt", name: "Portuguese" },
];

interface Language {
  code: string;
  name: string;
  proficiency: string;
}

interface FormData {
  name: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  preferredLanguage: string;
  interests: string[];
  avatar: string;
  password?: string;
  confirmPassword?: string;
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    location: user?.location || "",
    preferredLanguage: user?.preferredLanguage || "en",
    interests: user?.interests || [],
    avatar: user?.avatar || "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password if provided
    if (formData.password) {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }
    }
    
    try {
      // Create data object without confirmPassword
      const updateData = { ...formData };
      delete updateData.confirmPassword;
      
      // Remove password if it's empty
      if (!updateData.password) {
        delete updateData.password;
      }
      
      console.log("Sending profile update with data:", updateData);
      const response = await api.updateProfile(updateData);
      
      if (response.success) {
        toast.success("Profile updated successfully");
        if (formData.password) {
          toast.info("Password updated. Please log in again with your new password.");
        }
        setIsEditing(false);
        setUser(response.user);
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
      }
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
    }
  };

  // Early return if no user
  if (!user) {
    return (
      <DashboardLayout user={{
        _id: "",
        username: "",
        name: "",
        email: "",
        preferredLanguage: "en",
        bio: "",
        location: "",
        avatar: "",
        interests: [],
        socialLinks: {},
        rating: 0,
        debateStats: { won: 0, lost: 0, drawn: 0 },
        createdAt: "",
        lastActive: ""
      }}>
        <div className="flex items-center justify-center h-full">
          <p>Please log in to view your profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          {/* Profile Summary Card */}
          <Card className="h-fit">
            <CardHeader className="text-center">
              <Avatar className="mx-auto h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>@{user.username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{user.location || "Location not set"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{availableLanguages.find(l => l.code === user.preferredLanguage)?.name || "English"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Debate Statistics</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="font-medium">{user.debateStats.won}</div>
                    <div className="text-xs text-muted-foreground">Won</div>
                  </div>
                  <div>
                    <div className="font-medium">{user.debateStats.lost}</div>
                    <div className="text-xs text-muted-foreground">Lost</div>
                  </div>
                  <div>
                    <div className="font-medium">{user.debateStats.drawn}</div>
                    <div className="text-xs text-muted-foreground">Drawn</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile details</CardDescription>
                </div>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredLanguage">Preferred Language</Label>
                      <Select
                        value={formData.preferredLanguage}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLanguages.map((language) => (
                            <SelectItem key={language.code} value={language.code}>
                              {language.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Interests</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableInterests.map((interest) => (
                        <Badge
                          key={interest}
                          variant={formData.interests.includes(interest) ? "default" : "outline"}
                          className={isEditing ? "cursor-pointer" : undefined}
                          onClick={() => isEditing && handleInterestToggle(interest)}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Password fields - only shown while editing */}
                  {isEditing && (
                    <div className="space-y-4 pt-4 mt-4 border-t">
                      <div>
                        <CardTitle className="text-base mb-2">Change Password</CardTitle>
                        <CardDescription>Leave blank to keep your current password</CardDescription>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="password">New Password</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="New password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isEditing && (
                    <Button type="submit" className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 