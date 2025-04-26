"use client";

import type React from "react";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Globe, Camera, Upload, AlertCircle, Award, CheckCircle, MessageSquare, Users, UserCircle, Clock as ClockIcon, Languages as LanguagesIcon, Tag } from "lucide-react";
import { toast } from "sonner";

// Mock user data
const user = {
  id: "1",
  name: "John Doe",
  username: "johndoe",
  email: "john@example.com",
  bio: "Passionate about cross-cultural communication and learning new languages.",
  preferredLanguage: "en",
  location: "New York, USA",
  joinDate: "March 2023",
  avatar: "/avatars/john.png",
  interests: ["Technology", "Education", "Environment", "Cultural Exchange", "Politics"],
  languages: [
    { code: "en", name: "English", proficiency: "Native" },
    { code: "es", name: "Spanish", proficiency: "Intermediate" },
    { code: "fr", name: "French", proficiency: "Beginner" },
  ],
  statistics: {
    debatesParticipated: 24,
    debatesHosted: 5,
    totalConnections: 18,
    languagesInteractedWith: 8,
    wordsTranslated: 12500,
    totalHoursSpent: 36,
  },
  achievements: [
    {
      id: "1",
      title: "Global Communicator",
      description: "Participated in debates with people from 5+ countries",
      date: "April 2024",
      icon: Globe,
    },
    {
      id: "2",
      title: "Polyglot Novice",
      description: "Used 3 different languages in debates",
      date: "March 2024",
      icon: LanguagesIcon,
    },
    {
      id: "3",
      title: "Connection Builder",
      description: "Made 10+ connections",
      date: "February 2024",
      icon: Users,
    },
  ],
  notifications: {
    emailNotifications: true,
    newDebateInvitations: true,
    connectionRequests: true,
    debateReminders: true,
    weeklyNewsletter: false,
  },
  privacy: {
    showEmail: false,
    showLanguageProficiency: true,
    showLocation: true,
    allowConnectionRequests: true,
  },
};

// Available language proficiency levels
const proficiencyLevels = [
  "Beginner",
  "Elementary",
  "Intermediate",
  "Advanced",
  "Fluent",
  "Native",
];

// List of languages
const availableLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "ko", name: "Korean" },
  { code: "tr", name: "Turkish" },
  { code: "nl", name: "Dutch" },
];

// List of interests/topics
const availableInterests = [
  "Technology",
  "Education",
  "Environment",
  "Cultural Exchange",
  "Politics",
  "Science",
  "Arts",
  "Health",
  "Business",
  "Sports",
  "Food",
  "Travel",
  "Music",
  "Literature",
  "History",
  "Philosophy",
  "Religion",
  "Social Issues",
];

