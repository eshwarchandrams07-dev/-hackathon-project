import React, { useState, useRef } from 'react';
import { apiService } from '../services/api';
import { Course } from '../types';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Sparkles,
  BookOpen,
  FileCheck,
  Zap,
  GraduationCap
} from 'lucide-react';

interface UploadLandingProps {
  onCourseGenerated: (course: Course, fileName?: string) => void;
  onLoadDemoCourse: () => void;
  isBackendOnline: boolean;
}

type IngestionStep = 'idle' | 'uploading' | 'processing_rag' | 'generating_course' | 'complete' | 'error';

export const UploadLanding: React.FC<UploadLandingProps> = ({
  onCourseGenerated,
  onLoadDemoCourse,
  isBackendOnline,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<IngestionStep>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage('');
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please upload a PDF document (.pdf)');
      return;
    }
    if (file.size === 0) {
      setErrorMessage(`The file "${file.name}" is empty (0 bytes).`);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 25MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleStartIngestion = async () => {
    if (!selectedFile) return;

    setCurrentStep('uploading');
    setProgressPercent(25);
    setStatusMessage('Uploading PDF document to backend...');
    setErrorMessage('');

    try {
      const uploadRes = await apiService.uploadPdf(selectedFile);
      
      setProgressPercent(55);
      setCurrentStep('processing_rag');
      setStatusMessage('Extracting text chunks & vector indexing in ChromaDB...');
      await new Promise(resolve => setTimeout(resolve, 600));

      setCurrentStep('generating_course');
      setProgressPercent(85);
      setStatusMessage('Synthesizing structured curriculum & Socratic quizzes...');

      const generatedCourse = await apiService.generateCourse(uploadRes.task_id);
      
      setProgressPercent(100);
      setCurrentStep('complete');
      setStatusMessage('Course ready! Launching workspace...');

      setTimeout(() => {
        onCourseGenerated(generatedCourse, selectedFile?.name);
      }, 500);

    } catch (err: any) {
      console.error('Ingestion error:', err);
      setCurrentStep('error');
      setErrorMessage(
        err.message || 'Ingestion error. Please ensure backend is running or click "Load Demo Course".'
      );
    }
  };

  const handleLoadSamplePdf = async () => {
    try {
      setCurrentStep('uploading');
      setProgressPercent(20);
      setStatusMessage('Fetching sample lecture notes...');
      const res = await fetch('/sample_compiler_course.pdf');
      const blob = await res.blob();
      const file = new File([blob], 'compiler_design_sample.pdf', { type: 'application/pdf' });
      setSelectedFile(file);

      setProgressPercent(45);
      setStatusMessage('Uploading to FastAPI backend...');
      const uploadRes = await apiService.uploadPdf(file);

      setProgressPercent(70);
      setCurrentStep('processing_rag');
      setStatusMessage('Indexing textbook content in ChromaDB...');
      await new Promise(resolve => setTimeout(resolve, 600));

      setCurrentStep('generating_course');
      setProgressPercent(90);
      setStatusMessage('Synthesizing curriculum & Socratic modules...');
      const generatedCourse = await apiService.generateCourse(uploadRes.task_id);

      setProgressPercent(100);
      setCurrentStep('complete');
      setStatusMessage('Course synthesized!');

      setTimeout(() => {
        onCourseGenerated(generatedCourse, 'compiler_design_sample.pdf');
      }, 500);
    } catch (err: any) {
      console.error('Sample ingestion error:', err);
      setCurrentStep('error');
      setErrorMessage(err.message || 'Sample PDF ingestion failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Hero Welcome Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>MindForge Socratic AI Learning Platform</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Upload Your Course Material
        </h1>

        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Upload any PDF lecture notes, textbook chapters, or syllabus. Our AI will automatically synthesize a modular curriculum, prerequisite concept maps, and an interactive Socratic tutor.
        </p>
      </div>

      {/* Main Upload Dropzone Card */}
      <div className="rounded-2xl border border-slate-800/90 bg-[#0f1523]/90 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
        
        {currentStep === 'idle' || currentStep === 'error' ? (
          <div className="space-y-5">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
                  : selectedFile
                  ? 'border-brand-500/50 bg-slate-900/60'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)} • PDF Ready for Ingestion</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setErrorMessage('');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-1">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium text-slate-200">
                      Click to browse or drag and drop your PDF here
                    </p>
                    <p className="text-xs text-slate-500">
                      Supports textbooks, lecture slides, papers, or course notes up to 25MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Or quick sample:</span>
                <button
                  type="button"
                  onClick={handleLoadSamplePdf}
                  className="text-xs text-brand-400 hover:text-brand-300 underline underline-offset-2 transition"
                >
                  Compiler Notes PDF
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onLoadDemoCourse}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                  <span>Show Demo Course</span>
                </button>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleStartIngestion}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-brand-600/20"
                  >
                    <span>Synthesize Course</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Processing State Animation */
          <div className="py-8 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-2.5">
                {currentStep === 'complete' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
                )}
                <span className="text-sm">{statusMessage}</span>
              </span>
              <span className="font-mono text-xs">{progressPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
              <div
                className="h-full bg-brand-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Pipeline Stepper */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800/60 text-xs">
              <div className={`flex items-center gap-2 ${progressPercent >= 25 ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                <span className={`h-2 w-2 rounded-full ${progressPercent >= 25 ? 'bg-brand-400' : 'bg-slate-700'}`} />
                <span>1. Parse PDF</span>
              </div>
              <div className={`flex items-center gap-2 ${progressPercent >= 55 ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                <span className={`h-2 w-2 rounded-full ${progressPercent >= 55 ? 'bg-brand-400' : 'bg-slate-700'}`} />
                <span>2. Vector Indexing</span>
              </div>
              <div className={`flex items-center gap-2 ${progressPercent >= 85 ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                <span className={`h-2 w-2 rounded-full ${progressPercent >= 85 ? 'bg-brand-400' : 'bg-slate-700'}`} />
                <span>3. Build Curriculum</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Feature Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="p-4 rounded-xl border border-slate-800/70 bg-slate-950/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <BookOpen className="h-4 w-4 text-brand-400" />
            <span>Structured Syllabus</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Converts long, complex slides and textbook pages into bite-sized lessons with key takeaways.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800/70 bg-slate-950/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Socratic AI Companion</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Asks guiding questions to test deep understanding instead of merely handing out flat answers.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-800/70 bg-slate-950/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <FileCheck className="h-4 w-4 text-emerald-400" />
            <span>Persistent History</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All your tutoring dialogues and questions are saved automatically in SQLite and exportable as notes.
          </p>
        </div>
      </div>

    </div>
  );
};
