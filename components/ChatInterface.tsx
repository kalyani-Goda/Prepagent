import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, Loader2, Link as LinkIcon, Globe } from 'lucide-react';
import { chatWithAgent } from '../services/geminiService';
import { KnowledgeSnippet, ChatMessage, StudyPlan } from '../types';
import { GenerateContentResponse } from '@google/genai';

interface ChatInterfaceProps {
  knowledgeBase: KnowledgeSnippet[];
  currentPlan: StudyPlan | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ knowledgeBase, currentPlan }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: currentPlan 
        ? `I'm ready to help you prepare for the **${currentPlan.role}** role. We can discuss your study plan, run a mock interview, or go over specific case studies. What would you like to do?` 
        : "Please generate a study plan first, or we can just chat based on your Knowledge Base. What role are you preparing for?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Prepare history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const contextRole = currentPlan?.role || "General Interview Candidate";
      const streamResult = await chatWithAgent(history, userMsg.text, knowledgeBase, contextRole);

      const botMsgId = crypto.randomUUID();
      let fullText = '';
      let sources: Array<{uri: string, title: string}> = [];

      // Initialize empty bot message
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        isThinking: true
      }]);

      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        
        // Accumulate text
        if (c.text) {
            fullText += c.text;
        }

        // Check for grounding chunks (Search results)
        if (c.candidates?.[0]?.groundingMetadata?.groundingChunks) {
             const chunks = c.candidates[0].groundingMetadata.groundingChunks;
             chunks.forEach((gc: any) => {
                 if (gc.web?.uri) {
                     sources.push({ uri: gc.web.uri, title: gc.web.title || 'Web Source' });
                 }
             });
        }

        // Update UI immediately
        setMessages(prev => prev.map(m => 
            m.id === botMsgId 
            ? { ...m, text: fullText, isThinking: false, sources: sources.length > 0 ? sources : undefined } 
            : m
        ));
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'model',
        text: "I encountered an error connecting to the AI. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-32">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-5 py-4 rounded-2xl shadow-sm prose prose-sm max-w-none ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white prose-invert rounded-tr-none'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                }`}
              >
                {msg.isThinking && !msg.text ? (
                   <div className="flex items-center gap-2 text-slate-500">
                     <Loader2 className="animate-spin w-4 h-4" /> Thinking...
                   </div>
                ) : (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                )}
              </div>

              {/* Grounding Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                    {/* Deduplicate sources based on URI */}
                    {Array.from(new Map(msg.sources.map(s => [s.uri, s] as [string, {uri: string, title: string}])).values()).map((source, idx) => (
                        <a 
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs bg-white border border-slate-200 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                        >
                            <Globe size={12} />
                            <span className="truncate max-w-[150px]">{source.title}</span>
                        </a>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentPlan ? `Ask a question about the ${currentPlan.role} interview...` : "Type your question..."}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 pr-14 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none shadow-inner"
            rows={1}
            style={{ minHeight: '56px', maxHeight: '150px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <div className="text-center text-xs text-slate-400 mt-2">
          Gemini uses Google Search to ground answers in real-time data.
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;