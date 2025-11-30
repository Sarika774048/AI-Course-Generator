"use client";
import { useState } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaComments, FaCircle } from "react-icons/fa";
// Import Client and Model Name from your config
import { GenerateChapterContent_AI, chapterModel } from "@/configs/AiModel"; 

const CourseChatbot = ({ courseName, chapterName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "model", text: `Hi! I'm your AI Tutor for "${courseName}". Ask me anything about ${chapterName}!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      // 1. Construct Context-Aware Prompt
      const PROMPT = `
        You are an expert tutor for the course "${courseName}". 
        The student is currently studying the chapter: "${chapterName}".
        
        Student Question: "${userMsg}"
        
        Answer concisely (max 3-4 sentences). If they ask for code, provide a short, clean snippet.
      `;

      // 2. Call API (Using .models as per your config)
      const result = await GenerateChapterContent_AI.models.generateContent({
        model: chapterModel || 'gemini-1.5-flash', 
        contents: [{ role: "user", parts: [{ text: PROMPT }] }]
      });

      // 3. ROBUST TEXT EXTRACTION (Fixes the crash)
      let responseText = "";

      // Check if .response exists (Standard SDK)
      if (result.response) {
          const response = await result.response;
          // Check if .text() is a function or just a property
          if (typeof response.text === 'function') {
              responseText = response.text();
          } else {
              responseText = response.text || JSON.stringify(response);
          }
      } 
      // Check if result.text is a string (Your specific error case)
      else if (typeof result.text === 'string') {
          responseText = result.text;
      }
      // Check if result.text is a function
      else if (typeof result.text === 'function') {
          responseText = result.text();
      } 
      // Fallback
      else {
          responseText = "I received a response, but couldn't parse the text. Please try again.";
      }

      // Add AI response to UI
      setMessages(prev => [...prev, { role: "model", text: responseText }]);

    } catch (e) {
      console.error("Chat Error:", e);
      setMessages(prev => [...prev, { role: "model", text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                    <FaRobot size={18} className="text-white"/>
                </div>
                <div>
                    <h3 className="font-bold text-sm tracking-wide">AI Tutor</h3>
                    <div className="flex items-center gap-1.5 opacity-80">
                        <FaCircle size={6} className="text-green-400 animate-pulse" />
                        <p className="text-[10px] font-medium">Online</p>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
            >
                <FaTimes size={14} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3.5 max-w-[85%] text-sm shadow-sm leading-relaxed whitespace-pre-wrap
                    ${msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white text-gray-700 border border-gray-200 rounded-2xl rounded-tl-sm'
                    }`}>
                    {msg.text}
                  </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question..."
                    className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
                    autoFocus
                />
                <button 
                    onClick={handleSend} 
                    disabled={loading || !input.trim()}
                    className="text-purple-600 hover:text-purple-800 disabled:opacity-30 disabled:cursor-not-allowed transition-transform active:scale-95 p-1"
                >
                    <FaPaperPlane size={16} />
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
            onClick={() => setIsOpen(true)} 
            className="group flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          <FaComments size={24} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-sm whitespace-nowrap">
            Ask AI Tutor
          </span>
        </button>
      )}
    </div>
  );
};

export default CourseChatbot;