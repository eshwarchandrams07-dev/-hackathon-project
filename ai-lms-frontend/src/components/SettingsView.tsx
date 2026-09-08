import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Server, 
  RotateCcw, 
  CheckCircle2, 
  CalendarDays,
  GraduationCap,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { StreakCalendar } from './StreakCalendar';
import { Subject, UpcomingExam } from '../types';

interface SettingsViewProps {
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  isBackendOnline: boolean;
  onResetAllData: () => void;
  upcomingExams?: UpcomingExam[];
  subjects?: Subject[];
  onAddExam?: (subjectId: string, subjectName: string, examDate: string, examTitle?: string) => void;
  onDeleteExam?: (examId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  studentName,
  onUpdateStudentName,
  isBackendOnline,
  onResetAllData,
  upcomingExams = [],
  subjects = [],
  onAddExam,
  onDeleteExam
}) => {
  const [examSubject, setExamSubject] = useState(subjects[0]?.name || 'DBMS');
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examDate) return;
    const finalSubName = examSubject === 'custom' ? customSubjectName.trim() : examSubject;
    if (!finalSubName) return;

    const matchedSub = subjects.find(s => s.name.toLowerCase() === finalSubName.toLowerCase());
    const subId = matchedSub ? matchedSub.id : `subj_ext_${Date.now()}`;

    if (onAddExam) {
      onAddExam(subId, finalSubName, examDate, examTitle);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      setExamDate('');
      setExamTitle('');
      setCustomSubjectName('');
    }
  };

  // Calculate days difference safely for list display
  const getExamDiff = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const examD = new Date(y, m - 1, d);
    examD.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = examD.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const formatExamDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return dateStr;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in text-[#243B53]">
      
      {/* Header */}
      <div className="border-b border-[#D9E2EC] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#102A43] font-display flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-[#00A3BF]" />
          <span>Platform Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#627D98] mt-1">
          Manage your Phoenix AI LMS preferences, upcoming exam schedule, and calendar.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* 1. Profile Settings */}
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102A43] border-b border-[#D9E2EC] pb-3">
            <User className="h-4 w-4 text-[#00A3BF]" />
            <span>Student Profile</span>
          </div>

          <div className="space-y-2 max-w-md">
            <label className="text-xs font-semibold text-[#243B53]">
              Your Display Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => onUpdateStudentName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] focus:outline-none focus:border-[#00A3BF] focus:bg-white transition"
            />
            <p className="text-[11px] text-[#627D98]">
              Personalizes your dashboard greeting and Socratic tutor dialogue.
            </p>
          </div>
        </div>

        {/* 2. Upcoming Exams Schedule Section */}
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#102A43]">
              <CalendarDays className="h-4 w-4 text-[#7B61FF]" />
              <span>Schedule Upcoming Exams</span>
            </div>
            <span className="text-[11px] text-[#627D98] hidden sm:inline">
              Exams in next 10 days automatically display on Dashboard
            </span>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleExamSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Select Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#243B53]">
                  Subject
                </label>
                <select
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] focus:outline-none focus:border-[#00A3BF] focus:bg-white transition"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                  <option value="custom">+ Other Subject</option>
                </select>
                {examSubject === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter subject name"
                    value={customSubjectName}
                    onChange={(e) => setCustomSubjectName(e.target.value)}
                    required
                    className="w-full h-9 mt-1 px-3 rounded-lg bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] focus:outline-none focus:border-[#00A3BF] focus:bg-white transition"
                  />
                )}
              </div>

              {/* Exam Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#243B53]">
                  Exam Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] focus:outline-none focus:border-[#00A3BF] focus:bg-white transition"
                />
              </div>

              {/* Title / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#243B53]">
                  Exam Title / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midterm Assessment"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] focus:outline-none focus:border-[#00A3BF] focus:bg-white transition"
                />
              </div>

            </div>

            <div className="flex items-center justify-between pt-1">
              {submitSuccess ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Exam scheduled successfully!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-[#627D98]">
                  <Clock className="h-3.5 w-3.5 text-[#7B61FF]" />
                  <span>Dashboard displays dynamic countdown for exams within 10 days</span>
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#00A3BF] hover:bg-[#008CA4] text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Schedule Exam</span>
              </button>
            </div>
          </form>

          {/* List of Scheduled Exams */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-[#102A43] uppercase tracking-wider">
              Currently Scheduled Exams ({upcomingExams.length})
            </h4>

            {upcomingExams.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingExams.map(exam => {
                  const daysDiff = getExamDiff(exam.examDate);
                  const isUrgent = daysDiff >= 0 && daysDiff <= 10;
                  const countdownText = daysDiff === 0
                    ? `${exam.subjectName} exam is Today!`
                    : daysDiff === 1
                    ? `${exam.subjectName} exam in 1 day`
                    : daysDiff > 1
                    ? `${exam.subjectName} exam in ${daysDiff} days`
                    : `${exam.subjectName} exam completed`;

                  return (
                    <div
                      key={exam.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        isUrgent
                          ? 'bg-[#F3F0FF] border-[#7B61FF]/40 text-[#102A43]'
                          : 'bg-[#F0F4F8]/70 border-[#D9E2EC] text-[#243B53]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${isUrgent ? 'bg-[#7B61FF]/20 text-[#7B61FF]' : 'bg-[#E2E8F0] text-[#627D98]'}`}>
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#102A43]">
                              {countdownText}
                            </span>
                            {isUrgent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7B61FF] text-white">
                                Dashboard Alert Active ({daysDiff}d)
                              </span>
                            )}
                            {exam.examTitle && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#243B53] border border-[#D9E2EC]">
                                {exam.examTitle}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#627D98]">
                            Exam Date: {formatExamDate(exam.examDate)} ({exam.examDate})
                          </p>
                        </div>
                      </div>

                      {onDeleteExam && (
                        <button
                          type="button"
                          onClick={() => onDeleteExam(exam.id)}
                          className="self-end sm:self-center p-2 rounded-lg text-[#627D98] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete scheduled exam"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-[#D9E2EC] bg-[#F0F4F8]/40 text-xs text-[#627D98] text-center">
                No upcoming exams scheduled. Submit an exam above to track countdowns.
              </div>
            )}
          </div>
        </div>

        {/* 3. 1-Month Daily Streak & Study Activity Calendar */}
        <StreakCalendar upcomingExams={upcomingExams} />

        {/* 4. AI & Backend Connectivity */}
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102A43] border-b border-[#D9E2EC] pb-3">
            <Server className="h-4 w-4 text-[#00A3BF]" />
            <span>AI Backend Engine & Model Status</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC]">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#102A43]">FastAPI Core Server</p>
                <p className="text-[11px] text-[#627D98]">http://127.0.0.1:8000</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{isBackendOnline ? 'Connected' : 'Offline / Standby'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC]">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#102A43]">Primary AI Tutor Model</p>
                <p className="text-[11px] text-[#627D98]">Google Gemini 3.6 Flash</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3F0FF] text-[#7B61FF] border border-[#7B61FF]/30">
                Active Tier 1
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC]">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#102A43]">Secondary Fallback LLM</p>
                <p className="text-[11px] text-[#627D98]">Groq Qwen 3.8 27B / Compound Mini</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-[#243B53] border border-[#D9E2EC]">
                Active Tier 2
              </span>
            </div>
          </div>
        </div>

        {/* 5. Data & Reset Actions */}
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102A43] border-b border-[#D9E2EC] pb-3">
            <RotateCcw className="h-4 w-4 text-rose-600" />
            <span>Reset Demo & Learning History</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#243B53]">
                Reset subjects, quiz attempts, upcoming exams, and chat history
              </p>
              <p className="text-[11px] text-[#627D98]">
                Restores default Phoenix subjects and clears cached quiz statistics and exams.
              </p>
            </div>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset demo data, exams, and quiz attempts?')) {
                  onResetAllData();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-semibold transition shrink-0 cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
