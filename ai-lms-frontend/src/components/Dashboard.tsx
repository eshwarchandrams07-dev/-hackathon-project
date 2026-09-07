import React from 'react';
import { Course } from '../types';
import { UploadZone } from './UploadZone';
import { 
  BookOpen, 
  Columns, 
  Layers, 
  Sparkles, 
  Cpu, 
  ArrowRight, 
  FileText, 
  MessageSquare,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface DashboardProps {
  activeCourse: Course | null;
  onCourseGenerated: (course: Course) => void;
  onNavigateToCourse: () => void;
  onNavigateToSplitTutor: () => void;
  isBackendOnline: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeCourse,
  onCourseGenerated,
  onNavigateToCourse,
  onNavigateToSplitTutor,
  isBackendOnline,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Hero Ingestion Hub */}
      <section>
        <UploadZone
          onCourseGenerated={onCourseGenerated}
          isBackendOnline={isBackendOnline}
        />
      </section>

      {/* Active Course Card (if available) */}
      {activeCourse && (
        <section className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Ready to Learn • Active Curriculum</span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {activeCourse.course_title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
                {activeCourse.overview}
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs text-slate-300 font-mono">
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/60">
                  {activeCourse.modules.length} Modules
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/60">
                  {activeCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={onNavigateToCourse}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-semibold transition"
              >
                <BookOpen className="h-4 w-4 text-brand-400" />
                <span>Explore Course</span>
              </button>

              <button
                onClick={onNavigateToSplitTutor}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white text-xs sm:text-sm font-semibold shadow-lg shadow-brand-600/30 transition active:scale-95"
              >
                <Columns className="h-4 w-4 text-accent-cyan" />
                <span>Open Split-Screen Tutor</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Architectural Pillars / Pipeline Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-4">
            <FileText className="h-5 w-5" />
          </div>
          <h4 className="text-base font-semibold text-white mb-2">FastAPI PDF Ingestion</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Directly uploads source PDF documents to <code className="text-brand-300 font-mono">/api/upload</code>, extracting full text and chunking with PyMuPDF into ChromaDB.
          </p>
          <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
            POST /api/upload
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="h-10 w-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan flex items-center justify-center mb-4">
            <Cpu className="h-5 w-5" />
          </div>
          <h4 className="text-base font-semibold text-white mb-2">Modular Curriculum Engine</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Converts vector store knowledge into structured modules, lessons, concept dependencies, and multiple-choice quizzes with hints via <code className="text-accent-cyan font-mono">/api/generate-course</code>.
          </p>
          <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
            POST /api/generate-course
          </span>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="h-10 w-10 rounded-xl bg-accent-violet/10 border border-accent-violet/20 text-accent-violet flex items-center justify-center mb-4">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h4 className="text-base font-semibold text-white mb-2">Split-Screen Socratic Tutor</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Interactive dual-pane workspace that injects active lesson context into <code className="text-accent-violet font-mono">/api/chat</code> to guide students without giving away direct answers.
          </p>
          <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
            POST /api/chat
          </span>
        </div>

      </section>

    </div>
  );
};