export default function ProfilePage() {
  // Form state
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    preferredLanguage: user.preferredLanguage,
    location: user.location,
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests);
  const [userLanguages, setUserLanguages] = useState(user.languages);
  const [newLanguage, setNewLanguage] = useState("");
  const [newProficiency, setNewProficiency] = useState("Beginner");
  const [notifications, setNotifications] = useState(user.notifications);
  const [privacySettings, setPrivacySettings] = useState(user.privacy);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle interest toggle
  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Handle language addition
  const handleAddLanguage = () => {
    if (!newLanguage) return;

    const existingLanguage = userLanguages.find(lang => lang.code === newLanguage);
    if (existingLanguage) {
      toast.error("You've already added this language");
      return;
    }

    const selectedLanguage = availableLanguages.find(lang => lang.code === newLanguage);
    if (selectedLanguage) {
      setUserLanguages([
        ...userLanguages,
        {
          code: selectedLanguage.code,
          name: selectedLanguage.name,
          proficiency: newProficiency,
        },
      ]);
      setNewLanguage("");
      toast.success(`${selectedLanguage.name} added to your languages`);
    }
  };

  // Handle language removal
  const handleRemoveLanguage = (code: string) => {
    setUserLanguages(userLanguages.filter((lang) => lang.code !== code));
  };

  // Handle notification toggle
  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle privacy toggle
  const handlePrivacyToggle = (key: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, this would be an API call to update the user profile
    toast.success("Profile updated successfully");
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information and how others see you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-2xl">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Change avatar</span>
                    </Button>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Member since {user.joinDate}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                      {user.languages.map((language) => (
                        <Badge key={language.code} variant="secondary">
                          {language.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell others about yourself..."
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="preferredLanguage">Preferred Language</Label>
                    <Select
                      value={formData.preferredLanguage}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}
                    >
                      <SelectTrigger id="preferredLanguage">
                        <SelectValue placeholder="Select your preferred language" />
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
                </form>
              </CardContent>
              <CardFooter className="flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
                <div className="text-sm text-muted-foreground">
                  <AlertCircle className="mr-1 inline-block h-3 w-3" />
                  Your profile is visible to other Langlobe users
                </div>
                <Button onClick={handleSubmit}>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
                <CardDescription>
                  Your activity on Langlobe so far
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="flex flex-col rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      Debates Participated
                    </div>
                    <div className="mt-2 flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        {user.statistics.debatesParticipated}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      Debates Hosted
                    </div>
                    <div className="mt-2 flex items-center">
                      <UserCircle className="mr-2 h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        {user.statistics.debatesHosted}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      Connections
                    </div>
                    <div className="mt-2 flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        {user.statistics.totalConnections}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      Languages Interacted With
                    </div>
                    <div className="mt-2 flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        {user.statistics.languagesInteractedWith}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      Words Translated
                    </div>
                    <div className="mt-2 flex items-center">
                      <LanguagesIcon className="mr-2 h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        {user.statistics.wordsTranslated.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col rounded-lg border p-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      Total Hours Spent
                    </div>
                    <div className="mt-2 flex items-center">
                      <ClockIcon className="mr-2 h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        {user.statistics.totalHoursSpent}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Languages Tab */}
          <TabsContent value="languages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Language Proficiency</CardTitle>
                <CardDescription>
                  Manage the languages you speak and your proficiency level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {userLanguages.map((language) => (
                    <div
                      key={language.code}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{language.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {language.proficiency}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLanguage(language.code)}
                        disabled={language.code === user.preferredLanguage}
                      >
                        {language.code === user.preferredLanguage ? (
                          <span className="text-xs text-muted-foreground">Primary Language</span>
                        ) : (
                          "Remove"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Add New Language</h3>
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                    <div>
                      <Label htmlFor="new-language">Language</Label>
                      <Select value={newLanguage} onValueChange={setNewLanguage}>
                        <SelectTrigger id="new-language">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLanguages
                            .filter(
                              (lang) =>
                                !userLanguages.some((userLang) => userLang.code === lang.code)
                            )
                            .map((language) => (
                              <SelectItem key={language.code} value={language.code}>
                                {language.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="proficiency">Proficiency</Label>
                      <Select value={newProficiency} onValueChange={setNewProficiency}>
                        <SelectTrigger id="proficiency">
                          <SelectValue placeholder="Select proficiency" />
                        </SelectTrigger>
                        <SelectContent>
                          {proficiencyLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddLanguage} disabled={!newLanguage}>
                        Add Language
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interests Tab */}
          <TabsContent value="interests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Topics of Interest</CardTitle>
                <CardDescription>
                  Select topics you're interested in discussing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleInterestToggle(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit}>Save Interests</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>
                  Milestones you've reached on Langlobe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {user.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex flex-col items-center rounded-lg border p-4 text-center"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <achievement.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-1 font-semibold">{achievement.title}</h3>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Achieved on {achievement.date}
                      </p>
                    </div>
                  ))}

                  {/* Locked/unearned achievements */}
                  <div
                    className="flex flex-col items-center rounded-lg border border-dashed p-4 text-center opacity-60"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Award className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-semibold">Debate Master</h3>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Host 10 successful debates
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Progress: 5/10 debates hosted
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debate Invitations</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications for new debate invitations
                    </div>
                  </div>
                  <Switch
                    checked={notifications.newDebateInvitations}
                    onCheckedChange={() => handleNotificationToggle("newDebateInvitations")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Connection Requests</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications for connection requests
                    </div>
                  </div>
                  <Switch
                    checked={notifications.connectionRequests}
                    onCheckedChange={() => handleNotificationToggle("connectionRequests")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debate Reminders</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive reminders for upcoming debates
                    </div>
                  </div>
                  <Switch
                    checked={notifications.debateReminders}
                    onCheckedChange={() => handleNotificationToggle("debateReminders")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Newsletter</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive a weekly newsletter with new features and debates
                    </div>
                  </div>
                  <Switch
                    checked={notifications.weeklyNewsletter}
                    onCheckedChange={() => handleNotificationToggle("weeklyNewsletter")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit}>Save Notification Settings</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can see your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow other users to see your email address
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.showEmail}
                    onCheckedChange={() => handlePrivacyToggle("showEmail")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Language Proficiency</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow other users to see your language proficiency levels
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.showLanguageProficiency}
                    onCheckedChange={() => handlePrivacyToggle("showLanguageProficiency")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Location</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow other users to see your location
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.showLocation}
                    onCheckedChange={() => handlePrivacyToggle("showLocation")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Connection Requests</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow other users to send you connection requests
                    </div>
                  </div>
                  <Switch
                    checked={privacySettings.allowConnectionRequests}
                    onCheckedChange={() => handlePrivacyToggle("allowConnectionRequests")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSubmit}>Save Privacy Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
