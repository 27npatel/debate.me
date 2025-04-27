import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize the model - using the latest model name
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

class GeminiService {
    constructor() {
        this.chatHistory = new Map(); // Store chat history for each debate channel
    }

    // Initialize a new chat for a debate channel
    async initializeChat(channelId, topic) {
        try {
            console.log(`Initializing chat for channel ${channelId} with topic: ${topic}`);
            
            if (!channelId || !topic) {
                throw new Error('Channel ID and topic are required');
            }
            
            const chat = model.startChat();
            const systemPrompt = [{
                text: `You are an AI debate assistant for a debate about "${topic}". 
                Your role is to:
                1. Help generate thought-provoking questions
                2. Provide relevant context and facts
                3. Moderate discussions
                4. Help participants structure their arguments
                5. Identify logical fallacies
                6. Suggest counter-arguments
                Please be objective and encourage critical thinking.`
            }];

            await chat.sendMessage(systemPrompt);
            this.chatHistory.set(channelId, chat);
            console.log(`Chat initialized successfully for channel ${channelId}`);
            return chat;
        } catch (error) {
            console.error(`Error initializing chat for channel ${channelId}:`, error);
            throw new Error(`Failed to initialize chat: ${error.message}`);
        }
    }

    // Generate debate questions
    async generateQuestions(topic, count = 3) {
        try {
            console.log(`Generating ${count} questions for topic: ${topic}`);
            
            if (!topic) {
                throw new Error('Topic is required');
            }
            
            const prompt = [{
                text: `Generate ${count} thought-provoking debate questions about "${topic}". 
                Make them specific, challenging, and encourage critical thinking. 
                Format the response as a JSON array of strings.`
            }];
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log('Raw response from Gemini:', text);
            
            try {
                const questions = JSON.parse(text);
                console.log(`Successfully generated ${questions.length} questions`);
                return questions;
            } catch (parseError) {
                console.error('Error parsing Gemini response:', parseError);
                // If parsing fails, try to extract questions from the text
                const lines = text.split('\n').filter(line => line.trim().length > 0);
                return lines.slice(0, count);
            }
        } catch (error) {
            console.error(`Error generating questions for topic ${topic}:`, error);
            throw new Error(`Failed to generate questions: ${error.message}`);
        }
    }

    // Process a message and provide AI assistance
    async processMessage(channelId, message, context = {}) {
        try {
            console.log(`Processing message for channel ${channelId}: ${message.substring(0, 50)}...`);
            
            if (!channelId || !message) {
                throw new Error('Channel ID and message are required');
            }
            
            let chat = this.chatHistory.get(channelId);
            
            if (!chat) {
                console.log(`Chat not found for channel ${channelId}, initializing new chat`);
                chat = await this.initializeChat(channelId, context.topic || 'general debate');
            }

            const prompt = [{
                text: `Context: ${JSON.stringify(context)}
                User message: ${message}
                Please provide a helpful response that:
                1. Addresses the user's message
                2. Provides relevant insights or suggestions
                3. Helps maintain a constructive debate environment
                4. Encourages critical thinking`
            }];

            const result = await chat.sendMessage(prompt);
            const response = await result.response;
            const text = response.text();
            console.log(`Generated response for channel ${channelId}: ${text.substring(0, 50)}...`);
            return text;
        } catch (error) {
            console.error(`Error processing message for channel ${channelId}:`, error);
            throw new Error(`Failed to process message: ${error.message}`);
        }
    }

    // Moderate content
    async moderateContent(content) {
        try {
            const prompt = [{
                text: `Please analyze this content for:
                1. Hate speech
                2. Personal attacks
                3. Offensive language
                4. Logical fallacies
                5. Factual accuracy
                
                Content: "${content}"
                
                Return a JSON object with:
                {
                    "isAppropriate": boolean,
                    "issues": string[],
                    "suggestions": string[]
                }`
            }];

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error('Error moderating content:', error);
            throw new Error(`Failed to moderate content: ${error.message}`);
        }
    }

    // Generate counter-arguments
    async generateCounterArguments(argument) {
        try {
            const prompt = [{
                text: `Analyze this argument and provide 3 strong counter-arguments:
                "${argument}"
                
                Return a JSON array of counter-arguments, each with:
                {
                    "point": string,
                    "evidence": string,
                    "relevance": string
                }`
            }];

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error('Error generating counter-arguments:', error);
            throw new Error(`Failed to generate counter-arguments: ${error.message}`);
        }
    }

    // Clear chat history for a channel
    clearChatHistory(channelId) {
        this.chatHistory.delete(channelId);
    }
}

export default new GeminiService(); 