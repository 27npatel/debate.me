import geminiService from '../services/geminiService.js';

class GeminiController {
    // Initialize AI chat for a debate channel
    async initializeChat(req, res) {
        try {
            const { channelId, topic } = req.body;
            
            if (!channelId || !topic) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Channel ID and topic are required' 
                });
            }
            
            console.log(`Controller: Initializing chat for channel ${channelId} with topic: ${topic}`);
            await geminiService.initializeChat(channelId, topic);
            res.json({ success: true, message: 'AI chat initialized' });
        } catch (error) {
            console.error('Controller error in initializeChat:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message || 'Failed to initialize AI chat' 
            });
        }
    }

    // Generate debate questions
    async generateQuestions(req, res) {
        try {
            const { topic, count } = req.body;
            
            if (!topic) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Topic is required' 
                });
            }
            
            console.log(`Controller: Generating ${count || 3} questions for topic: ${topic}`);
            const questions = await geminiService.generateQuestions(topic, count);
            res.json({ 
                success: true, 
                data: { questions } 
            });
        } catch (error) {
            console.error('Controller error in generateQuestions:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message || 'Failed to generate questions' 
            });
        }
    }

    // Process a message with AI assistance
    async processMessage(req, res) {
        try {
            const { channelId, message, context } = req.body;
            
            if (!channelId || !message) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Channel ID and message are required' 
                });
            }
            
            console.log(`Controller: Processing message for channel ${channelId}`);
            const response = await geminiService.processMessage(channelId, message, context);
            res.json({ success: true, response });
        } catch (error) {
            console.error('Controller error in processMessage:', error);
            res.status(500).json({ 
                success: false, 
                error: error.message || 'Failed to process message' 
            });
        }
    }

    // Moderate content
    async moderateContent(req, res) {
        try {
            const { content } = req.body;
            const moderationResult = await geminiService.moderateContent(content);
            res.json({ success: true, ...moderationResult });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Generate counter-arguments
    async generateCounterArguments(req, res) {
        try {
            const { argument } = req.body;
            const counterArguments = await geminiService.generateCounterArguments(argument);
            res.json({ success: true, counterArguments });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Clear chat history
    async clearChatHistory(req, res) {
        try {
            const { channelId } = req.params;
            geminiService.clearChatHistory(channelId);
            res.json({ success: true, message: 'Chat history cleared' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default new GeminiController(); 