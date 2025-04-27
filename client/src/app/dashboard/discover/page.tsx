"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Globe,
  Users,
  MessageSquare,
  Clock,
  Calendar,
  Tag,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";

// Mock user data
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

// Mock debate data
const debates = [
  {
    id: "1",
    title: "Climate Change Solutions",
    description: "Discussing practical approaches to combat climate change effects globally",
    participants: 6,
    languages: ["English", "Spanish", "Chinese"],
    topics: ["Environment", "Science", "Politics"],
    status: "active",
    startTime: "Live now",
    capacity: 12,
  },
  {
    id: "2",
    title: "Global Education Inequality",
    description: "Examining disparities in educational access across different regions",
    participants: 4,
    languages: ["English", "French", "Arabic"],
    topics: ["Education", "Society", "Economics"],
    status: "scheduled",
    startTime: "Tomorrow, 2:00 PM",
    capacity: 10,
  },
  {
    id: "3",
    title: "Future of Remote Work",
    description: "Discussing how remote work is shaping employment across cultures",
    participants: 8,
    languages: ["English", "German", "Japanese"],
    topics: ["Technology", "Business", "Future"],
    status: "active",
    startTime: "Live now",
    capacity: 15,
  },
  {
    id: "4",
    title: "Cultural Exchange in Arts",
    description: "Exploring how different cultural perspectives influence artistic expression",
    participants: 3,
    languages: ["English", "Italian", "Korean"],
    topics: ["Arts", "Culture", "History"],
    status: "scheduled",
    startTime: "May 21, 4:00 PM",
    capacity: 8,
  },
  {
    id: "5",
    title: "Digital Privacy in Modern Society",
    description: "Discussing the balance between technological advancement and privacy concerns",
    participants: 7,
    languages: ["English", "Russian", "Portuguese"],
    topics: ["Technology", "Ethics", "Law"],
    status: "active",
    startTime: "Live now",
    capacity: 12,
  },
  {
    id: "6",
    title: "Sustainable Food Systems",
    description: "Exploring innovative approaches to food production and distribution",
    participants: 5,
    languages: ["English", "Hindi", "Spanish"],
    topics: ["Environment", "Health", "Science"],
    status: "scheduled",
    startTime: "May 22, 1:00 PM",
    capacity: 10,
  },
];

// Popular topics for filtering
const popularTopics = [
  "Technology",
  "Environment",
  "Culture",
  "Politics",
  "Education",
  "Health",
  "Business",
  "Science",
  "Arts",
  "Society",
];

// Languages for filtering
const languages = [
  "English",
  "Spanish",
  "French",
  "Chinese",
  "Arabic",
  "Russian",
  "Portuguese",
  "German",
  "Japanese",
  "Hindi",
];

export default function DiscoverPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [participantRange, setParticipantRange] = useState([0, 15]);

  // Filter debates based on search, topics, languages, and status
  const filterDebates = (status: string) => {
    return debates
      .filter(debate => debate.status === status)
      .filter(debate => {
        if (!searchQuery) return true;
        return (
          debate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          debate.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          debate.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .filter(debate => {
        if (selectedTopics.length === 0) return true;
        return debate.topics.some(topic => selectedTopics.includes(topic));
      })
      .filter(debate => {
        if (selectedLanguages.length === 0) return true;
        return debate.languages.some(lang => selectedLanguages.includes(lang));
      })
      .filter(debate => {
        return debate.participants >= participantRange[0] && debate.participants <= participantRange[1];
      });
  };

  const handleTopicToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleLanguageToggle = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedTopics([]);
    setSelectedLanguages([]);
    setParticipantRange([0, 15]);
  };

  return (
    <DashboardLayout user={user || mockUser}>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Discover Debates</h1>
            <p className="text-muted-foreground">
              Find and join conversations on topics that interest you
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/debates/create">
              Create New Debate
            </Link>
          </Button>
        </div>

        {/* Search and filters */}
        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine your search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTopics.map(topic => (
                    <Badge
                      key={topic}
                      variant={selectedTopics.includes(topic) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTopicToggle(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map(language => (
                    <Badge
                      key={language}
                      variant={selectedLanguages.includes(language) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleLanguageToggle(language)}
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Participants</h3>
                  <span className="text-xs text-muted-foreground">
                    {participantRange[0]} - {participantRange[1]}
                  </span>
                </div>
                <Slider
                  value={participantRange}
                  min={0}
                  max={20}
                  step={1}
                  onValueChange={setParticipantRange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                Reset Filters
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <div className="flex w-full items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search debates by title, description, or topic"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <Tabs defaultValue="active">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="active" className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Live Debates
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  Scheduled Debates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {filterDebates('active').map(debate => (
                    <Card key={debate.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-green-500/10 text-green-500">Live</Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Users className="mr-1 h-3 w-3" />
                            {debate.participants}/{debate.capacity}
                          </div>
                        </div>
                        <CardTitle className="line-clamp-1 text-lg">{debate.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {debate.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-1">
                            <Globe className="mt-0.5 h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{debate.languages.join(", ")}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {debate.topics.map(topic => (
                              <Badge key={`${debate.id}-${topic}`} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button asChild className="w-full" size="sm">
                          <Link href={`/dashboard/debates/${debate.id}`}>
                            Join Now <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {filterDebates('active').length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No active debates found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try adjusting your filters or check back later for new debates.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/debates/create">Create Your Own</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="scheduled" className="pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {filterDebates('scheduled').map(debate => (
                    <Card key={debate.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">Scheduled</Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {debate.startTime}
                          </div>
                        </div>
                        <CardTitle className="line-clamp-1 text-lg">{debate.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {debate.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-1">
                            <Globe className="mt-0.5 h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{debate.languages.join(", ")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{debate.participants} registered</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {debate.topics.map(topic => (
                              <Badge key={`${debate.id}-${topic}`} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button asChild className="w-full" size="sm" variant="outline">
                          <Link href={`/dashboard/debates/${debate.id}`}>
                            Register
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {filterDebates('scheduled').length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No scheduled debates found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Try adjusting your filters or check back later for new scheduled debates.
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/debates/create">Schedule a Debate</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
