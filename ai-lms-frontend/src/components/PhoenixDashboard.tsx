import React, { useState } from 'react';
import { Subject, SmartAssessment, UpcomingExam } from '../types';
import { subjectService } from '../services/subjectService';
import { 
  Code, 
  GitBranch, 
  Database, 
  BookOpen, 
  Clock, 
  Calendar, 
  CalendarDays,
  AlarmClock,
  Play, 
  Lightbulb, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  X
} from 'lucide-react';

interface PhoenixDashboardProps {
  studentName?: string;
  subjects: Subject[];
  onSelectSubject: (subject: Subject) => void;
  onViewAllCourses: () => void;
  onStartRefresher: (topic: string) => void;
  onUpdateProgress?: (subjectId: string, percent: number) => void;
  completedAssessmentIds?: string[];
  upcomingExams?: UpcomingExam[];
  onAddExam?: (subjectId: string, subjectName: string, examDate: string, examTitle?: string) => void;
  onDeleteExam?: (examId: string) => void;
}

export const PhoenixDashboard: React.FC<PhoenixDashboardProps> = ({
  studentName = 'Eshwar',
  subjects,
  onSelectSubject,
  onViewAllCourses,
  onStartRefresher,
  onUpdateProgress,
  completedAssessmentIds = [],
  upcomingExams = [],
  onAddExam,
  onDeleteExam
}) => {
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [examSubject, setExamSubject] = useState(subjects[0]?.name || 'DBMS');
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTitle, setExamTitle] = useState('');

  // Dynamically get assessments matching ONLY current subjects (e.g. DBMS & OS)
  const activeSmartAssessments = subjectService.getSmartAssessmentsForSubjects(subjects);

  // Filter exams that are in the next 10 days (0 to 10 days)
  const urgentExams = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return upcomingExams
      .map(exam => {
        const [y, m, d] = exam.examDate.split('-').map(Number);
        const examD = new Date(y, m - 1, d);
        examD.setHours(0, 0, 0, 0);
        const diffMs = examD.getTime() - today.getTime();
        const daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return { exam, daysDiff };
      })
      .filter(item => item.daysDiff >= 0 && item.daysDiff <= 10)
      .sort((a, b) => a.daysDiff - b.daysDiff);
  })();

  const formatExamDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Dynamically determine refresher topic based on current subjects
  const refresherTopic = (() => {
    const hasDbms = subjects.some(s => s.name.toLowerCase().includes('db') || s.code?.toLowerCase().includes('db'));
    const hasOs = subjects.some(s => s.name.toLowerCase().includes('os') || s.code?.toLowerCase().includes('os'));
    if (hasDbms) return 'Relational Normalization';
    if (hasOs) return 'Process Scheduling';
    return subjects[0]?.name || 'Core Fundamentals';
  })();

  const getSubjectIcon = (icon?: string, color?: string) => {
    switch (icon) {
      case 'code':
        return <Code className="h-5 w-5 text-blue-400" />;
      case 'git-branch':
        return <GitBranch className="h-5 w-5 text-emerald-400" />;
      case 'database':
        return <Database className="h-5 w-5 text-purple-400" />;
      default:
        return <BookOpen className="h-5 w-5 text-violet-400" />;
    }
  };

  const getSubjectColorClasses = (color?: string) => {
    switch (color) {
      case 'blue':
        return {
          iconBox: 'bg-[#E6F8FB] border border-[#00A3BF]/30 text-[#00A3BF]',
          bar: 'bg-[#00A3BF]',
          text: 'text-[#00A3BF]'
        };
      case 'emerald':
        return {
          iconBox: 'bg-emerald-50 border border-emerald-200 text-emerald-600',
          bar: 'bg-emerald-500',
          text: 'text-emerald-600'
        };
      case 'purple':
      default:
        return {
          iconBox: 'bg-[#F3F0FF] border border-[#7B61FF]/30 text-[#7B61FF]',
          bar: 'bg-[#7B61FF]',
          text: 'text-[#7B61FF]'
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in text-[#243B53]">
      
      {/* 1. Welcome Hero Banner with AI Insight (Aether Purple with Quantum Teal CTA) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#7B61FF] via-[#6348EE] to-[#4F35D2] border border-[#7B61FF]/30 p-6 sm:p-8 text-white shadow-xl shadow-[#7B61FF]/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Welcome back, {studentName}! 👋
            </h1>

            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-white/95 leading-relaxed bg-white/15 backdrop-blur-md p-3.5 rounded-xl border border-white/20">
              <span className="text-base shrink-0">💡</span>
              <p>
                <span className="font-bold text-white">AI Insight:</span> You struggled slightly with <span className="underline decoration-white/60 font-semibold text-white">{refresherTopic}</span> in your last assessment. I've generated a quick 5-minute refresher module for you.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => onStartRefresher(refresherTopic)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00A3BF] hover:bg-[#008CA4] text-white font-bold text-sm tracking-wide transition shadow-lg shadow-[#00A3BF]/30 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start Refresher</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* Decorative background glows */}
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 h-36 w-36 rounded-full bg-[#00A3BF]/25 blur-2xl pointer-events-none" />
      </section>

      {/* 2. Upcoming Exam Countdown Alert (Clean display if exam is in next 10 days) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#7B61FF]" />
            <h2 className="text-xs font-bold text-[#627D98] uppercase tracking-wider">
              Upcoming Exam Schedule
            </h2>
          </div>
          {onAddExam && (
            <button
              onClick={() => setIsAddExamModalOpen(true)}
              className="text-xs font-bold text-[#00A3BF] hover:text-[#008CA4] flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule Exam</span>
            </button>
          )}
        </div>

        {urgentExams.length > 0 ? (
          <div className="space-y-2.5">
            {urgentExams.map(({ exam, daysDiff }) => {
              const displayTitle = daysDiff === 0 
                ? `${exam.subjectName} exam is Today!` 
                : daysDiff === 1 
                ? `${exam.subjectName} exam in 1 day` 
                : `${exam.subjectName} exam in ${daysDiff} days`;

              return (
                <div
                  key={exam.id}
                  className="relative overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-[#7B61FF]/40 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#F3F0FF] border border-[#7B61FF]/30 text-[#7B61FF] shrink-0 shadow-xs">
                      <AlarmClock className="h-6 w-6 animate-pulse" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-[#102A43] tracking-tight">
                          <span className="text-[#102A43] font-bold">{displayTitle}</span>
                        </h3>
                        {exam.examTitle && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0F4F8] text-[#243B53] border border-[#D9E2EC]">
                            {exam.examTitle}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F3F0FF] border border-[#7B61FF]/30 text-[#7B61FF]">
                          {daysDiff === 0 ? '🔥 TODAY' : `⏳ ${daysDiff} DAYS LEFT`}
                        </span>
                      </div>

                      <p className="text-xs text-[#627D98] flex items-center gap-2">
                        <span>Date: {formatExamDate(exam.examDate)}</span>
                        <span>•</span>
                        <span className="text-[#00A3BF] font-semibold">Automatic revision & quiz modules active</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        const matchedSub = subjects.find(s => 
                          s.name.toLowerCase() === exam.subjectName.toLowerCase() ||
                          s.id === exam.subjectId
                        ) || subjects[0];
                        if (matchedSub) onSelectSubject(matchedSub);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#00A3BF] hover:bg-[#008CA4] text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Prepare {exam.subjectName}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    {onDeleteExam && (
                      <button
                        onClick={() => onDeleteExam(exam.id)}
                        className="p-2 rounded-xl text-[#829AB1] hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove exam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-[#D9E2EC] bg-white text-xs text-[#627D98] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#829AB1]" />
              <span>No exams scheduled within the next 10 days.</span>
            </div>
            {onAddExam && (
              <button
                onClick={() => setIsAddExamModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-[#E6F8FB] hover:bg-[#00A3BF]/20 text-[#00A3BF] border border-[#00A3BF]/30 text-xs font-semibold transition cursor-pointer"
              >
                + Schedule Exam
              </button>
            )}
          </div>
        )}
      </section>

      {/* 3. Main Grid: Adaptive Learning Path (Left) + Smart Assessments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Adaptive Learning Path (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#102A43] tracking-tight flex items-center gap-2">
              <span>Your Adaptive Learning Path</span>
            </h2>
            <button
              onClick={onViewAllCourses}
              className="text-xs font-bold text-[#00A3BF] hover:text-[#008CA4] transition flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3.5">
            {subjects.map((subject) => {
              const colorInfo = getSubjectColorClasses(subject.color);
              const stats = subjectService.getSubjectLessonStats(subject);
              const percent = stats.progressPercent;

              return (
                <div
                  key={subject.id}
                  onClick={() => onSelectSubject(subject)}
                  className="rounded-2xl border border-[#D9E2EC] bg-white hover:border-[#00A3BF] hover:shadow-md p-5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    
                    {/* Subject Icon Box */}
                    <div className={`flex items-center justify-center h-12 w-12 rounded-xl shrink-0 ${colorInfo.iconBox} transition-transform group-hover:scale-105`}>
                      {getSubjectIcon(subject.icon, subject.color)}
                    </div>

                    {/* Subject Title and Progress */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#102A43] group-hover:text-[#00A3BF] transition-colors truncate">
                            {subject.name}
                          </h3>
                          {subject.code && (
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono text-[#627D98] bg-[#F0F4F8] border border-[#D9E2EC]">
                              {subject.code}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {percent === 100 ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                <span>100% Mastered</span>
                              </span>
                              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50/70 border border-emerald-200 px-1.5 py-0.5 rounded">
                                Slides: {stats.openedLessonsCount}/{stats.totalLessons} • Quiz: {stats.assessmentScore}%
                              </span>
                              {onUpdateProgress && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateProgress(subject.id, 0);
                                  }}
                                  className="text-[10px] text-[#829AB1] hover:text-[#102A43] underline px-1 cursor-pointer"
                                  title="Reset progress to 0%"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              <span className="text-xs font-bold text-[#102A43]">
                                {percent}%
                              </span>
                              <span className="text-[10px] font-mono text-[#627D98] bg-[#F0F4F8] px-1.5 py-0.5 rounded border border-[#D9E2EC]" title="70% Slide Completion + 30% Smart Assessment Score">
                                Slides 70%: {stats.openedLessonsCount}/{stats.totalLessons} • Quiz 30%: {stats.assessmentScore}%
                              </span>
                              {onUpdateProgress && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateProgress(subject.id, 100);
                                  }}
                                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#00A3BF] hover:bg-[#008CA4] text-white shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                                  title="Click to mark this subject as 100% completed"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Mark 100%</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${percent === 100 ? 'bg-emerald-500' : 'bg-[#00A3BF]'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-[11px] text-[#627D98] pt-0.5">
                        <span>{subject.materials.length} PDF Materials organized</span>
                        <span className="group-hover:text-[#00A3BF] transition-colors flex items-center gap-1 font-semibold text-[11px] text-[#00A3BF]">
                          Open Subject
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Smart Assessments Widget (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {(() => {
            const displayedAssessments = activeSmartAssessments.slice(0, 3);
            const dueCount = displayedAssessments.filter(a => !completedAssessmentIds.includes(a.id)).length;

            return (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#102A43] tracking-tight">
                    Smart Assessments
                  </h2>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                    dueCount === 0 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-[#F3F0FF] border-[#7B61FF]/30 text-[#7B61FF]'
                  }`}>
                    {dueCount === 0 ? 'All Completed 🎉' : `${dueCount} Due`}
                  </span>
                </div>

                <div className="rounded-2xl border border-[#D9E2EC] bg-white p-4 sm:p-5 space-y-3.5 shadow-sm">
                  {displayedAssessments.map((assessment) => {
                    const isDone = completedAssessmentIds.includes(assessment.id);

                    return (
                      <div 
                        key={assessment.id}
                        onClick={() => onStartRefresher(assessment.id)}
                        className="p-3.5 rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] hover:bg-white hover:border-[#00A3BF]/50 transition cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-[#102A43] group-hover:text-[#00A3BF] transition-colors">
                              {assessment.title}
                            </h4>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#E6F8FB] text-[#00A3BF] border border-[#00A3BF]/30 font-semibold">
                              {assessment.subjectName}
                            </span>
                          </div>
                          
                          {isDone ? (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Completed • 100% Score</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px] text-[#7B61FF] font-semibold">
                              <Clock className="h-3 w-3" />
                              <span>{assessment.dueDateLabel}</span>
                            </div>
                          )}
                        </div>

                        <div className={`flex items-center justify-center h-8 w-8 rounded-lg border transition shrink-0 ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white'
                            : 'bg-[#E6F8FB] text-[#00A3BF] border-[#00A3BF]/30 group-hover:bg-[#00A3BF] group-hover:text-white'
                        }`}>
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}

        </div>

      </div>

      {/* Schedule Upcoming Exam Modal */}
      {isAddExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#D9E2EC] bg-white p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-3">
              <div className="flex items-center gap-2 text-[#102A43] font-bold text-base">
                <CalendarDays className="h-5 w-5 text-[#7B61FF]" />
                <span>Schedule Upcoming Exam</span>
              </div>
              <button
                onClick={() => setIsAddExamModalOpen(false)}
                className="p-1 rounded-lg text-[#829AB1] hover:text-[#102A43] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!examDate) return;
                const finalSubName = examSubject === 'custom' ? customSubjectName.trim() : examSubject;
                if (!finalSubName) return;
                const matchedSub = subjects.find(s => s.name.toLowerCase() === finalSubName.toLowerCase());
                const subId = matchedSub ? matchedSub.id : `subj_ext_${Date.now()}`;
                if (onAddExam) {
                  onAddExam(subId, finalSubName, examDate, examTitle);
                }
                setIsAddExamModalOpen(false);
                setExamDate('');
                setExamTitle('');
                setCustomSubjectName('');
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#102A43]">
                  Select Subject
                </label>
                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] focus:outline-none focus:border-[#00A3BF]"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                  <option value="custom">+ Other Subject Name</option>
                </select>
                {examSubject === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter subject name (e.g. DBMS, OS)"
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                    className="w-full h-10 mt-2 px-3 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] focus:outline-none focus:border-[#00A3BF]"
                    required
                  />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#102A43]">
                  Exam Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] focus:outline-none focus:border-[#00A3BF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#102A43]">
                  Exam Title / Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midterm Assessment, Final Exam"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] focus:outline-none focus:border-[#00A3BF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#627D98] hover:text-[#102A43] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A3BF] hover:bg-[#008CA4] text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
