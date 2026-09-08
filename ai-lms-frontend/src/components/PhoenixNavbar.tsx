import React, { useState, useRef, useEffect } from 'react';
import { 
  Flame, 
  Search, 
  Bell, 
  AlertCircle,
  X,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { Subject } from '../types';

interface PhoenixNavbarProps {
  studentName?: string;
  isBackendOnline: boolean;
  subjects?: Subject[];
  onSelectSubject?: (subject: Subject) => void;
  onSearch?: (query: string) => void;
  onOpenUpload?: () => void;
}

export const PhoenixNavbar: React.FC<PhoenixNavbarProps> = ({
  studentName = 'Eshwar',
  isBackendOnline,
  subjects = [],
  onSelectSubject,
  onSearch
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close and collapse search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
        setSearchQuery('');
        onSearch?.('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSearch]);

  // Global shortcut ⌘K / Ctrl+K to expand and focus search, Escape to collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsExpanded(true);
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 50);
      } else if (e.key === 'Escape') {
        setIsExpanded(false);
        setSearchQuery('');
        onSearch?.('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filter subjects by name, code, description, and module/lesson topics
  const matchedSubjects = subjects.filter(sub => {
    if (!normalizedQuery) return false;
    const nameMatch = sub.name.toLowerCase().includes(normalizedQuery);
    const codeMatch = sub.code?.toLowerCase().includes(normalizedQuery);
    const descMatch = sub.description?.toLowerCase().includes(normalizedQuery);
    const materialMatch = sub.materials?.some(m =>
      m.fileName.toLowerCase().includes(normalizedQuery) ||
      m.course?.course_title.toLowerCase().includes(normalizedQuery) ||
      m.course?.modules?.some(mod =>
        mod.title.toLowerCase().includes(normalizedQuery) ||
        mod.lessons?.some(les => les.title.toLowerCase().includes(normalizedQuery))
      )
    );
    return nameMatch || codeMatch || descMatch || materialMatch;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch?.(val);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleSelect = (sub: Subject) => {
    setIsExpanded(false);
    setSearchQuery('');
    onSearch?.('');
    onSelectSubject?.(sub);
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && matchedSubjects.length > 0) {
      handleSelect(matchedSubjects[0]);
    }
  };

  return (
    <header className="h-16 w-full border-b border-[#D9E2EC] bg-white px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30 shadow-xs">
      
      {/* 1. Left: Phoenix Branding */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-[#102A43] via-[#1B3A57] to-[#7B61FF] shadow-md shadow-[#102A43]/15 text-white">
          <Flame className="h-5 w-5 fill-white/20 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-[#102A43] font-display">
              Phoenix
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#F3F0FF] text-[#7B61FF] border border-[#7B61FF]/30">
              AI LMS
            </span>
          </div>
          <span className="text-[11px] text-[#627D98] -mt-0.5">
            Adaptive Socratic Platform
          </span>
        </div>
      </div>

      {/* 2. Middle spacer: lets the search bar smoothly expand into this space */}
      <div className="flex-1 min-w-0" />

      {/* 3. Right: API status badge, Animated Expandable Search Icon (beside API), Notification Bell & Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        
        {/* Backend health status badge */}
        <div 
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition ${
            isBackendOnline 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600'
          }`}
          title={isBackendOnline ? "FastAPI backend connected on :8000" : "FastAPI server unreachable"}
        >
          {isBackendOnline ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>API :8000 Online</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 text-rose-500" />
              <span>API Offline</span>
            </>
          )}
        </div>

        {/* Animated Expandable Search Icon (Positioned directly beside API status badge) */}
        <div ref={searchContainerRef} className="relative">
          {!isExpanded ? (
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setTimeout(() => inputRef.current?.focus(), 60);
              }}
              className="relative h-9 w-9 rounded-xl border border-[#D9E2EC] bg-[#F0F4F8] hover:bg-[#E2E8F0] hover:border-[#00A3BF]/50 text-[#627D98] hover:text-[#00A3BF] flex items-center justify-center transition-all duration-200 shadow-2xs cursor-pointer group"
              title="Search subjects (⌘K)"
            >
              <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </button>
          ) : (
            <div className="relative flex items-center transition-all duration-300 ease-out w-64 sm:w-80 md:w-96 lg:w-[420px] animate-fade-in">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00A3BF] pointer-events-none" />
              
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDownInput}
                placeholder="Search subjects (e.g. Operating System, DBMS)..."
                className="w-full h-9 pl-9 pr-18 rounded-xl bg-white border border-[#00A3BF] ring-2 ring-[#00A3BF]/20 text-xs text-[#102A43] placeholder-[#829AB1] focus:outline-none shadow-md transition"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded-full hover:bg-[#F0F4F8] text-[#829AB1] hover:text-[#102A43] transition cursor-pointer"
                    title="Clear text"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setSearchQuery('');
                    onSearch?.('');
                  }}
                  className="px-1.5 py-0.5 rounded bg-[#F0F4F8] hover:bg-[#E2E8F0] border border-[#D9E2EC] text-[10px] font-mono text-[#829AB1] hover:text-[#102A43] transition cursor-pointer"
                  title="Close search (Esc)"
                >
                  Esc
                </button>
              </div>

              {/* Autocomplete Subject Matches Dropdown */}
              {searchQuery.trim().length > 0 && (
                <div className="absolute top-full right-0 w-[320px] sm:w-[380px] md:w-[420px] mt-2 rounded-2xl bg-white border border-[#D9E2EC] shadow-2xl z-50 overflow-hidden animate-fade-in text-[#243B53]">
                  {/* Header */}
                  <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#D9E2EC] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#627D98] uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-[#00A3BF]" />
                      <span>Matching Subjects ({matchedSubjects.length})</span>
                    </span>
                    <span className="text-[10px] text-[#829AB1] font-mono">
                      Enter ↵ to open
                    </span>
                  </div>

                  {/* Subject List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#F0F4F8] custom-scrollbar">
                    {matchedSubjects.length > 0 ? (
                      matchedSubjects.map((sub, idx) => {
                        const totalMaterials = sub.materials?.length || 0;
                        const totalModules = sub.materials?.[0]?.course?.modules?.length || 0;
                        const isFirst = idx === 0;

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleSelect(sub)}
                            className={`w-full text-left px-3.5 py-2.5 hover:bg-[#E6F8FB]/60 transition flex items-center justify-between gap-3 group cursor-pointer ${
                              isFirst ? 'bg-[#F8FAFC]/50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-[#E6F8FB] border border-[#00A3BF]/30 text-[#00A3BF] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <BookOpen className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-[#102A43] group-hover:text-[#00A3BF] truncate">
                                    {sub.name}
                                  </span>
                                  {sub.code && (
                                    <span className="px-1 py-0.2 rounded bg-[#F0F4F8] border border-[#D9E2EC] text-[9px] font-mono font-bold text-[#627D98] shrink-0">
                                      {sub.code}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px] text-[#627D98]">
                                  <span>{totalMaterials} {totalMaterials === 1 ? 'PDF' : 'PDFs'}</span>
                                  {totalModules > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{totalModules} mods</span>
                                    </>
                                  )}
                                  {sub.progressPercent !== undefined && (
                                    <>
                                      <span>•</span>
                                      <span className={sub.progressPercent === 100 ? 'text-emerald-600 font-semibold' : 'text-[#00A3BF] font-semibold'}>
                                        {sub.progressPercent}%
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white group-hover:bg-[#00A3BF] border border-[#D9E2EC] group-hover:border-[#00A3BF] text-[#243B53] group-hover:text-white text-[11px] font-semibold shadow-2xs transition shrink-0">
                              <span>Open</span>
                              <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-5 text-center space-y-1.5">
                        <div className="h-8 w-8 rounded-full bg-[#F0F4F8] border border-[#D9E2EC] flex items-center justify-center mx-auto text-[#829AB1]">
                          <Search className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-bold text-[#102A43]">
                          No subjects found for "{searchQuery}"
                        </p>
                        <p className="text-[10px] text-[#627D98]">
                          Try searching "Operating System", "DBMS", or "Data Structures".
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="px-3 py-1.5 bg-[#F8FAFC] border-t border-[#D9E2EC] flex items-center justify-between text-[9px] font-mono text-[#829AB1]">
                    <span>Click to open • Esc to close</span>
                    <span>AI LMS Subject Index</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(prev => !prev)}
            className="relative p-2 rounded-xl border border-[#D9E2EC] bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#243B53] transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#7B61FF] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-[#D9E2EC] p-3 shadow-xl z-50 text-xs text-[#243B53] space-y-2 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-2">
                <span className="font-bold text-[#102A43]">Notifications</span>
                <span className="text-[10px] text-[#00A3BF] font-semibold cursor-pointer">Mark read</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F3F0FF] border border-[#7B61FF]/30 text-[#243B53]">
                <p className="font-semibold text-[#102A43]">Binary Search Trees Quiz Due</p>
                <p className="text-[11px] text-[#627D98] mt-0.5">Recommended 5-min refresher ready.</p>
              </div>
              <div className="p-2 rounded-lg bg-[#F0F4F8] border border-[#D9E2EC] text-[#243B53]">
                <p className="font-semibold text-[#102A43]">Database Systems Course Ready</p>
                <p className="text-[11px] text-[#627D98] mt-0.5">3 modules synthesized from PDF.</p>
              </div>
            </div>
          )}
        </div>

        {/* Student Avatar (Matches "E" in screenshot) */}
        <div className="flex items-center gap-2.5 pl-1 border-l border-[#D9E2EC]">
          <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-[#102A43] via-[#1B3A57] to-[#00A3BF] text-white font-bold text-sm shadow-md shadow-[#102A43]/20 ring-1 ring-[#00A3BF]/40">
            {studentName.charAt(0).toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-[#102A43] leading-none">
              {studentName}
            </span>
            <span className="text-[10px] text-[#627D98] leading-none mt-1 font-medium">
              Computer Science
            </span>
          </div>
        </div>

      </div>

    </header>
  );
};
