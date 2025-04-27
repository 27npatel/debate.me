"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Globe, Info, MessageCircle, Users, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuth } from "@/lib/auth-context";

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

// List of topics
const availableTopics = [
  "Technology",
  "Education",
  "Environment",
  "Culture",
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

export default function CreateDebatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("14:00");
  const [isNow, setIsNow] = useState(false);
  const [capacity, setCapacity] = useState("10");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["en"]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

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
            <p className="text-muted-foreground">You need to be logged in to create a debate.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleLanguageToggle = (languageCode: string) => {
    if (selectedLanguages.includes(languageCode)) {
      // Don't remove the last language
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter(code => code !== languageCode));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, languageCode]);
    }
  };

  const handleTopicToggle = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a debate title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a debate description");
      return;
    }

    if (selectedTopics.length === 0) {
      toast.error("Please select at least one topic");
      return;
    }

    setLoading(true);

    // In a real app, this would be an API call to create the debate
    setTimeout(() => {
      setLoading(false);
      toast.success("Debate created successfully!");
      router.push("/dashboard/debates/1"); // Navigate to the new debate
    }, 1000);
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Debate</h1>
          <p className="text-muted-foreground">
            Set up a new debate room and invite participants
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Debate Details</CardTitle>
                <CardDescription>
                  Basic information about your debate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a clear, descriptive title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your debate is about"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduling</CardTitle>
                <CardDescription>
                  When will your debate take place?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isNow}
                    onCheckedChange={setIsNow}
                    id="start-now"
                  />
                  <Label htmlFor="start-now">Start immediately</Label>
                </div>

                {!isNow && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Select value={time} onValueChange={setTime}>
                        <SelectTrigger id="time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                            <SelectItem
                              key={`${hour}:00`}
                              value={`${hour.toString().padStart(2, "0")}:00`}
                            >
                              {`${hour.toString().padStart(2, "0")}:00`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Languages & Topics</CardTitle>
                <CardDescription>
                  What languages will be supported and what will you discuss?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Supported Languages</Label>
                    <span className="text-xs text-muted-foreground">
                      Select all that apply
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableLanguages.map((language) => (
                      <Badge
                        key={language.code}
                        variant={selectedLanguages.includes(language.code) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleLanguageToggle(language.code)}
                      >
                        {language.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Topics</Label>
                    <span className="text-xs text-muted-foreground">
                      Select at least one
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTopics.map((topic) => (
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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure your debate settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Maximum Participants</Label>
                  <Select value={capacity} onValueChange={setCapacity}>
                    <SelectTrigger id="capacity">
                      <SelectValue placeholder="Select capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 30].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} participants
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="private">Private Debate</Label>
                    <p className="text-xs text-muted-foreground">
                      Only accessible via invite
                    </p>
                  </div>
                  <Switch
                    checked={isPrivate}
                    onCheckedChange={setIsPrivate}
                    id="private"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debate Summary</CardTitle>
                <CardDescription>
                  Review your debate details before creating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                  {title ? (
                    <h3 className="font-medium">{title}</h3>
                  ) : (
                    <p className="text-muted-foreground italic">No title provided</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {selectedTopics.map(topic => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                    {selectedTopics.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No topics selected</p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedLanguages.map(code =>
                          availableLanguages.find(l => l.code === code)?.name
                        ).join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Up to {capacity} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {isNow ? "Starting immediately" : (date ? `${format(date, "PPP")} at ${time}` : "Date not selected")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span>{isPrivate ? "Private (invite only)" : "Public"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Debate"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
