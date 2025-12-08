// File: configs/InterviewAiModal.js
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export const InterviewFeedbackAI = new GoogleGenAI({
  apiKey: apiKey,
});

export const feedbackModel = 'gemini-flash-latest'; 

export const feedbackConfig = {
  responseMimeType: "application/json", 
};