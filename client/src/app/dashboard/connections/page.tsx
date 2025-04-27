"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

// Mock connections data
const connections = [
  {
    id: "1",
    name: "Maria Garcia",
    username: "mariagarcia",
    language: "es",
    languageName: "Spanish",
    location: "Madrid, Spain",
    image: "/avatars/sarah.png",
    status: "connected",
    lastActive: "2 hours ago",
    commonInterests: ["Environment", "Education", "Culture"],
    bio: "Language enthusiast and environmental activist. Love to discuss global education policies.",
  },
  {
    id: "2",
    name: "Wei Zhang",
    username: "weizhang",
    language: "zh",
    languageName: "Chinese",
    location: "Shanghai, China",
    image: "/avatars/wei.png",
    status: "connected",
    lastActive: "1 day ago",
    commonInterests: ["Technology", "Science", "Business"],
    bio: "Tech entrepreneur interested in AI and cultural exchange. Always looking to practice my English.",
  },
  {
    id: "3",
    name: "Carlos Mendez",
    username: "carlosmendez",
    language: "es",
    languageName: "Spanish",
    location: "Mexico City, Mexico",
    image: "/avatars/carlos.png",
    status: "connected",
    lastActive: "3 days ago",
    commonInterests: ["Politics", "History", "Arts"],
    bio: "Political scientist and history buff. Eager to improve my language skills through meaningful discussions.",
  },
  {
    id: "4",
    name: "Fatima Ahmed",
    username: "fatima_a",
    language: "ar",
    languageName: "Arabic",
    location: "Cairo, Egypt",
    image: "",
    status: "connected",
    lastActive: "1 week ago",
    commonInterests: ["Education", "Social Issues", "Literature"],
    bio: "Professor of comparative literature. Interested in cross-cultural dialogue and educational methods.",
  },
];

// Mock pending connection requests
const pendingRequests = [
  {
    id: "5",
    name: "Priya Singh",
    username: "priyasingh",
    language: "hi",
    languageName: "Hindi",
    location: "Mumbai, India",
    image: "",
    status: "pending",
    sentAt: "Yesterday",
    bio: "Environmental scientist with a passion for sustainable development. Looking to connect with like-minded individuals.",
  },
  {
    id: "6",
    name: "Takashi Yamamoto",
    username: "takashiy",
    language: "ja",
    languageName: "Japanese",
    location: "Tokyo, Japan",
    image: "",
    status: "pending",
    sentAt: "2 days ago",
    bio: "Software engineer and language learner. Interested in discussing technology and cultural differences.",
  },
];

// Mock connection suggestions
const suggestions = [
  {
    id: "7",
    name: "Elena Petrov",
    username: "elena_p",
    language: "ru",
    languageName: "Russian",
    location: "Moscow, Russia",
    image: "",
    commonInterests: ["Arts", "Literature", "History"],
    mutualConnections: 2,
  },
  {
    id: "8",
    name: "Omar Hassan",
    username: "omarh",
    language: "ar",
    languageName: "Arabic",
    location: "Dubai, UAE",
    image: "",
    commonInterests: ["Business", "Technology", "Sports"],
    mutualConnections: 1,
  },
  {
    id: "9",
    name: "Sophie Dubois",
    username: "sophied",
    language: "fr",
    languageName: "French",
    location: "Paris, France",
    image: "",
    commonInterests: ["Culture", "Food", "Politics"],
    mutualConnections: 3,
  },
  {
    id: "10",
    name: "Hans Mueller",
    username: "hansm",
    language: "de",
    languageName: "German",
    location: "Berlin, Germany",
    image: "",
    commonInterests: ["Science", "Philosophy", "Environment"],
    mutualConnections: 0,
  },
];

// Available languages for filtering
const languages = [
  { code: "all", name: "All Languages" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "zh", name: "Chinese" },
  { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ja", name: "Japanese" },
];

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("connections");

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
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Please log in</h1>
            <p className="text-muted-foreground">You need to be logged in to view connections.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter connections based on search query and language filter
  const filteredConnections = connections.filter(connection => {
    const matchesSearch =
      connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage =
      languageFilter === "all" || connection.language === languageFilter;

    return matchesSearch && matchesLanguage;
  });

  // Filter suggestions based on search query and language filter
  const filteredSuggestions = suggestions.filter(connection => {
    const matchesSearch =
      connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage =
      languageFilter === "all" || connection.language === languageFilter;

    return matchesSearch && matchesLanguage;
  });

  // Handle connect request
  const handleConnect = (id: string) => {
    toast.success("Connection request sent!");
  };

  // Handle accept connection request
  const handleAccept = (id: string) => {
    toast.success("Connection request accepted!");
  };

  // Handle reject connection request
  const handleReject = (id: string) => {
    toast.success("Connection request declined.");
  };

  // Handle removing a connection
  const handleRemove = (id: string) => {
    toast.success("Connection removed.");
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Connections</h1>
          <p className="text-muted-foreground">
            Manage your connections and find new people to debate with
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search connections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="connections">My Connections</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-primary text-xs">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="discover">Discover People</TabsTrigger>
          </TabsList>

          {/* My Connections Tab */}
          <TabsContent value="connections">
            {filteredConnections.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredConnections.map((connection) => (
                  <Card key={connection.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={connection.image} alt={connection.name} />
                          <AvatarFallback className="text-lg">
                            {connection.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Filter className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toast.success("Message sent!")}>
                              <MessageCircle className="mr-2 h-4 w-4" />
                              <span>Message</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success("Email sent!")}>
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Email</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemove(connection.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              <span>Remove Connection</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="mt-2 text-base">{connection.name}</CardTitle>
                      <CardDescription>
                        @{connection.username} • {connection.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{connection.languageName}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {connection.bio}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {connection.commonInterests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t p-3">
                      <div className="flex w-full items-center justify-between">
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          Active {connection.lastActive}
                        </span>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="mr-2 h-3 w-3" />
                          Message
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <UserMinus className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No connections found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || languageFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "You don't have any connections yet. Discover people to connect with!"}
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setActiveTab("discover")}
                >
                  Discover People
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending">
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={request.image} alt={request.name} />
                          <AvatarFallback>
                            {request.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{request.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            @{request.username} • {request.languageName}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Request received {request.sentAt}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500"
                          onClick={() => handleReject(request.id)}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(request.id)}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Accept
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Clock className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No pending requests</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You don't have any pending connection requests at the moment.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Discover People Tab */}
          <TabsContent value="discover">
            {filteredSuggestions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSuggestions.map((suggestion) => (
                  <Card key={suggestion.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={suggestion.image} alt={suggestion.name} />
                          <AvatarFallback className="text-lg">
                            {suggestion.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.mutualConnections}
                          {suggestion.mutualConnections === 1 ? " mutual" : " mutuals"}
                        </Badge>
                      </div>
                      <CardTitle className="mt-2 text-base">{suggestion.name}</CardTitle>
                      <CardDescription>
                        @{suggestion.username} • {suggestion.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{suggestion.languageName}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {suggestion.commonInterests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t p-3">
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleConnect(suggestion.id)}
                      >
                        <UserPlus className="mr-2 h-3 w-3" />
                        Connect
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <UserPlus className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No suggestions found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || languageFilter !== "all"
                    ? "Try adjusting your search or filters."
                    : "We couldn't find any suggestions for you at the moment."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
