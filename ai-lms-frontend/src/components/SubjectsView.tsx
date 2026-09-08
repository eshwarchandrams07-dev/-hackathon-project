import React, { useState } from 'react';
import { Subject, SubjectMaterial } from '../types';
import { subjectService } from '../services/subjectService';
import { 
  Plus, 
  BookOpen, 
  FileText, 
  Upload, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  FolderPlus,
  Code,
  GitBranch,
  Database,
  Calendar,
  Layers,
  CheckCircle2,
  Search,
  X
} from 'lucide-react';

interface SubjectsViewProps {
  subjects: Subject[];
  onAddSubject: (name: string, code?: string, description?: string, color?: string) => void;
  onDeleteSubject: (id: string) => void;
  onSelectSubject: (subject: Subject) => void;
  onSelectMaterial: (subject: Subject, material: SubjectMaterial) => void;
  onUploadPdfToSubject: (subject: Subject) => void;
  onUpdateProgress?: (subjectId: string, percent: number) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onAddSubject,
  onDeleteSubject,
  onSelectSubject,
  onSelectMaterial,
  onUploadPdfToSubject,
  onUpdateProgress
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubColor, setNewSubColor] = useState('purple');
  const [expandedSubId, setExpandedSubId] = useState<string | null>(subjects[0]?.id || null);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredSubjects = subjects.filter(s => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.trim().toLowerCase();
    return s.name.toLowerCase().includes(q) ||
      (s.code && s.code.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q));
  });

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    onAddSubject(newSubName, newSubCode, newSubDesc, newSubColor);
    setNewSubName('');
    setNewSubCode('');
    setNewSubDesc('');
    setIsModalOpen(false);
  };

  const colors = [
    { id: 'teal', label: 'Quantum Teal', bg: 'bg-[#00A3BF]' },
    { id: 'purple', label: 'Aether Purple', bg: 'bg-[#7B61FF]' },
    { id: 'blue', label: 'Foundation Blue', bg: 'bg-[#102A43]' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fade-in text-[#243B53]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9E2EC] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#102A43] font-display">
            My Courses & Subjects
          </h1>
          <p className="text-xs sm:text-sm text-[#627D98] mt-1">
            Organize your course materials, slides, and syllabus documents by academic subject.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00A3BF] hover:bg-[#008CA4] text-white text-xs font-bold shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* In-View Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#D9E2EC] shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#829AB1]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter subjects by name or code..."
            className="w-full h-9 pl-9 pr-8 rounded-xl bg-[#F0F4F8] border border-transparent focus:border-[#00A3BF] focus:bg-white text-xs text-[#102A43] placeholder-[#829AB1] focus:outline-none transition"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#829AB1] hover:text-[#102A43] cursor-pointer"
              title="Clear filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs font-mono text-[#627D98] px-1">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </span>
      </div>

      {/* Subjects Grid & Document Accordion */}
      <div className="space-y-6">
        {filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => {
            const isExpanded = expandedSubId === subject.id;
            const stats = subjectService.getSubjectLessonStats(subject);
            const percent = stats.progressPercent;

            return (
              <div
                key={subject.id}
                className="rounded-2xl border border-[#D9E2EC] bg-white overflow-hidden transition-all shadow-sm"
              >
              {/* Subject Header Banner */}
              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-b border-[#D9E2EC]">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#E6F8FB] border border-[#00A3BF]/30 text-[#00A3BF] shrink-0">
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-[#102A43]">
                        {subject.name}
                      </h2>
                      {subject.code && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F0F4F8] text-[#627D98] border border-[#D9E2EC]">
                          {subject.code}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F3F0FF] text-[#7B61FF] border border-[#7B61FF]/30">
                        {subject.materials.length} PDF{subject.materials.length === 1 ? '' : 's'} Organized
                      </span>
                    </div>
                    <p className="text-xs text-[#627D98] max-w-2xl leading-relaxed">
                      {subject.description || 'Subject materials and interactive study notes.'}
                    </p>

                    {/* Progress Bar & Mark 100% Quick Action */}
                    <div className="pt-2 flex items-center gap-3 flex-wrap">
                      <div className="w-36 sm:w-48 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent === 100 ? 'bg-emerald-500' : 'bg-[#00A3BF]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#102A43]">
                          {percent}%
                        </span>
                        <span className="text-[11px] font-mono text-[#627D98] bg-[#F0F4F8] px-2 py-0.5 rounded border border-[#D9E2EC]">
                          Slides (70%): {stats.openedLessonsCount}/{stats.totalLessons} ({stats.slideProgressPercent}%) • Quiz (30%): {stats.assessmentScore}%
                        </span>
                      </div>

                      {onUpdateProgress && (
                        (percent === 100) ? (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>100% Completed</span>
                            </span>
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
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateProgress(subject.id, 100);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#00A3BF] hover:bg-[#008CA4] text-white shadow-xs transition active:scale-95 flex items-center gap-1 cursor-pointer"
                            title="Click to mark this subject as 100% completed"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Mark 100%</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onUploadPdfToSubject(subject)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E6F8FB] hover:bg-[#00A3BF]/20 text-[#00A3BF] border border-[#00A3BF]/30 text-xs font-semibold transition cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5 text-[#00A3BF]" />
                    <span>Upload PDF</span>
                  </button>

                  <button
                    onClick={() => setExpandedSubId(isExpanded ? null : subject.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#243B53] border border-[#D9E2EC] text-xs font-semibold transition cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide PDFs' : 'View PDFs'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteSubject(subject.id)}
                    className="p-2 rounded-xl hover:bg-rose-50 text-[#829AB1] hover:text-rose-500 transition cursor-pointer"
                    title="Delete Subject"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Organized PDFs List inside this Subject */}
              {isExpanded && (
                <div className="p-5 sm:p-6 bg-[#F8FAFC] border-t border-[#D9E2EC] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#627D98] uppercase tracking-wider">
                    <span>Course PDFs in {subject.name}</span>
                    <span className="text-[11px] text-[#627D98] font-normal">
                      Click any PDF to study with AI Socratic Tutor & Quizzes
                    </span>
                  </div>

                  {subject.materials.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#D9E2EC] bg-white rounded-xl space-y-3">
                      <FileText className="h-8 w-8 text-[#829AB1] mx-auto" />
                      <p className="text-xs text-[#627D98]">No PDFs uploaded to this subject yet.</p>
                      <button
                        onClick={() => onUploadPdfToSubject(subject)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#00A3BF] hover:bg-[#008CA4] text-white text-xs font-semibold transition cursor-pointer"
                      >
                        + Upload First PDF
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {subject.materials.map((mat) => (
                        <div
                          key={mat.id}
                          onClick={() => onSelectMaterial(subject, mat)}
                          className="rounded-xl border border-[#D9E2EC] bg-white hover:border-[#00A3BF] p-4 transition-all cursor-pointer group flex items-center justify-between gap-4 shadow-xs hover:shadow-md"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#E6F8FB] text-[#00A3BF] shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <h3 className="text-xs font-bold text-[#102A43] group-hover:text-[#00A3BF] transition-colors truncate">
                                {mat.fileName}
                              </h3>
                              <div className="flex items-center gap-2 text-[10px] text-[#627D98]">
                                <span>{mat.fileSize ? `${Math.round(mat.fileSize / 1024)} KB` : 'Document'}</span>
                                <span>•</span>
                                <span className="text-[#00A3BF] font-medium">Indexed with Socratic Tutor</span>
                              </div>
                            </div>
                          </div>

                          <button className="flex items-center gap-1 text-xs font-bold text-[#00A3BF] group-hover:text-[#008CA4] shrink-0">
                            <span>Study</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })
      ) : (
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-12 text-center space-y-3 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-[#F0F4F8] border border-[#D9E2EC] flex items-center justify-center mx-auto text-[#829AB1]">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-[#102A43]">No subjects found matching "{searchFilter}"</h3>
          <p className="text-xs text-[#627D98] max-w-sm mx-auto">
            Try a different search term or click "Add New Subject" to create a new subject topic.
          </p>
          <button
            onClick={() => setSearchFilter('')}
            className="px-3.5 py-1.5 rounded-lg bg-[#F0F4F8] hover:bg-[#E2E8F0] border border-[#D9E2EC] text-xs font-semibold text-[#243B53] transition cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}
      </div>

      {/* Add Subject Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-[#7B61FF]" />
                <h3 className="text-base font-bold text-[#102A43]">Add New Subject</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#829AB1] hover:text-[#102A43] text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#102A43]">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems, Machine Learning"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] placeholder-[#829AB1] focus:outline-none focus:border-[#00A3BF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#102A43]">
                  Subject Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS401, BACSE202"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] placeholder-[#829AB1] focus:outline-none focus:border-[#00A3BF] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#102A43]">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Key topics, lecture goals, or exam notes..."
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F0F4F8] border border-[#D9E2EC] text-xs text-[#243B53] placeholder-[#829AB1] focus:outline-none focus:border-[#00A3BF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#102A43]">
                  Subject Accent Color
                </label>
                <div className="flex items-center gap-3">
                  {colors.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setNewSubColor(c.id)}
                      className={`h-7 w-7 rounded-full ${c.bg} transition-all cursor-pointer ${
                        newSubColor === c.id ? 'ring-4 ring-[#00A3BF]/40 scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#627D98] text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A3BF] hover:bg-[#008CA4] text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Create Subject
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
