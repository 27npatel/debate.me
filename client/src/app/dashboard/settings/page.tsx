"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Bell, Globe, Key, Lock, Mail, Shield, Smartphone, User, Trash2, Languages, Moon, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

// Mock user data for fallback
const mockUser = {
  _id: "1",
  username: "johndoe",
  name: "John Doe",
  email: "john@example.com",
  preferredLanguage: "en",
  bio: "Debate enthusiast",
  location: "New York",
  avatar: "",
  interests: ["Technology", "Politics"],
  socialLinks: {},
  rating: 4.5,
  debateStats: { won: 10, lost: 2, drawn: 3 },
  createdAt: "2024-01-01T00:00:00.000Z",
  lastActive: "2024-03-20T12:00:00.000Z"
};

export default function SettingsPage() {
  const { user } = useAuth();
  const currentUser = user || mockUser;

  // Account Settings
  const [accountForm, setAccountForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    username: user?.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    debateInvitations: true,
    debateReminders: true,
    connectionRequests: true,
    weeklyNewsletter: false,
    systemUpdates: true,
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    showLanguageProficiency: true,
    showLocation: true,
    allowConnectionRequests: true,
    publicProfile: true,
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    fontSize: "medium",
    reduceMotion: false,
    highContrast: false,
  });

  // Language Settings
  const [languageSettings, setLanguageSettings] = useState({
    appLanguage: "en",
    primaryTranslationLang: "en",
    autoTranslate: true,
    showOriginalText: true,
  });

  // Early return if no user
  if (!user) {
    return (
      <DashboardLayout user={mockUser}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Please log in</h1>
            <p className="text-muted-foreground">You need to be logged in to view settings.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Handle form input changes for account
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle notification toggle
  const handleNotificationToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success(`${key} ${notificationSettings[key] ? "disabled" : "enabled"}`);
  };

  // Handle privacy toggle
  const handlePrivacyToggle = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success(`${key} ${privacySettings[key] ? "disabled" : "enabled"}`);
  };

  // Handle appearance setting changes
  const handleAppearanceChange = (setting: string, value: string | boolean) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [setting]: value,
    }));

    if (typeof value === "string") {
      toast.success(`${setting} changed to ${value}`);
    } else {
      toast.success(`${setting} ${value ? "enabled" : "disabled"}`);
    }
  };

  // Handle language setting changes
  const handleLanguageChange = (setting: string, value: string | boolean) => {
    setLanguageSettings(prev => ({
      ...prev,
      [setting]: value,
    }));

    if (typeof value === "string") {
      toast.success(`${setting} changed to ${value}`);
    } else {
      toast.success(`${setting} ${value ? "enabled" : "disabled"}`);
    }
  };

  // Handle form submission
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password if provided
    if (accountForm.newPassword) {
      if (accountForm.newPassword !== accountForm.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      
      if (accountForm.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }
      
      if (!accountForm.currentPassword) {
        toast.error("Current password is required to set a new password");
        return;
      }
    }
    
    try {
      // Create data object for update
      const updateData = {
        name: accountForm.name,
        username: accountForm.username,
        // Only include password if changing it
        ...(accountForm.newPassword && { password: accountForm.newPassword })
      };
      
      console.log("Sending account update with data:", updateData);
      const response = await api.updateProfile(updateData);
      
      if (response.success) {
        toast.success("Account settings updated successfully");
        if (accountForm.newPassword) {
          toast.info("Password changed. Please log in again with your new password.");
        }
        
        // Clear password fields
        setAccountForm(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
      }
    } catch (error) {
      toast.error("Failed to update account settings");
      console.error("Account update error:", error);
    }
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation modal
    toast.error("Account deletion would be initiated here");
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="language">Language</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <form onSubmit={handleSaveAccount}>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your account details and password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={accountForm.name}
                      onChange={handleAccountChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={accountForm.email}
                      onChange={handleAccountChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      This is the email used for login and notifications
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={accountForm.username}
                      onChange={handleAccountChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      This is your public username visible to other users
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      name="currentPassword"
                      type="password"
                      value={accountForm.currentPassword}
                      onChange={handleAccountChange}
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        name="newPassword"
                        type="password"
                        value={accountForm.newPassword}
                        onChange={handleAccountChange}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        value={accountForm.confirmPassword}
                        onChange={handleAccountChange}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Save Changes</Button>
                </CardFooter>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delete Account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-medium">Warning: This action is irreversible</h3>
                  </div>
                  <p className="mt-2 text-sm">
                    Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debate-invitations">Debate Invitations</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for new debate invitations
                    </p>
                  </div>
                  <Switch
                    id="debate-invitations"
                    checked={notificationSettings.debateInvitations}
                    onCheckedChange={() => handleNotificationToggle("debateInvitations")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="debate-reminders">Debate Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminder notifications for upcoming debates
                    </p>
                  </div>
                  <Switch
                    id="debate-reminders"
                    checked={notificationSettings.debateReminders}
                    onCheckedChange={() => handleNotificationToggle("debateReminders")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="connection-requests">Connection Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for new connection requests
                    </p>
                  </div>
                  <Switch
                    id="connection-requests"
                    checked={notificationSettings.connectionRequests}
                    onCheckedChange={() => handleNotificationToggle("connectionRequests")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-newsletter">Weekly Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly newsletter with news and updates
                    </p>
                  </div>
                  <Switch
                    id="weekly-newsletter"
                    checked={notificationSettings.weeklyNewsletter}
                    onCheckedChange={() => handleNotificationToggle("weeklyNewsletter")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="system-updates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about important system updates
                    </p>
                  </div>
                  <Switch
                    id="system-updates"
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={() => handleNotificationToggle("systemUpdates")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Notification settings saved")}>
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can see your information and how it's used
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="public-profile">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your profile to be discoverable by other users
                    </p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={privacySettings.publicProfile}
                    onCheckedChange={() => handlePrivacyToggle("publicProfile")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-email">Show Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your email to be visible to other users
                    </p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={privacySettings.showEmail}
                    onCheckedChange={() => handlePrivacyToggle("showEmail")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-language">Show Language Proficiency</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see your language proficiency levels
                    </p>
                  </div>
                  <Switch
                    id="show-language"
                    checked={privacySettings.showLanguageProficiency}
                    onCheckedChange={() => handlePrivacyToggle("showLanguageProficiency")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-location">Show Location</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your location to be visible to other users
                    </p>
                  </div>
                  <Switch
                    id="show-location"
                    checked={privacySettings.showLocation}
                    onCheckedChange={() => handlePrivacyToggle("showLocation")}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="connection-requests">Allow Connection Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow other users to send you connection requests
                    </p>
                  </div>
                  <Switch
                    id="connection-requests"
                    checked={privacySettings.allowConnectionRequests}
                    onCheckedChange={() => handlePrivacyToggle("allowConnectionRequests")}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Privacy settings saved")}>
                  Save Privacy Settings
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>
                  Manage your data and download a copy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Download Your Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Get a copy of your personal data that we store
                    </p>
                  </div>
                  <Button variant="outline">
                    Download Data
                  </Button>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Third-Party Data Sharing</h3>
                    <p className="text-sm text-muted-foreground">
                      We only use your data to provide and improve our services. We don't sell your data to third parties.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">Your data is protected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme & Appearance</CardTitle>
                <CardDescription>
                  Customize how Langlobe looks to you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={appearanceSettings.theme}
                    onValueChange={(value) => handleAppearanceChange("theme", value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select
                    value={appearanceSettings.fontSize}
                    onValueChange={(value) => handleAppearanceChange("fontSize", value)}
                  >
                    <SelectTrigger id="font-size">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Adjust the text size for better readability
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduce-motion">Reduce Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations throughout the interface
                    </p>
                  </div>
                  <Switch
                    id="reduce-motion"
                    checked={appearanceSettings.reduceMotion}
                    onCheckedChange={(checked) => handleAppearanceChange("reduceMotion", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase color contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={appearanceSettings.highContrast}
                    onCheckedChange={(checked) => handleAppearanceChange("highContrast", checked)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Appearance settings saved")}>
                  Save Appearance Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Language Tab */}
          <TabsContent value="language" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Language Settings</CardTitle>
                <CardDescription>
                  Manage language preferences and translation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-language">Application Language</Label>
                  <Select
                    value={languageSettings.appLanguage}
                    onValueChange={(value) => handleLanguageChange("appLanguage", value)}
                  >
                    <SelectTrigger id="app-language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="de">Deutsch (German)</SelectItem>
                      <SelectItem value="zh">中文 (Chinese)</SelectItem>
                      <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Language used in the application interface
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="primary-translation">Primary Translation Language</Label>
                  <Select
                    value={languageSettings.primaryTranslationLang}
                    onValueChange={(value) => handleLanguageChange("primaryTranslationLang", value)}
                  >
                    <SelectTrigger id="primary-translation">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="de">Deutsch (German)</SelectItem>
                      <SelectItem value="zh">中文 (Chinese)</SelectItem>
                      <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Your preferred language for translations
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-translate">Auto-Translate</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically translate messages in debates
                    </p>
                  </div>
                  <Switch
                    id="auto-translate"
                    checked={languageSettings.autoTranslate}
                    onCheckedChange={(checked) => handleLanguageChange("autoTranslate", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-original">Show Original Text</Label>
                    <p className="text-sm text-muted-foreground">
                      Show original text alongside translations
                    </p>
                  </div>
                  <Switch
                    id="show-original"
                    checked={languageSettings.showOriginalText}
                    onCheckedChange={(checked) => handleLanguageChange("showOriginalText", checked)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => toast.success("Language settings saved")}>
                  Save Language Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
