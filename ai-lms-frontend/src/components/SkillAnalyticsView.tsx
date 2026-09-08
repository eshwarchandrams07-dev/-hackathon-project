import React from 'react';
import { QuizAttempt, SubjectSkillAnalysis } from '../types';
import { 
  BarChart2, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  Clock,
  Target
} from 'lucide-react';

interface SkillAnalyticsViewProps {
  analysis: {
    overallAccuracy: number;
    totalAttempts: number;
    correctCount: number;
    subjectsAnalysis: SubjectSkillAnalysis[];
    recentWeakness?: string;
  };
  attempts: QuizAttempt[];
  onPracticeTopic?: (topic: string) => void;
}

export const SkillAnalyticsView: React.FC<SkillAnalyticsViewProps> = ({
  analysis,
  attempts,
  onPracticeTopic
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E2EC] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#102A43] font-display flex items-center gap-2.5">
            <BarChart2 className="h-6 w-6 text-[#00A3BF]" />
            <span>Skill Analytics & Cognitive Diagnostics</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#627D98] mt-1">
            Real-time evaluation of your quiz answers across subjects, identifying strengths and targeted areas for improvement.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3F0FF] border border-[#7B61FF]/30 text-[#7B61FF] text-xs font-semibold shrink-0">
          <Sparkles className="h-4 w-4 text-[#7B61FF]" />
          <span>Active Cognitive Memory</span>
        </div>
      </div>

      {/* 2. Top Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Overall Accuracy */}
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#627D98] text-xs font-medium">
            <span>Overall Accuracy</span>
            <Target className="h-4 w-4 text-[#00A3BF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#102A43] font-display">
              {analysis.overallAccuracy}%
            </span>
            <span className="text-[11px] font-medium text-[#7B61FF]">
              {analysis.correctCount}/{analysis.totalAttempts} correct
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#00A3BF] to-[#7B61FF] transition-all duration-500"
              style={{ width: `${analysis.overallAccuracy}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Total Questions Answered */}
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#627D98] text-xs font-medium">
            <span>Questions Attempted</span>
            <BookOpen className="h-4 w-4 text-[#00A3BF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#102A43] font-display">
              {analysis.totalAttempts}
            </span>
            <span className="text-[11px] text-[#627D98]">across all subjects</span>
          </div>
          <p className="text-[11px] text-[#627D98]">
            Answers automatically indexed
          </p>
        </div>

        {/* Metric 3: Mastered Strengths Count */}
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#627D98] text-xs font-medium">
            <span>Demonstrated Strengths</span>
            <TrendingUp className="h-4 w-4 text-[#7B61FF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#102A43] font-display">
              {analysis.subjectsAnalysis.reduce((acc, s) => acc + s.strengths.length, 0)}
            </span>
            <span className="text-[11px] text-[#627D98]">topics mastered</span>
          </div>
          <p className="text-[11px] text-[#7B61FF] font-medium">
            High accuracy retention
          </p>
        </div>

        {/* Metric 4: Topics Needing Practice */}
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#627D98] text-xs font-medium">
            <span>Focus Areas</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 font-display">
              {analysis.subjectsAnalysis.reduce((acc, s) => acc + s.weaknesses.length, 0)}
            </span>
            <span className="text-[11px] text-[#627D98]">topics to review</span>
          </div>
          <p className="text-[11px] text-amber-600 font-medium">
            Refresher modules ready
          </p>
        </div>

      </div>

      {/* 3. Per-Subject Strengths and Weaknesses Breakdown */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#102A43] tracking-tight flex items-center gap-2">
          <span>Subject Mastery, Strengths & Weaknesses</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {analysis.subjectsAnalysis.map((sub) => (
            <div
              key={sub.subjectId}
              className="rounded-2xl border border-[#D9E2EC] bg-white p-5 space-y-4 flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                
                {/* Subject Name & Accuracy Header */}
                <div className="flex items-start justify-between gap-3 border-b border-[#D9E2EC] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#102A43]">
                      {sub.subjectName}
                    </h3>
                    <span className="text-[11px] text-[#627D98]">
                      {sub.totalAttempts} questions answered
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-[#102A43] font-mono">
                      {sub.accuracyRate}%
                    </span>
                    <p className="text-[10px] text-[#627D98]">Mastery</p>
                  </div>
                </div>

                {/* Accuracy Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.accuracyRate >= 70 ? 'bg-[#00A3BF]' : sub.accuracyRate >= 50 ? 'bg-[#7B61FF]' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.max(8, sub.accuracyRate)}%` }}
                  />
                </div>

                {/* Strengths */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00A3BF]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Key Strengths</span>
                  </div>
                  {sub.strengths.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {sub.strengths.map((st, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#E6F8FB] border border-[#00A3BF]/30 text-[#00A3BF]"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#627D98] italic">Complete more quizzes to identify strengths.</p>
                  )}
                </div>

                {/* Weaknesses */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Areas for Review</span>
                  </div>
                  {sub.weaknesses.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {sub.weaknesses.map((wk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 border border-amber-300 text-amber-800"
                        >
                          {wk}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-600 font-medium">No significant weaknesses detected!</p>
                  )}
                </div>

              </div>

              {/* AI Recommendation / Action */}
              <div className="pt-3 border-t border-[#D9E2EC]">
                {sub.weaknesses.length > 0 ? (
                  <button
                    onClick={() => onPracticeTopic?.(sub.weaknesses[0])}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#00A3BF] hover:bg-[#008CA4] text-white text-xs font-semibold transition group shadow-sm"
                  >
                    <span>Practice: {sub.weaknesses[0]}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ) : (
                  <div className="text-[11px] text-[#627D98] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#7B61FF]" />
                    <span>Ready for advanced exam topics</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 4. Recent Answered Questions Log (Remembers User Answers) */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-[#102A43] tracking-tight flex items-center gap-2">
          <span>Recent Quiz Log & User Answer Memory</span>
        </h2>

        <div className="rounded-2xl border border-[#D9E2EC] bg-white overflow-hidden shadow-sm">
          <div className="divide-y divide-[#D9E2EC]">
            {attempts.slice(0, 8).map((att) => (
              <div key={att.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F0F4F8]/60 transition">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#102A43]">
                      {att.courseTitle}
                    </span>
                    <span className="text-[10px] text-[#627D98]">•</span>
                    <span className="text-[11px] text-[#00A3BF] font-medium">
                      {att.topicOrConcept || att.lessonTitle}
                    </span>
                    {att.difficulty && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-[#F0F4F8] text-[#243B53] border border-[#D9E2EC]">
                        {att.difficulty}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#243B53] font-medium leading-relaxed">
                    {att.questionText}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] pt-1">
                    <span className={att.isCorrect ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'}>
                      Your answer: {att.selectedAnswer}
                    </span>
                    {!att.isCorrect && (
                      <span className="text-[#627D98]">
                        (Correct: {att.correctAnswer})
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                  {att.isCorrect ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Correct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 border border-rose-300 text-rose-700">
                      <XCircle className="h-3.5 w-3.5 text-rose-600" />
                      Incorrect
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
