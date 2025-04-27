"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search, Globe, UserPlus, Check, X, MessageCircle, Mail, UserMinus, Clock, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { User } from "@/lib/api";

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
  { code: "ko", name: "Korean" },
];

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [connections, setConnections] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const [friendsRes, requestsRes, usersRes] = await Promise.all([
        api.getFriends(),
        api.getFriendRequests(),
        api.getAllUsers(),
      ]);

      // Handle friends response
      if (friendsRes.success && friendsRes.friends) {
        setConnections(friendsRes.friends);
      } else {
        setConnections([]);
      }

      // Handle friend requests response
      if (requestsRes.success && requestsRes.incoming) {
        setPendingRequests(requestsRes.incoming);
      } else {
        setPendingRequests([]);
      }

      // Handle users response for suggestions
      if (usersRes.success && usersRes.users) {
        // Filter out current user and existing friends from suggestions
        const filteredSuggestions = usersRes.users.filter(
          (u) => u._id !== user._id && !connections.some((f) => f._id === u._id)
        );
        setSuggestions(filteredSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch connections data";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(error);
      // Set empty arrays on error
      setConnections([]);
      setPendingRequests([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchDataWrapper = async () => {
      if (!mounted) return;
      await fetchData();
    };

    fetchDataWrapper();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleConnect = async (userId: string) => {
    try {
      await api.sendFriendRequest(userId);
      toast.success("Friend request sent");
      fetchData();
    } catch (error) {
      toast.error("Failed to send friend request");
      console.error(error);
    }
  };

  const handleAccept = async (userId: string) => {
    try {
      await api.acceptFriendRequest(userId);
      toast.success("Friend request accepted");
      fetchData();
    } catch (error) {
      toast.error("Failed to accept friend request");
      console.error(error);
    }
  };

  const handleDecline = async (userId: string) => {
    try {
      await api.declineFriendRequest(userId);
      toast.success("Friend request declined");
      fetchData();
    } catch (error) {
      toast.error("Failed to decline friend request");
      console.error(error);
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await api.removeFriend(userId);
      toast.success("Friend removed");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove friend");
      console.error(error);
    }
  };

  const filteredConnections = connections.filter((connection) => {
    const matchesSearch = connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = !selectedLanguage || connection.preferredLanguage === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  const filteredSuggestions = suggestions.filter((suggestion) => {
    const matchesSearch = suggestion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = !selectedLanguage || suggestion.preferredLanguage === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  if (!user) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-muted-foreground">Please log in to view your connections</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-full">
          <p className="text-lg text-destructive">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
          <p className="text-muted-foreground">
            Manage your connections and discover new people
          </p>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">All Languages</option>
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <Tabs defaultValue="connections" className="space-y-4">
          <TabsList>
            <TabsTrigger value="connections">My Connections</TabsTrigger>
            <TabsTrigger value="requests">Pending Requests</TabsTrigger>
            <TabsTrigger value="discover">Discover People</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-4">
            {loading ? (
              <p>Loading connections...</p>
            ) : filteredConnections.length === 0 ? (
              <p className="text-muted-foreground">No connections found</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredConnections.map((connection) => (
                  <Card key={connection._id}>
                    <CardHeader>
                      <CardTitle>{connection.name}</CardTitle>
                      <CardDescription>@{connection.username}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {connection.bio || "No bio provided"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {availableLanguages.find(l => l.code === connection.preferredLanguage)?.name || "Unknown"}
                          </Badge>
                          <Badge variant="outline">
                            {connection.location || "Unknown location"}
                          </Badge>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemove(connection._id)}
                        >
                          Remove Connection
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {loading ? (
              <p>Loading requests...</p>
            ) : pendingRequests.length === 0 ? (
              <p className="text-muted-foreground">No pending requests</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingRequests.map((request) => (
                  <Card key={request._id}>
                    <CardHeader>
                      <CardTitle>{request.name}</CardTitle>
                      <CardDescription>@{request.username}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {request.bio || "No bio provided"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {availableLanguages.find(l => l.code === request.preferredLanguage)?.name || "Unknown"}
                          </Badge>
                          <Badge variant="outline">
                            {request.location || "Unknown location"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(request._id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDecline(request._id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-4">
            {loading ? (
              <p>Loading suggestions...</p>
            ) : filteredSuggestions.length === 0 ? (
              <p className="text-muted-foreground">No suggestions found</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSuggestions.map((suggestion) => (
                  <Card key={suggestion._id}>
                    <CardHeader>
                      <CardTitle>{suggestion.name}</CardTitle>
                      <CardDescription>@{suggestion.username}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {suggestion.bio || "No bio provided"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {availableLanguages.find(l => l.code === suggestion.preferredLanguage)?.name || "Unknown"}
                          </Badge>
                          <Badge variant="outline">
                            {suggestion.location || "Unknown location"}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleConnect(suggestion._id)}
                        >
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
