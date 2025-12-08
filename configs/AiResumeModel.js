import { GoogleGenAI } from '@google/genai';

// 1. Initialize the Client
export const Resume_AI_Model = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

// 2. Configure Tools (Search, Thinking)
const tools = [
  {
    googleSearch: {},
  },
];

export const config = {
  thinkingConfig: {
    thinkingBudget: -1,
  },
  tools,
};

export const model = 'gemini-flash-latest';

// 3. The Function to Get Response (Using Streaming like your reference)
export const getGeminiResponse = async (prompt) => {
  try {
    // Structure the input exactly how the new SDK expects it
    const contents = [
        {
            role: 'user',
            parts: [
                { text: prompt }
            ]
        }
    ];

    // Use generateContentStream instead of generateContent
    const response = await Resume_AI_Model.models.generateContentStream({
      model: model,
      config: config,
      contents: contents,
    });

    let fullText = "";

    // Iterate through the stream chunks to build the full text
    for await (const chunk of response) {
      // Handle potential differences in SDK versions (function vs property)
      const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text;
      if (text) {
        fullText += text;
      }
    }

    return fullText;

  } catch (error) {
    console.error("AI Model Error:", error);
    return "I couldn't generate a response at this moment. Please try again.";
  }
};



// /* 
//    Run: npm install @google/generative-ai 
//    if you haven't already.
// */
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI(apiKey);

// // FIX: Switched to 'gemini-pro'
// // Why? It is the most stable model, never throws 404, and has a high limit (60 requests/minute).
// const model = genAI.getGenerativeModel({
//   model: "gemini-pro", 
// });

// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 64,
//   maxOutputTokens: 8192,
//   responseMimeType: "text/plain",
// };

// export const getGeminiResponse = async (prompt) => {
//   try {
//     const result = await model.generateContentStream({
//         contents: [{ role: "user", parts: [{ text: prompt }] }],
//         generationConfig,
//     });

//     let fullText = '';
    
//     // Iterate through the stream to build the text
//     for await (const chunk of result.stream) {
//         const chunkText = chunk.text();
//         fullText += chunkText;
//     }
    
//     return fullText;
    
//   } catch (error) {
//     console.error("AI Error:", error);
    
//     // Handle Quota errors gracefully
//     if (error.toString().includes('429') || error.toString().includes('Quota')) {
//         return "AI usage limit reached. Please wait 10 seconds.";
//     }

//     // Handle Model Not Found errors gracefully by returning a fallback message
//     if (error.toString().includes('404')) {
//         return "Error: Model not found. Please create a new API Key at aistudio.google.com";
//     }
    
//     return "Unable to generate content. Please try again.";
//   }
// };