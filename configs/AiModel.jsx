// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import { GoogleGenAI } from '@google/genai';

export const GenerateCourseLayout_AI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

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
  // responseMimeType: "application/json",
};

export const model = 'gemini-flash-latest';

export const contents = [
  // --- HISTORY / example ---
  {
    role: 'user',
    parts: [
      {
        text: `{
  "course_name": "Example Course Title",
  "description": "Example description for the course.",
  "category": "Programming",
  "topic": "Example Topic",
  "level": "Basic",
  "duration": "1 hour",
  "no_of_chapters": 2,
  "chapters": [
    {
      "chapter_name": "Example Chapter 1",
      "about": "This chapter teaches example content.",
      "duration": "20 minutes"
    },
    {
      "chapter_name": "Example Chapter 2",
      "about": "This chapter teaches example content.",
      "duration": "40 minutes"
    }
  ]
}`
      },
    ],
  },
  // --- USER INPUT PLACEHOLDER ---
  {
    role: 'user',
    parts: [
      {
        text: `INSERT_INPUT_HERE`,
      },
    ],
  },
];


// Generate Chapter content with AI

// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

// import {
//   GoogleGenAI,
// } from '@google/genai';

// async function main() {

export const GenerateChapterContent_AI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

// Renamed to avoid duplicate declaration
const chapterTools = [
  {
    googleSearch: {},
  },
];

// Renamed to avoid duplicate declaration
export const chapterConfig = {
  thinkingConfig: {
    thinkingBudget: -1,
  },
  tools: chapterTools,
};

// Renamed to avoid duplicate declaration
export const chapterModel = 'gemini-flash-latest';

// Renamed to avoid duplicate declaration
export const chapterContents = [
  {
    role: 'user',
    parts: [
      {
        text: `INSERT_INPUT_HERE`,
      },
    ],
  },
];

//   const response = await ai.models.generateContentStream({
//     model,
//     config,
//     contents,
//   });
//   let fileIndex = 0;
//   for await (const chunk of response) {
//     console.log(chunk.text);
//   }
// }

// main();
