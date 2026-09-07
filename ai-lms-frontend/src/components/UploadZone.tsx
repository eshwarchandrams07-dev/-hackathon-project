import React, { useState, useRef } from 'react';
import { apiService } from '../services/api';
import { Course } from '../types';
import { SAMPLE_COURSE } from '../services/mockData';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Layers, 
  BrainCircuit, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface UploadZoneProps {
  onCourseGenerated: (course: Course) => void;
  isBackendOnline: boolean;
}

type IngestionStep = 'idle' | 'uploading' | 'processing_rag' | 'generating_course' | 'complete' | 'error';

export const UploadZone: React.FC<UploadZoneProps> = ({
  onCourseGenerated,
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
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
      setErrorMessage('Please upload a valid PDF document (.pdf)');
      return;
    }
    if (file.size === 0) {
      setErrorMessage(`The file "${file.name}" is empty (0 bytes). Please choose a valid PDF file with text content.`);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum limit of 25MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleLoadSamplePdf = async () => {
    try {
      setCurrentStep('uploading');
      setProgressPercent(15);
      setStatusMessage('Fetching sample "Compiler Design" textbook notes...');
      const res = await fetch('/sample_compiler_course.pdf');
      const blob = await res.blob();
      const file = new File([blob], 'compiler_design_sample.pdf', { type: 'application/pdf' });
      setSelectedFile(file);

      // Now run ingestion through real FastAPI backend
      setProgressPercent(35);
      setStatusMessage('Uploading to FastAPI backend (/api/upload)...');
      const uploadRes = await apiService.uploadPdf(file);

      setProgressPercent(60);
      setCurrentStep('processing_rag');
      setStatusMessage('Ingesting PDF text chunks into ChromaDB vector index...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setCurrentStep('generating_course');
      setProgressPercent(85);
      setStatusMessage('Synthesizing structured course with Groq LLM (/api/generate-course)...');
      const generatedCourse = await apiService.generateCourse(uploadRes.task_id);

      setProgressPercent(100);
      setCurrentStep('complete');
      setStatusMessage('Course successfully synthesized!');

      setTimeout(() => {
        onCourseGenerated(generatedCourse);
      }, 700);
    } catch (err: any) {
      console.error('Sample ingestion error:', err);
      setCurrentStep('error');
      setErrorMessage(err.message || 'Sample PDF ingestion failed.');
    }
  };

  const handleStartIngestion = async () => {
    if (!selectedFile) return;

    setCurrentStep('uploading');
    setProgressPercent(20);
    setStatusMessage(`Uploading "${selectedFile.name}" to FastAPI backend...`);
    setErrorMessage('');

    try {
      // Step 1: Upload to /api/upload
      const uploadRes = await apiService.uploadPdf(selectedFile);
      setProgressPercent(50);
      setCurrentStep('processing_rag');
      setStatusMessage('Ingesting PDF chunks into ChromaDB vector index...');

      // Small pause for visual feedback
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Course generation
      setCurrentStep('generating_course');
      setProgressPercent(80);
      setStatusMessage('Extracting curriculum, concept graph & Socratic quizzes via LLM...');

      const generatedCourse = await apiService.generateCourse(uploadRes.task_id);
      
      setProgressPercent(100);
      setCurrentStep('complete');
      setStatusMessage('Course successfully synthesized!');

      setTimeout(() => {
        onCourseGenerated(generatedCourse);
      }, 700);

    } catch (err: any) {
      console.error('Ingestion error:', err);
      setCurrentStep('error');
      setErrorMessage(
        err.message || 'Failed to communicate with FastAPI backend. Ensure backend is running at http://127.0.0.1:8000'
      );
    }
  };

  const handleLoadSampleCourse = () => {
    setCurrentStep('generating_course');
    setProgressPercent(60);
    setStatusMessage('Loading Neural Networks & Deep Learning demonstration curriculum...');
    
    setTimeout(() => {
      setProgressPercent(100);
      setCurrentStep('complete');
      setTimeout(() => {
        onCourseGenerated(SAMPLE_COURSE);
      }, 500);
    }, 600);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Upload Zone Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl transition-all duration-300">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-accent-cyan/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Knowledge Ingestion Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Transform Any PDF Textbook into an Interactive Course
          </h2>
          <p className="text-sm text-slate-400">
            Upload your lecture slides, academic papers, or textbook chapters. Our RAG engine extracts modules, builds concept dependency trees, and crafts adaptive Socratic quizzes.
          </p>
        </div>

        {/* Drag & Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => currentStep === 'idle' && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
              : selectedFile
              ? 'border-brand-500/50 bg-slate-900/90'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={currentStep !== 'idle' && currentStep !== 'error'}
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-lg shadow-brand-500/20">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-base">{selectedFile.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatFileSize(selectedFile.size)} • PDF Document
                </p>
              </div>

              {(currentStep === 'idle' || currentStep === 'error') && (
                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setCurrentStep('idle');
                      setErrorMessage('');
                    }}
                    className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 transition"
                  >
                    Choose Different File
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartIngestion();
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-accent-cyan hover:from-brand-500 hover:to-accent-cyan text-white shadow-lg shadow-brand-600/30 transition active:scale-95"
                  >
                    <span>{currentStep === 'error' ? 'Retry Upload & Course Generation' : 'Generate Interactive Course'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-brand-400 transition">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">
                  <span className="text-brand-400 font-semibold underline underline-offset-4">Click to browse</span> or drag and drop your PDF here
                </p>
                <p className="text-xs text-slate-500">Supports PDF documents up to 25MB</p>
              </div>
            </div>
          )}

          {/* Ingestion Pipeline State */}
          {currentStep !== 'idle' && currentStep !== 'error' && (
            <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4 max-w-lg mx-auto">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                  <span>{statusMessage}</span>
                </div>
                <span className="font-mono text-brand-400">{progressPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 via-accent-cyan to-accent-violet rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Pipeline Milestone Indicators */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px]">
                <div className={`p-2 rounded-lg border text-center transition ${
                  progressPercent >= 20 
                    ? 'bg-brand-500/10 border-brand-500/30 text-brand-300' 
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}>
                  <FileText className="h-3.5 w-3.5 mx-auto mb-1 opacity-80" />
                  <span>1. Upload PDF</span>
                </div>
                <div className={`p-2 rounded-lg border text-center transition ${
                  progressPercent >= 50 
                    ? 'bg-brand-500/10 border-brand-500/30 text-brand-300' 
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}>
                  <Layers className="h-3.5 w-3.5 mx-auto mb-1 opacity-80" />
                  <span>2. ChromaDB RAG</span>
                </div>
                <div className={`p-2 rounded-lg border text-center transition ${
                  progressPercent >= 80 
                    ? 'bg-brand-500/10 border-brand-500/30 text-brand-300' 
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}>
                  <BrainCircuit className="h-3.5 w-3.5 mx-auto mb-1 opacity-80" />
                  <span>3. Course Synthesis</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5 text-left">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-400" />
              <div>
                <p className="font-semibold text-rose-200">Pipeline Notice</p>
                <p className="mt-0.5 opacity-90">{errorMessage}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSampleCourse();
                    }}
                    className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium text-[11px] transition"
                  >
                    Load Demo Course Instead
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentStep('idle');
                      setErrorMessage('');
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Demo Option */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-accent-cyan"></span>
            <span>FastAPI Server Target: <code className="text-slate-300 font-mono">http://127.0.0.1:8000</code></span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleLoadSamplePdf}
              className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border border-accent-cyan/30 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-cyan-300 hover:text-cyan-200 transition shadow-sm"
              title="Uploads and generates from a real sample PDF through your backend"
            >
              <FileText className="h-4 w-4 text-accent-cyan" />
              <span>Try with Sample PDF (Real Backend)</span>
            </button>

            <button
              type="button"
              onClick={handleLoadSampleCourse}
              className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 hover:text-brand-200 transition shadow-sm hover:shadow-brand-500/10"
            >
              <BookOpen className="h-4 w-4 text-brand-400" />
              <span>Load Instant Demo Course</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
