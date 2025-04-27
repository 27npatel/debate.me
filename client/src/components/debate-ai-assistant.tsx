import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Bot, Send, Lightbulb, AlertTriangle, MessageSquare } from 'lucide-react';
import { api } from "@/lib/api";
import { toast } from "sonner";

interface DebateAIAssistantProps {
  debateId: string;
  topic: string;
  onNewQuestion?: (question: string) => void;
}

interface AIResponse {
  success: boolean;
  response?: string;
  questions?: string[];
  isAppropriate?: boolean;
  issues?: string[];
  suggestions?: string[];
}

export function DebateAIAssistant({ debateId, topic, onNewQuestion }: DebateAIAssistantProps) {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize AI chat when component mounts
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('Initializing AI chat for debate:', debateId, 'topic:', topic);
        const response = await api.initializeAIChat(debateId, topic);
        console.log('AI chat initialization response:', response);
      } catch (error) {
        console.error('AI chat initialization error:', error);
        toast.error(`Failed to initialize AI chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    initializeChat();
  }, [debateId, topic]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      console.log('Sending message to AI:', message);
      const response = await api.processMessage(debateId, message, { topic });
      console.log('AI message response:', response);

      if (response.success) {
        setResponses(prev => [...prev, { success: true, response: response.data.response }]);
        setMessage('');
      } else {
        toast.error(`Failed to process message: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Message processing error:', error);
      toast.error(`Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    try {
      console.log('Generating questions for topic:', topic);
      const response = await api.generateQuestions(topic, 3);
      console.log('Questions generation response:', response);

      if (response.success && response.data.questions) {
        setResponses(prev => [...prev, { success: true, questions: response.data.questions }]);
        // Notify parent component about new questions
        response.data.questions.forEach(question => {
          onNewQuestion?.(question);
        });
      } else {
        toast.error(`Failed to generate questions: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Questions generation error:', error);
      toast.error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerateContent = async (content: string) => {
    setIsLoading(true);
    try {
      const response = await api.moderateContent(content);

      if (response.success) {
        setResponses(prev => [...prev, {
          success: true,
          isAppropriate: response.data.isAppropriate,
          issues: response.data.issues,
          suggestions: response.data.suggestions
        }]);
      }
    } catch (error) {
      toast.error('Failed to moderate content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Debate Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          {responses.map((response, index) => (
            <div key={index} className="mb-4">
              {response.response && (
                <div className="mb-2">
                  <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                    <p className="text-sm leading-relaxed">
                      {response.response.slice(7)}
                    </p>
                  </div>
                </div>
              )}
              {response.questions && (
                <div className="mb-4 space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Lightbulb className="h-5 w-5" />
                    <h4 className="font-semibold">Suggested Questions</h4>
                  </div>
                  <div className="space-y-2">
                    {response.questions
                      .map(q => q.replace(/^\[|\]$/g, '').replace(/^"|"$/g, '').trim())
                      .filter(q => q.length > 0)
                      .map((question, qIndex) => (
                        <div
                          key={qIndex}
                          className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
                        >
                          <p className="text-sm leading-relaxed">{question}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {response.issues && (
                <div className="mb-2">
                  <h4 className="font-semibold mb-2">Content Analysis:</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`h-4 w-4 ${response.isAppropriate ? 'text-green-500' : 'text-red-500'}`} />
                    <span className="text-sm">{response.isAppropriate ? 'Content is appropriate' : 'Content needs review'}</span>
                  </div>
                  {response.issues.length > 0 && (
                    <div className="mb-2">
                      <h5 className="text-sm font-medium">Issues:</h5>
                      <ul className="list-disc pl-4">
                        {response.issues.map((issue, iIndex) => (
                          <li key={iIndex} className="text-sm text-red-500">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {response.suggestions && response.suggestions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium">Suggestions:</h5>
                      <ul className="list-disc pl-4">
                        {response.suggestions.map((suggestion, sIndex) => (
                          <li key={sIndex} className="text-sm text-green-500">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
        <div className="flex gap-2 mt-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask the AI assistant..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleGenerateQuestions} disabled={isLoading}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Generate Questions
          </Button>
          <Button variant="outline" onClick={() => handleModerateContent(message)} disabled={isLoading || !message}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Moderate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 