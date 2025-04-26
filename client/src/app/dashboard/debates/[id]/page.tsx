"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, MessageCircle, Mic, MicOff, Users, PlusCircle, Languages, Volume2, Settings, Share } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

// Mock user data
const user = {
  id: "user1",
  name: "John Doe",
  email: "john@example.com",
  language: "en",
  image: "",
};

// Mock debate data
const mockDebates = {
  "1": {
    id: "1",
    title: "Climate Change Solutions",
    description: "Discussing practical approaches to combat climate change effects globally",
    status: "active",
    startTime: new Date().toISOString(),
    host: {
      id: "host1",
      name: "Emma Wilson",
      language: "en",
      image: "",
    },
    languages: ["English", "Spanish", "Chinese"],
    topics: ["Environment", "Science", "Politics"],
    participants: [
      {
        id: "user2",
        name: "Maria Garcia",
        language: "es",
        image: "",
      },
      {
        id: "user3",
        name: "Wei Zhang",
        language: "zh",
        image: "",
      },
      {
        id: "user4",
        name: "David Kim",
        language: "ko",
        image: "",
      },
    ],
    messages: [
      {
        id: "msg1",
        userId: "host1",
        userName: "Emma Wilson",
        userLanguage: "en",
        text: "Welcome everyone to our discussion on climate change solutions. Today we'll focus on practical approaches that can be implemented globally.",
        translatedText: "",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        isTranslated: false,
      },
      {
        id: "msg2",
        userId: "user2",
        userName: "Maria Garcia",
        userLanguage: "es",
        text: "Gracias por organizar esto. Creo que deberíamos comenzar discutiendo las opciones de energía renovable.",
        translatedText: "Thank you for organizing this. I think we should start by discussing renewable energy options.",
        timestamp: new Date(Date.now() - 240000).toISOString(),
        isTranslated: true,
      },
      {
        id: "msg3",
        userId: "user3",
        userName: "Wei Zhang",
        userLanguage: "zh",
        text: "我同意。中国正在大力投资太阳能和风能技术。",
        translatedText: "I agree. China is heavily investing in solar and wind technologies.",
        timestamp: new Date(Date.now() - 180000).toISOString(),
        isTranslated: true,
      },
      {
        id: "msg4",
        userId: "host1",
        userName: "Emma Wilson",
        userLanguage: "en",
        text: "Great points. What about policy changes that could incentivize these renewable energy investments?",
        translatedText: "",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        isTranslated: false,
      },
      {
        id: "msg5",
        userId: "user4",
        userName: "David Kim",
        userLanguage: "ko",
        text: "세금 인센티브와 보조금이 변화를 가속화할 수 있습니다. 한국의 친환경 정책은 상당한 진전을 이루었습니다.",
        translatedText: "Tax incentives and subsidies can accelerate change. South Korea's green policies have made significant progress.",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        isTranslated: true,
      },
    ],
  },
  // Add more mock debates as needed
};

