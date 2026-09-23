import { GoogleGenerativeAI } from '@google/generative-ai';

async function test() {
  try {
    const apiKey = process.env.API_KEY || 'fake-key';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      systemInstruction: 'You are a bot.',
    });
    
    console.log('Model initialized successfully.');
  } catch(e) {
    console.error(e);
  }
}

test();
