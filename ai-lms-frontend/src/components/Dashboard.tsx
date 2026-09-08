import React from 'react';
import { Course } from '../types';
import { UploadZone } from './UploadZone';
import { 
  BookOpen, 
  Columns, 
  Layers, 
  CheckCircle2,
  ArrowRight,
  GraduationCap
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
  const totalLessons = activeCourse 
    ? activeCourse.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)
    : 0;

  const totalConcepts = activeCourse
    ? activeCourse.modules.reduce((acc, m) => acc + (m.concept_nodes?.length || 0), 0)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      
      {/* Upload & Ingestion Section */}
      <section>
        <UploadZone
          onCourseGenerated={onCourseGenerated}
          isBackendOnline={isBackendOnline}
        />
      </section>

      {/* Active Course Card (if available) */}
      {activeCourse && (
        <section className="rounded-2xl border border-slate-800/90 bg-[#0f1523]/90 p-6 backdrop-blur-sm shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <CheckCircle2 className="h-3 w-3" />
                <span>Active Curriculum Ready</span>
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight">
                {activeCourse.course_title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {activeCourse.overview}
              </p>
              
              <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                <span>{activeCourse.modules.length} Modules</span>
                <span>•</span>
                <span>{totalLessons} Lessons</span>
                <span>•</span>
                <span>{totalConcepts} Concepts Extracted</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                onClick={onNavigateToCourse}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Curriculum Outline</span>
              </button>

              <button
                onClick={onNavigateToSplitTutor}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition shadow-sm"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Open Socratic Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </section>
      )}

      {/* Structured Modules Overview */}
      {activeCourse && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Course Structure
            </h4>
            <span className="text-[11px] text-slate-500">
              {activeCourse.modules.length} modules available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeCourse.modules.map((module, idx) => (
              <div
                key={module.module_id}
                onClick={onNavigateToCourse}
                className="rounded-xl border border-slate-800/80 bg-[#0f1523]/60 hover:bg-slate-900/80 hover:border-slate-700/80 p-4 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center h-5 w-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px]">
                      {idx + 1}
                    </span>
                    <h5 className="text-xs font-medium text-white group-hover:text-brand-300 transition-colors">
                      {module.title}
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed pl-7">
                  {module.description}
                </p>

                {module.concept_nodes && module.concept_nodes.length > 0 && (
                  <div className="mt-3 pl-7 flex flex-wrap gap-1">
                    {module.concept_nodes.slice(0, 3).map((concept) => (
                      <span 
                        key={concept.node_id}
                        className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/40 text-[10px] text-slate-400"
                      >
                        {concept.label}
                      </span>
                    ))}
                    {module.concept_nodes.length > 3 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{module.concept_nodes.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
