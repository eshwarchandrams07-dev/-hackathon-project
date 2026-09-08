import React, { useState } from 'react';
import { 
  Flame, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Zap,
  Info,
  GraduationCap
} from 'lucide-react';
import { UpcomingExam } from '../types';
import { subjectService } from '../services/subjectService';

const STREAK_STORAGE_KEY = 'phoenix_streak_days_v1';

// Seed default streak days leading up to today (Sept 8, 2026)
const getDefaultStreakDays = (currentDate: Date): string[] => {
  const dates: string[] = [];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  // Mark recent consecutive streak (e.g. today and past 4 days)
  for (let i = 0; i < 5; i++) {
    const d = new Date(year, month, day - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  // Also sprinkle some earlier active days in the month
  const earlierDays = [1, 2];
  for (const dNum of earlierDays) {
    if (dNum < day - 4) {
      const d = new Date(year, month, dNum);
      dates.push(d.toISOString().split('T')[0]);
    }
  }

  return dates;
};

interface StreakCalendarProps {
  upcomingExams?: UpcomingExam[];
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ upcomingExams }) => {
  // Current time anchor
  const [currentDate] = useState(() => new Date());
  
  // Displayed month & year in the calendar
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth()); // 0-indexed (8 = September)

  // Stored streak dates array: ['YYYY-MM-DD', ...]
  const [streakDates, setStreakDates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STREAK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load streak dates:', e);
    }
    const initial = getDefaultStreakDays(new Date());
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(() => {
    return currentDate.toISOString().split('T')[0];
  });

  // Resolve upcoming exams list (prop or localStorage)
  const resolvedExams = upcomingExams && upcomingExams.length > 0 
    ? upcomingExams 
    : subjectService.getUpcomingExams();

  // Helper to calculate days diff safely from today's midnight
  const getExamDaysDiff = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const examD = new Date(y, m - 1, d);
    examD.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = examD.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Filter exams that fall in the currently viewed month
  const thisMonthExams = resolvedExams.filter(exam => {
    const [y, m] = exam.examDate.split('-').map(Number);
    return y === viewYear && m === viewMonth + 1;
  });

  // Calculate current streak
  const calculateStreakStats = () => {
    const dateSet = new Set(streakDates);
    let currentStreak = 0;
    let checkDate = new Date(currentDate);

    // Check consecutive days backwards from today
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dateSet.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Count this month's active days
    const thisMonthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    const thisMonthActiveDays = streakDates.filter(d => d.startsWith(thisMonthPrefix)).length;

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, 12),
      thisMonthActiveDays
    };
  };

  const { currentStreak, longestStreak, thisMonthActiveDays } = calculateStreakStats();

  const handleToggleDay = (dateStr: string) => {
    let updated: string[];
    if (streakDates.includes(dateStr)) {
      updated = streakDates.filter(d => d !== dateStr);
    } else {
      updated = [...streakDates, dateStr];
    }
    setStreakDates(updated);
    setSelectedDateStr(dateStr);
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleCheckInToday = () => {
    const todayStr = currentDate.toISOString().split('T')[0];
    if (!streakDates.includes(todayStr)) {
      const updated = [...streakDates, todayStr];
      setStreakDates(updated);
      setSelectedDateStr(todayStr);
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    setViewYear(currentDate.getFullYear());
    setViewMonth(currentDate.getMonth());
  };

  // Calendar math for viewYear, viewMonth
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Days in viewMonth
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  
  // First day of viewMonth (0 = Sun, 1 = Mon ... adjust so Monday is first)
  const firstDayRaw = new Date(viewYear, viewMonth, 1).getDay();
  const firstDayOffset = firstDayRaw === 0 ? 6 : firstDayRaw - 1; // 0 = Mon, 6 = Sun

  const todayStr = currentDate.toISOString().split('T')[0];
  const isTodayActive = streakDates.includes(todayStr);

  return (
    <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 space-y-6 shadow-sm">
      
      {/* 1. Header with Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E2EC] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-[#E6F8FB] border border-[#00A3BF]/30 text-[#00A3BF] shrink-0">
              <Flame className="h-5 w-5 fill-current" />
            </div>
            <h3 className="text-base font-bold text-[#102A43] tracking-tight flex items-center gap-2">
              <span>Daily Study Streak & Calendar</span>
            </h3>
          </div>
          <p className="text-xs text-[#627D98]">
            Keep your momentum alive by completing study modules, quizzes, or checking in daily.
          </p>
        </div>

        {/* Check in button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCheckInToday}
            disabled={isTodayActive}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
              isTodayActive
                ? 'bg-emerald-50 border border-emerald-300 text-emerald-700 cursor-default font-medium'
                : 'bg-[#00A3BF] hover:bg-[#008CA4] text-white font-bold shadow-sm cursor-pointer'
            }`}
          >
            <Flame className={`h-4 w-4 ${isTodayActive ? 'text-emerald-600' : 'fill-current'}`} />
            <span>{isTodayActive ? 'Checked In Today ✓' : 'Check In Today 🔥'}</span>
          </button>
        </div>
      </div>

      {/* 2. Streak Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Current Streak */}
        <div className="p-3.5 rounded-xl border border-[#00A3BF]/30 bg-[#E6F8FB]/60 space-y-1">
          <div className="flex items-center justify-between text-[#627D98] text-[11px] font-medium">
            <span>Current Streak</span>
            <Flame className="h-3.5 w-3.5 text-[#00A3BF] fill-current" />
          </div>
          <div className="text-xl font-bold text-[#102A43] flex items-baseline gap-1">
            <span>{currentStreak}</span>
            <span className="text-xs text-[#00A3BF] font-semibold">Days</span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-3.5 rounded-xl border border-[#7B61FF]/30 bg-[#F3F0FF]/60 space-y-1">
          <div className="flex items-center justify-between text-[#627D98] text-[11px] font-medium">
            <span>Longest Streak</span>
            <Trophy className="h-3.5 w-3.5 text-[#7B61FF]" />
          </div>
          <div className="text-xl font-bold text-[#102A43] flex items-baseline gap-1">
            <span>{longestStreak}</span>
            <span className="text-xs text-[#7B61FF] font-semibold">Days</span>
          </div>
        </div>

        {/* This Month Active */}
        <div className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F0F4F8] space-y-1">
          <div className="flex items-center justify-between text-[#627D98] text-[11px] font-medium">
            <span>Active This Month</span>
            <CalendarIcon className="h-3.5 w-3.5 text-[#627D98]" />
          </div>
          <div className="text-xl font-bold text-[#102A43] flex items-baseline gap-1">
            <span>{thisMonthActiveDays}</span>
            <span className="text-xs text-[#627D98] font-semibold">Days</span>
          </div>
        </div>

        {/* Consistency Rate */}
        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-1">
          <div className="flex items-center justify-between text-[#627D98] text-[11px] font-medium">
            <span>Consistency</span>
            <Zap className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-[#102A43] flex items-baseline gap-1">
            <span>{Math.round((thisMonthActiveDays / Math.max(1, currentDate.getDate())) * 100)}%</span>
            <span className="text-xs text-emerald-700 font-semibold">Rate</span>
          </div>
        </div>

      </div>

      {/* 3. Monthly Calendar Matrix */}
      <div className="rounded-xl border border-[#D9E2EC] bg-[#F0F4F8]/50 p-4 sm:p-5 space-y-4">
        
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-base font-bold text-[#102A43] font-display">
              {monthNames[viewMonth]} {viewYear}
            </h4>
            {(viewYear !== currentDate.getFullYear() || viewMonth !== currentDate.getMonth()) && (
              <button
                onClick={handleResetToCurrentMonth}
                className="text-[10px] px-2 py-0.5 rounded bg-white text-[#627D98] hover:text-[#102A43] border border-[#D9E2EC] transition cursor-pointer font-medium"
              >
                Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-[#D9E2EC] bg-white hover:bg-[#F0F4F8] text-[#243B53] hover:text-[#102A43] transition cursor-pointer shadow-xs"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-[#D9E2EC] bg-white hover:bg-[#F0F4F8] text-[#243B53] hover:text-[#102A43] transition cursor-pointer shadow-xs"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekday Names Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] font-bold text-[#627D98] pb-1 border-b border-[#D9E2EC]">
          {weekdayNames.map(name => (
            <div key={name} className="py-1">
              {name}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          
          {/* Empty offset padding for first week */}
          {Array.from({ length: firstDayOffset }).map((_, idx) => (
            <div key={`offset-${idx}`} className="h-10 sm:h-12 rounded-lg opacity-10 pointer-events-none" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isStreakDay = streakDates.includes(dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDateStr;

            // Check if there is an upcoming exam on this day
            const dayExams = resolvedExams.filter(e => e.examDate === dateStr);
            const hasExam = dayExams.length > 0;
            const examTooltip = hasExam 
              ? dayExams.map(e => {
                  const dDiff = getExamDaysDiff(e.examDate);
                  return dDiff === 0 
                    ? `${e.subjectName} exam is Today!` 
                    : dDiff === 1 
                    ? `${e.subjectName} exam in 1 day` 
                    : `${e.subjectName} exam in ${dDiff} days`;
                }).join(', ')
              : '';

            return (
              <button
                key={dateStr}
                onClick={() => {
                  handleToggleDay(dateStr);
                  setSelectedDateStr(dateStr);
                }}
                title={hasExam ? `🎓 ${examTooltip}` : `${dateStr}: ${isStreakDay ? 'Active Study Streak Day' : 'Rest Day'}`}
                className={`group relative h-11 sm:h-13 rounded-xl flex flex-col items-center justify-center p-1 transition-all cursor-pointer border ${
                  hasExam
                    ? 'border-[#7B61FF] bg-[#F3F0FF] ring-1 ring-[#7B61FF]/40 shadow-sm text-[#102A43]'
                    : isStreakDay
                    ? 'bg-[#E6F8FB] border-[#00A3BF]/40 text-[#00A3BF] shadow-xs'
                    : 'bg-white border-[#D9E2EC] text-[#243B53] hover:border-[#00A3BF]/40 hover:bg-[#F8FAFC]'
                } ${isToday ? 'ring-2 ring-[#00A3BF] ring-offset-1 ring-offset-white' : ''} ${
                  isSelected ? 'scale-105 z-10' : ''
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className={`text-xs font-semibold ${isToday ? 'font-black text-[#00A3BF]' : ''} ${hasExam ? 'text-[#7B61FF] font-bold' : ''}`}>
                    {dayNum}
                  </span>
                  {hasExam && (
                    <GraduationCap className="h-3 w-3 text-[#7B61FF] shrink-0" />
                  )}
                </div>

                {/* Day status indicator */}
                <div className="mt-0.5 flex items-center justify-center gap-0.5">
                  {hasExam ? (
                    <span className="text-[9px] font-bold text-[#7B61FF] truncate max-w-[40px] px-0.5 rounded bg-[#7B61FF]/15">
                      Exam
                    </span>
                  ) : isStreakDay ? (
                    <Flame className="h-3.5 w-3.5 text-[#00A3BF] fill-current" />
                  ) : (
                    <div className="h-1 w-1 rounded-full bg-[#CBD5E1] group-hover:bg-[#94A3B8]" />
                  )}
                </div>

                {/* Tiny "Today" pill */}
                {isToday && (
                  <span className="absolute -top-1.5 -right-1 px-1 py-0.2 rounded-full bg-[#00A3BF] text-[8px] font-bold text-white uppercase tracking-tighter shadow-xs">
                    Today
                  </span>
                )}
              </button>
            );
          })}

        </div>

        {/* Legend & Interactive Feedback */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D9E2EC] text-[11px] text-[#627D98]">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F3F0FF] text-[#7B61FF] border border-[#7B61FF]/30">
                <GraduationCap className="h-3 w-3 text-[#7B61FF]" />
                <span className="font-semibold text-[10px]">Upcoming Exam</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-[#00A3BF] fill-current" />
              <span>Study Streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full ring-2 ring-[#00A3BF] bg-white" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#CBD5E1]" />
              <span>Rest Day</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#627D98] italic">
            <Info className="h-3 w-3 text-[#00A3BF] shrink-0" />
            <span>Click any day to toggle your streak.</span>
          </div>
        </div>

        {/* Scheduled Exams in this Calendar Month */}
        {thisMonthExams.length > 0 && (
          <div className="pt-3 border-t border-[#D9E2EC] space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-[#102A43] flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-[#7B61FF]" />
                <span>Scheduled Exams in {monthNames[viewMonth]} {viewYear}:</span>
              </h5>
              <span className="text-[10px] text-[#627D98]">
                Changes dynamically with calendar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {thisMonthExams.map(exam => {
                const daysDiff = getExamDaysDiff(exam.examDate);
                const countdownLabel = daysDiff === 0 
                  ? `${exam.subjectName} exam is Today!` 
                  : daysDiff === 1 
                  ? `${exam.subjectName} exam in 1 day` 
                  : daysDiff > 1 
                  ? `${exam.subjectName} exam in ${daysDiff} days`
                  : `${exam.subjectName} exam finished`;

                const isUrgent = daysDiff >= 0 && daysDiff <= 10;

                return (
                  <div 
                    key={exam.id} 
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition ${
                      isUrgent 
                        ? 'bg-[#F3F0FF] border-[#7B61FF]/40 text-[#102A43]' 
                        : 'bg-white border-[#D9E2EC] text-[#243B53]'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#102A43] truncate">{countdownLabel}</span>
                        {isUrgent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#7B61FF] text-white shrink-0">
                            Dashboard Alert
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#627D98]">
                        {exam.examTitle ? `${exam.examTitle} • ` : ''}Date: {exam.examDate}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
