import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Lesson } from '../types';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Lightbulb, 
  HelpCircle, 
  Zap, 
  BookmarkCheck,
  RotateCcw,
  X,
  Download,
  Database,
  Filter,
  Check,
  Save
} from 'lucide-react';

interface SocraticChatProps {
  activeLesson: Lesson | null;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isThinking: boolean;
  onResetChat?: () => void;
  onClose?: () => void;
  onExportChat?: () => void;
  courseTitle?: string;
  isBackendOnline?: boolean;
}

export const SocraticChat: React.FC<SocraticChatProps> = ({
  activeLesson,
  messages,
  onSendMessage,
  isThinking,
  onResetChat,
  onClose,
  onExportChat,
  courseTitle,
  isBackendOnline = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [filterCurrentLesson, setFilterCurrentLesson] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const starterPrompts = [
    { label: "Give analogy", icon: Lightbulb, prompt: "Can you provide a simple, real-world analogy to explain this concept?" },
    { label: "Test knowledge", icon: HelpCircle, prompt: "Ask me a Socratic question to test if I truly understand this principle." },
    { label: "Why it matters", icon: Zap, prompt: "Why is this foundation so critical in practical engineering?" },
    { label: "Key takeaways", icon: BookmarkCheck, prompt: "What are the three most crucial takeaways I should remember?" }
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

  // Filter messages if toggled
  const filteredMessages = filterCurrentLesson && activeLesson
    ? messages.filter(m => !m.lessonId || m.lessonId === activeLesson.lesson_id)
    : messages;

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] border-l border-slate-800/80 shadow-xl overflow-hidden select-none">
      
      {/* Header */}
      <div className="h-14 px-3 sm:px-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="h-7 w-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-xs text-white">Socratic Companion</h3>
              <span 
                className={`h-1.5 w-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                title={isBackendOnline ? 'Database Connected & Auto-saving' : 'Saved Locally (Demo Mode)'}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate">
              <span className="truncate max-w-[140px]" title={activeLesson ? activeLesson.title : 'General Course'}>
                {activeLesson ? activeLesson.title : 'General Course'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-emerald-400/90" title="All messages saved persistently">
                <Database className="h-2.5 w-2.5" />
                <span>Saved</span>
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Filter this lesson toggle */}
          {activeLesson && (
            <button
              onClick={() => setFilterCurrentLesson(prev => !prev)}
              className={`p-1.5 rounded-md transition text-[10px] flex items-center gap-1 ${
                filterCurrentLesson
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
              }`}
              title={filterCurrentLesson ? "Showing current lesson messages (click to show all)" : "Filter to current lesson messages"}
            >
              <Filter className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Export Chat Notes */}
          {onExportChat && (
            <button
              onClick={onExportChat}
              disabled={messages.length <= 1}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition disabled:opacity-30 disabled:cursor-not-allowed"
              title="Download Chat History as Markdown Study Notes"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Reset Chat with Confirmation */}
          {onResetChat && (
            <div className="relative">
              <button
                onClick={() => setShowResetConfirm(prev => !prev)}
                className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 transition"
                title="Reset conversation history"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {showResetConfirm && (
                <div className="absolute right-0 top-full mt-1.5 z-50 bg-[#0f1523] border border-slate-700/80 rounded-xl p-2.5 shadow-2xl w-48 animate-fade-in text-xs">
                  <p className="text-slate-200 text-[11px] font-medium mb-2">
                    Clear entire chat history?
                  </p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowResetConfirm(false);
                        onResetChat();
                      }}
                      className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-medium transition"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close Panel Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition"
              title="Close Socratic Tutor Drawer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Active Notice Bar */}
      {filterCurrentLesson && activeLesson && (
        <div className="px-3 py-1 bg-brand-950/40 border-b border-brand-900/40 flex items-center justify-between text-[10px] text-brand-300">
          <span>Filtered: Questions for "{activeLesson.title}"</span>
          <button 
            onClick={() => setFilterCurrentLesson(false)}
            className="text-slate-400 hover:text-white underline underline-offset-2"
          >
            Show All
          </button>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0 select-text">
        {filteredMessages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`h-6 w-6 rounded-md shrink-0 flex items-center justify-center text-[10px] ${
                  isUser
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 text-brand-300 border border-slate-700/50'
                }`}
              >
                {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-900/80 text-slate-200 border border-slate-800/80 markdown-body'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">Citations:</span>
                        {msg.citations.map((p, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-300 font-mono text-[10px]"
                          >
                            p. {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`text-[9px] font-mono mt-1 flex items-center justify-between gap-2 ${
                    isUser ? 'text-brand-200/70 justify-end' : 'text-slate-500'
                  }`}
                >
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex items-start gap-2.5">
            <div className="h-6 w-6 rounded-md bg-slate-800 text-brand-400 border border-slate-700/50 flex items-center justify-center shrink-0">
              <Bot className="h-3 w-3" />
            </div>
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3 w-3 animate-spin text-brand-400" />
              <span>Formulating Socratic guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      <div className="px-3 py-1.5 bg-slate-950/40 border-t border-slate-800/70 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {starterPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                disabled={isThinking}
                onClick={() => handlePromptClick(item.prompt)}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 text-[11px] transition disabled:opacity-40"
              >
                <Icon className="h-3 w-3 text-brand-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-slate-950/80 border-t border-slate-800/80 shrink-0">
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
                ? `Ask about "${activeLesson.title}"...` 
                : "Ask your Socratic question..."
            }
            className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs rounded-lg pl-3 pr-9 py-2 border border-slate-800 focus:outline-none focus:border-brand-500 resize-none max-h-24"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className={`absolute right-1.5 p-1 rounded-md transition ${
              inputValue.trim() && !isThinking
                ? 'bg-brand-600 hover:bg-brand-500 text-white'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1 px-0.5 text-[9px] text-slate-500">
          <span>Enter to send • Shift+Enter for newline</span>
          <span className="flex items-center gap-1">
            <Save className="h-2.5 w-2.5 text-emerald-400" />
            <span>History saved</span>
          </span>
        </div>
      </form>
    </div>
  );
};
