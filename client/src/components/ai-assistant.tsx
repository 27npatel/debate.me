import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Bot, Send, Lightbulb } from 'lucide-react';
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AIAssistantProps {
  debateId: string;
  topic: string;
  onNewQuestion?: (question: string) => void;
}

interface Message {
  text: string;
  timestamp: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
    preferredLanguage?: string;
  };
}

const AI_ASSISTANT_ID = '680e41ac2a3cb793aaf9e40f';

export function AIAssistant({ debateId, topic, onNewQuestion }: AIAssistantProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize AI chat when component mounts
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await api.initializeAIChat(debateId, topic);
        await fetchMessages();
      } catch (error) {
        console.error('Failed to initialize AI chat:', error);
      }
    };
    initializeChat();
  }, [debateId, topic]);

  // Fetch messages periodically
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [debateId]);

  const fetchMessages = async () => {
    try {
      const response = await api.getChatHistory(debateId);
      if (response.success && response.data?.messages) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    try {
      // Send user message
      await api.sendMessage(debateId, {
        text: message,
        translatedTexts: {}
      });

      // Get AI response
      const aiResponse = await api.processMessage(debateId, message, { topic });
      if (aiResponse.success && aiResponse.data?.response) {
        // Send AI response as a message
        await api.sendMessage(debateId, {
          text: aiResponse.data.response,
          translatedTexts: {},
          isAI: true
        });
      }

      setMessage('');
      await fetchMessages();
    } catch (error) {
      toast.error(`Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await api.generateQuestions(topic, 3);
      if (response.success && response.data?.questions) {
        const questions = Array.isArray(response.data.questions) 
          ? response.data.questions 
          : [response.data.questions];
        
        // Send each question as a message
        for (const question of questions) {
          await api.sendMessage(debateId, {
            text: question,
            translatedTexts: {},
            isAI: true
          });
          onNewQuestion?.(question);
        }
        await fetchMessages();
      }
    } catch (error) {
      toast.error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[200px] w-full rounded-md border p-4 mb-4">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-3 ${msg.user._id === AI_ASSISTANT_ID ? 'text-left' : 'text-right'}`}>
              <div className={`inline-block p-2 rounded-lg ${
                msg.user._id === AI_ASSISTANT_ID 
                  ? 'bg-muted' 
                  : 'bg-primary text-primary-foreground'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <span className="text-xs opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask the AI assistant..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleGenerateQuestions} disabled={isLoading} size="icon">
            <Lightbulb className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 