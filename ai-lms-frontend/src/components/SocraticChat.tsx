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
  Save,
  Network,
  Target,
  Sparkles,
  Code
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
  studyMode?: 'deep' | 'quick' | 'prompt';
  onSelectStudyMode?: (mode: 'deep' | 'quick') => void;
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
  studyMode = 'prompt',
  onSelectStudyMode,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [currentMode, setCurrentMode] = useState<'deep' | 'quick' | 'prompt'>(studyMode);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [filterCurrentLesson, setFilterCurrentLesson] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (studyMode) {
      setCurrentMode(studyMode);
    }
  }, [studyMode]);

  const handleSelectMode = (mode: 'deep' | 'quick') => {
    setCurrentMode(mode);
    onSelectStudyMode?.(mode);
    if (mode === 'deep') {
      onSendMessage("1. Deep study");
    } else {
      onSendMessage("2. Quick run");
    }
  };

  const starterPrompts = currentMode === 'quick' ? [
    { label: "Mind Map", icon: Network, prompt: "Generate a structured concept mind map for this topic with tree branches." },
    { label: "Main Topics", icon: Target, prompt: "What are the most critical, high-yield main topics for this lesson?" },
    { label: "Quick Summary", icon: BookmarkCheck, prompt: "Give me a high-speed cheat-sheet summary of key definitions and rules." },
    { label: "Formula Sheet", icon: Zap, prompt: "List all formulas, time complexities, and key metrics in a compact table." }
  ] : currentMode === 'deep' ? [
    { label: "Give analogy", icon: Lightbulb, prompt: "Can you provide a simple, real-world analogy to explain this concept?" },
    { label: "Why it works", icon: Sparkles, prompt: "Help me deeply understand the foundational mechanics and why this approach was invented." },
    { label: "Code Breakdown", icon: Code, prompt: "Walk me through the program code line-by-line explaining variable state transitions." },
    { label: "Test knowledge", icon: HelpCircle, prompt: "Ask me a Socratic question to test if I truly understand this principle." }
  ] : [
    { label: "🧠 1. Deep Study", icon: Sparkles, prompt: "1. Deep study" },
    { label: "⚡ 2. Quick Run", icon: Zap, prompt: "2. Quick run" },
    { label: "Give analogy", icon: Lightbulb, prompt: "Can you provide a real-world analogy to explain this concept?" },
    { label: "Mind Map", icon: Network, prompt: "Show me a concept mind map for this topic." }
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

    const lower = messageText.toLowerCase();
    if (lower === '1' || lower === '1.' || lower.includes('deep study') || lower.includes('option 1')) {
      setCurrentMode('deep');
      onSelectStudyMode?.('deep');
    } else if (lower === '2' || lower === '2.' || lower.includes('quick run') || lower.includes('option 2') || lower.includes('mind map')) {
      setCurrentMode('quick');
      onSelectStudyMode?.('quick');
    }

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
    <div className="flex flex-col h-full bg-[#F0F4F8] border-l border-[#D9E2EC] shadow-xl overflow-hidden select-none text-[#243B53]">
      
      {/* Header */}
      <div className="h-14 px-3 sm:px-4 border-b border-[#D9E2EC] bg-white flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="h-7 w-7 rounded-lg bg-[#F3F0FF] border border-[#7B61FF]/30 flex items-center justify-center text-[#7B61FF] shrink-0">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs text-[#102A43]">Socratic AI Tutor</h3>
              <span 
                className={`h-1.5 w-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-500' : 'bg-[#7B61FF]'}`} 
                title={isBackendOnline ? 'Database Connected & Auto-saving' : 'Saved Locally (Demo Mode)'}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#627D98] truncate">
              <span className="truncate max-w-[140px]" title={activeLesson ? activeLesson.title : 'General Course'}>
                {activeLesson ? activeLesson.title : 'General Course'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-[#00A3BF]" title="All messages saved persistently">
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
              className={`p-1.5 rounded-md transition text-[10px] flex items-center gap-1 cursor-pointer ${
                filterCurrentLesson
                  ? 'bg-[#E6F8FB] text-[#00A3BF] border border-[#00A3BF]/40'
                  : 'text-[#829AB1] hover:text-[#102A43] hover:bg-[#F0F4F8]'
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
              className="p-1.5 rounded-md text-[#829AB1] hover:text-[#102A43] hover:bg-[#F0F4F8] transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
                className="p-1.5 rounded-md text-[#829AB1] hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                title="Reset conversation history"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {showResetConfirm && (
                <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-[#D9E2EC] rounded-xl p-2.5 shadow-2xl w-48 animate-fade-in text-xs">
                  <p className="text-[#102A43] text-[11px] font-bold mb-2">
                    Clear entire chat history?
                  </p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1 rounded bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#627D98] text-[10px] transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowResetConfirm(false);
                        onResetChat();
                      }}
                      className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold transition cursor-pointer"
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
              className="p-1.5 rounded-md text-[#829AB1] hover:text-[#102A43] hover:bg-[#F0F4F8] transition cursor-pointer"
              title="Close Socratic Tutor Drawer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Mode Bar */}
      <div className="px-3.5 py-2 bg-[#F0F4F8] border-b border-[#D9E2EC] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-[#627D98] font-medium shrink-0">
          <span>Mode:</span>
          <span className={`font-bold ${currentMode === 'quick' ? 'text-[#00A3BF]' : currentMode === 'deep' ? 'text-[#7B61FF]' : 'text-[#102A43]'}`}>
            {currentMode === 'quick' ? '⚡ Quick Run' : currentMode === 'deep' ? '🧠 Deep Study' : 'Choose Mode'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#D9E2EC] shadow-2xs">
          <button
            type="button"
            onClick={() => handleSelectMode('deep')}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
              currentMode === 'deep'
                ? 'bg-[#7B61FF] text-white shadow-xs'
                : 'text-[#627D98] hover:text-[#102A43]'
            }`}
            title="1. Deep Study - Thorough conceptual understanding & analogies"
          >
            <span>🧠 1. Deep Study</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode('quick')}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
              currentMode === 'quick'
                ? 'bg-[#00A3BF] text-white shadow-xs'
                : 'text-[#627D98] hover:text-[#102A43]'
            }`}
            title="2. Quick Run - Main topics, Mind Maps & cheat-sheets"
          >
            <span>⚡ 2. Quick Run</span>
          </button>
        </div>
      </div>

      {/* Filter Active Notice Bar */}
      {filterCurrentLesson && activeLesson && (
        <div className="px-3 py-1 bg-[#E6F8FB] border-b border-[#00A3BF]/20 flex items-center justify-between text-[10px] text-[#00A3BF] font-semibold">
          <span>Filtered: Questions for "{activeLesson.title}"</span>
          <button 
            onClick={() => setFilterCurrentLesson(false)}
            className="text-[#627D98] hover:text-[#102A43] underline underline-offset-2"
          >
            Show All
          </button>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0 select-text">
        {/* Interactive Option 1 / Option 2 Choice Card */}
        {currentMode === 'prompt' && (
          <div className="p-3.5 rounded-xl border border-[#D9E2EC] bg-white shadow-sm space-y-2.5 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#7B61FF]" />
              <p className="text-xs font-bold text-[#102A43]">Select Your Learning Mode:</p>
            </div>
            <p className="text-[11px] text-[#627D98] leading-relaxed">
              Click an option below or type <span className="font-mono text-[#102A43] font-bold">1</span> or <span className="font-mono text-[#102A43] font-bold">2</span>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectMode('deep')}
                className="p-3 rounded-lg border border-[#7B61FF]/30 bg-[#F3F0FF] hover:bg-[#EBE5FF] text-left transition group space-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7B61FF]">🧠 Option 1: Deep Study</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#7B61FF] text-white font-bold">1</span>
                </div>
                <p className="text-[10px] text-[#243B53]/80 group-hover:text-[#243B53] leading-snug">
                  Master concepts from first principles with step-by-step logic, analogies & Socratic inquiry.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('quick')}
                className="p-3 rounded-lg border border-[#00A3BF]/30 bg-[#E6F8FB] hover:bg-[#D4F3F8] text-left transition group space-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#00A3BF]">⚡ Option 2: Quick Run</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00A3BF] text-white font-bold">2</span>
                </div>
                <p className="text-[10px] text-[#243B53]/80 group-hover:text-[#243B53] leading-snug">
                  Fast revision focusing on main topics, visual <strong>Mind Maps</strong> & cheat-sheet formulas.
                </p>
              </button>
            </div>
          </div>
        )}
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
                    ? 'bg-[#00A3BF] text-white font-bold'
                    : 'bg-[#F3F0FF] text-[#7B61FF] border border-[#7B61FF]/30 font-bold'
                }`}
              >
                {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#00A3BF] text-white shadow-xs'
                    : 'bg-white text-[#243B53] border border-[#D9E2EC] shadow-xs markdown-body'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-[#D9E2EC] flex items-center gap-1">
                        <span className="text-[10px] text-[#627D98]">Citations:</span>
                        {msg.citations.map((p, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.2 rounded bg-[#E6F8FB] text-[#00A3BF] font-mono text-[10px] font-semibold border border-[#00A3BF]/30"
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
                    isUser ? 'text-white/80 justify-end' : 'text-[#829AB1]'
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
            <div className="h-6 w-6 rounded-md bg-[#F3F0FF] text-[#7B61FF] border border-[#7B61FF]/30 flex items-center justify-center shrink-0">
              <Bot className="h-3 w-3" />
            </div>
            <div className="bg-white border border-[#D9E2EC] rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs text-[#627D98] shadow-xs">
              <Loader2 className="h-3 w-3 animate-spin text-[#7B61FF]" />
              <span>Formulating Socratic guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      <div className="px-3 py-2 bg-white border-t border-[#D9E2EC] shrink-0 z-10">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {starterPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                disabled={isThinking}
                onClick={() => handlePromptClick(item.prompt)}
                className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F0F4F8] border border-[#D9E2EC] hover:border-[#00A3BF] hover:bg-[#E6F8FB] hover:text-[#00A3BF] text-[#243B53] text-[11px] font-medium transition disabled:opacity-40 cursor-pointer shadow-2xs"
              >
                <Icon className="h-3.5 w-3.5 text-[#00A3BF]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Box - Solid Opaque Background */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-[#D9E2EC] shrink-0 shadow-lg z-10">
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
            className="w-full bg-white text-[#102A43] font-medium placeholder-[#627D98] text-xs rounded-xl pl-3.5 pr-11 py-2.5 border-2 border-[#00A3BF] focus:outline-none focus:ring-2 focus:ring-[#00A3BF]/25 shadow-sm resize-none max-h-24 transition"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isThinking}
            className={`absolute right-2 p-1.5 rounded-lg transition cursor-pointer ${
              inputValue.trim() && !isThinking
                ? 'bg-[#00A3BF] hover:bg-[#008CA4] text-white shadow-sm'
                : 'text-[#829AB1]/40 cursor-not-allowed'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-0.5 text-[10px] text-[#627D98] font-medium">
          <span>Enter to send • Shift+Enter for newline</span>
          <span className="flex items-center gap-1">
            <Save className="h-3 w-3 text-[#00A3BF]" />
            <span>History saved</span>
          </span>
        </div>
      </form>
    </div>
  );
};