export default function DebatePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // In a real app, you would fetch the debate data from an API
  const debate = mockDebates[id as keyof typeof mockDebates];

  const [messages, setMessages] = useState(debate?.messages || []);
  const [newMessage, setNewMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(user.language);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // We need messages in the dependency array to scroll when messages change

  // Function to handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: `msg${messages.length + 1}`,
      userId: user.id,
      userName: user.name,
      userLanguage: selectedLanguage,
      text: newMessage,
      translatedText: "",
      timestamp: new Date().toISOString(),
      isTranslated: false,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");

    // Simulate receiving a response after a delay
    setTimeout(() => {
      const responseMsg = {
        id: `msg${messages.length + 2}`,
        userId: debate?.host.id || "host1",
        userName: debate?.host.name || "Host",
        userLanguage: debate?.host.language || "en",
        text: "Thank you for your contribution to the discussion!",
        translatedText: selectedLanguage === "en" ? "" : "¡Gracias por tu contribución a la discusión!",
        timestamp: new Date().toISOString(),
        isTranslated: selectedLanguage !== "en",
      };

      setMessages(prev => [...prev, responseMsg]);
    }, 2000);
  };

  // Function to toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? "Microphone unmuted" : "Microphone muted");
  };

  // Calculate participant count
  const participantCount = debate ? 1 + debate.participants.length : 0;

  if (!debate) {
    return (
      <DashboardLayout user={user}>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Debate not found</h1>
            <p className="text-muted-foreground">The debate you're looking for doesn't exist or has ended.</p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{debate.title}</h1>
            <p className="text-muted-foreground">{debate.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
              Live
            </Badge>
            <span className="flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              {participantCount} participants
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          {/* Main debate area */}
          <div className="flex h-[calc(100vh-250px)] flex-col overflow-hidden rounded-lg border bg-background">
            {/* Conversation area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-4 p-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.userId === user.id ? 'justify-end' : ''}`}
                    >
                      {message.userId !== user.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={""} alt={message.userName} />
                          <AvatarFallback className="bg-primary/10 text-xs">
                            {message.userName[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[80%] space-y-1 ${message.userId === user.id ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{message.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {message.userLanguage === "en" ? "English"
                              : message.userLanguage === "es" ? "Spanish"
                              : message.userLanguage === "zh" ? "Chinese"
                              : message.userLanguage === "ko" ? "Korean"
                              : message.userLanguage}
                          </Badge>
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.userId === user.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          {message.isTranslated && (
                            <>
                              <Separator className="my-1 opacity-50" />
                              <p className="text-sm italic opacity-80">{message.translatedText}</p>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {message.userId === user.id && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={""} alt={message.userName} />
                          <AvatarFallback className="bg-primary/10 text-xs">
                            {message.userName[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input area */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={isMuted ? 'text-destructive' : ''}
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isMuted ? "Speak to send a message..." : "Type to send a message..."}
                  className="flex-1"
                  disabled={isMuted}
                />
                <Button type="submit" disabled={isMuted || !newMessage.trim()}>
                  Send
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
                <CardDescription>
                  Active participants in this debate
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-3">
                  {/* Host */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={debate.host.image} alt={debate.host.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {debate.host.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1 text-sm">
                          {debate.host.name}
                          <Badge variant="outline" className="text-[10px]">Host</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {debate.host.language === "en" ? "English"
                            : debate.host.language === "es" ? "Spanish"
                            : debate.host.language === "zh" ? "Chinese"
                            : debate.host.language}
                        </div>
                      </div>
                    </div>
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <Separator />

                  {/* Current user */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-xs">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1 text-sm">
                          {user.name}
                          <Badge variant="outline" className="text-[10px]">You</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedLanguage === "en" ? "English"
                            : selectedLanguage === "es" ? "Spanish"
                            : selectedLanguage === "zh" ? "Chinese"
                            : selectedLanguage === "ko" ? "Korean"
                            : selectedLanguage}
                        </div>
                      </div>
                    </div>
                    {isMuted ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4 text-muted-foreground" />}
                  </div>

                  <Separator />

                  {/* Other participants */}
                  {debate.participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.image} alt={participant.name} />
                          <AvatarFallback className="bg-primary/10 text-xs">
                            {participant.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm">{participant.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {participant.language === "en" ? "English"
                              : participant.language === "es" ? "Spanish"
                              : participant.language === "zh" ? "Chinese"
                              : participant.language === "ko" ? "Korean"
                              : participant.language}
                          </div>
                        </div>
                      </div>
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Invite Others
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debate Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Languages</div>
                      <div className="text-muted-foreground">{debate.languages.join(", ")}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MessageCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Topics</div>
                      <div className="text-muted-foreground">{debate.topics.join(", ")}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-3 w-3" />
                  Settings
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="mr-2 h-3 w-3" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
