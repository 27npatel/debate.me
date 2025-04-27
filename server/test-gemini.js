import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the API key
const apiKey = process.env.GEMINI_API_KEY;
console.log('Using Gemini API key:', apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}` : 'Not found');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);

// Initialize the model - using the latest model name
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Test function
async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API...');
    
    // Simple test prompt
    const prompt = [{ text: 'Hello, can you respond with a short greeting?' }];
    console.log('Sending prompt:', JSON.stringify(prompt, null, 2));
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Response received:', text);
    console.log('Gemini API test successful!');

    // Test chat functionality
    console.log('\nTesting chat functionality...');
    const chat = model.startChat();
    
    // Send system prompt
    const systemResponse = await chat.sendMessage([
      { text: "You are a helpful AI assistant. Please respond with 'Chat initialized successfully' if you understand." }
    ]);
    console.log('System response:', systemResponse.response.text());

    // Send user message
    const chatResponse = await chat.sendMessage([{ text: "Are you ready?" }]);
    console.log('Chat response:', chatResponse.response.text());
    console.log('Chat test successful!');
  } catch (error) {
    console.error('Error testing Gemini API:', error);
    console.error('Error details:', error.message);
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
  }
}

// Run the test
testGeminiAPI(); 