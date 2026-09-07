import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Lesson } from '../types';
import { apiService } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2, 
  Lightbulb, 
  HelpCircle, 
  Zap, 
  BookmarkCheck,
  RotateCcw
} from 'lucide-react';

interface SocraticChatProps {
  activeLesson: Lesson | null;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isThinking: boolean;
  onResetChat?: () => void;
}

export const SocraticChat: React.FC<SocraticChatProps> = ({
  activeLesson,
  messages,
  onSendMessage,
  isThinking,
  onResetChat,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const starterPrompts = [
    { label: "Give me an analogy", icon: Lightbulb, prompt: "Can you provide a simple, real-world analogy to explain this concept?" },
    { label: "Test my knowledge", icon: HelpCircle, prompt: "Ask me a Socratic question to test if I truly understand this principle." },
    { label: "Why does this matter?", icon: Zap, prompt: "Why is this mathematical foundation so critical in practical engineering?" },
    { label: "Summarize key ideas", icon: BookmarkCheck, prompt: "What are the three most crucial takeaways I must retain from this section?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    const messageText = inputValue.trim();
    setInputValue('');
    await onSendMessage(messageText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-md shadow-brand-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Bot className="h-5 w-5 text-accent-cyan" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white">Socratic AI Tutor</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              Context: {activeLesson ? activeLesson.title : 'General Course Material'}
            </p>
          </div>
        </div>

        {onResetChat && (
          <button
            onClick={onResetChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Reset conversation"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-xs shadow-sm ${
                  isUser
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 text-accent-cyan border border-slate-700/60'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-600/20'
                    : 'bg-slate-950/80 text-slate-200 border border-slate-800/90 rounded-tl-none markdown-body'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Citations:</span>
                        {msg.citations.map((p, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono text-[10px]"
                          >
                            Page {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`text-[10px] mt-1.5 ${
                    isUser ? 'text-brand-200/80 text-right' : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking / Loading indicator */}
        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-800 text-accent-cyan border border-slate-700/60 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent-cyan" />
              <span>Socratic Tutor is formulating a guiding response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 shrink-0">
        <p className="text-[11px] text-slate-500 mb-1.5 font-medium flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-accent-cyan" />
          <span>Socratic Prompts</span>
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {starterPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                disabled={isThinking}
                onClick={() => handlePromptClick(item.prompt)}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-brand-500/40 hover:bg-slate-800/60 text-slate-300 hover:text-white text-[11px] font-medium transition active:scale-95 disabled:opacity-40"
              >
                <Icon className="h-3 w-3 text-brand-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
        <div className="relative flex items-center">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            placeholder={
              activeLesson 
                ? `Ask anything about "${activeLesson.title}"...` 
                : "Ask a question about the course..."
            }
            className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-xs sm:text-sm rounded-xl pl-3.5 pr-11 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500 resize-none max-h-28"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className={`absolute right-2 p-1.5 rounded-lg transition ${
              inputValue.trim() && !isThinking
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-slate-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>Endpoint: /api/chat</span>
        </div>
      </form>
    </div>
  );
};
