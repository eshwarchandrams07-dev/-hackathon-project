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
  ArrowRight,
  X
} from 'lucide-react';

interface UploadZoneProps {
  isOpen?: boolean;
  onClose?: () => void;
  onCourseGenerated: (course: Course, fileName?: string) => void;
  isBackendOnline: boolean;
}

type IngestionStep = 'idle' | 'uploading' | 'processing_rag' | 'generating_course' | 'complete' | 'error';

export const UploadZone: React.FC<UploadZoneProps> = ({
  isOpen = true,
  onClose,
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

  if (isOpen === false) return null;

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
      setStatusMessage('Course ready!');

      setTimeout(() => {
        onCourseGenerated(generatedCourse, selectedFile?.name);
        onClose?.();
        resetState();
      }, 500);

    } catch (err: any) {
      console.error('Ingestion error:', err);
      setCurrentStep('error');
      setErrorMessage(
        err.message || 'FastAPI ingestion error. Verify backend is running on http://127.0.0.1:8000'
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
        onClose?.();
        resetState();
      }, 500);
    } catch (err: any) {
      console.error('Sample ingestion error:', err);
      setCurrentStep('error');
      setErrorMessage(err.message || 'Sample PDF ingestion failed.');
    }
  };

  const handleLoadSampleCourse = () => {
    setCurrentStep('generating_course');
    setProgressPercent(70);
    setStatusMessage('Loading demo curriculum...');
    
    setTimeout(() => {
      setProgressPercent(100);
      setCurrentStep('complete');
      setTimeout(() => {
        onCourseGenerated(SAMPLE_COURSE, 'sample_compiler_course.pdf');
        onClose?.();
        resetState();
      }, 400);
    }, 500);
  };

  const resetState = () => {
    setSelectedFile(null);
    setCurrentStep('idle');
    setProgressPercent(0);
    setStatusMessage('');
    setErrorMessage('');
  };

  const isProcessing = currentStep === 'uploading' || currentStep === 'processing_rag' || currentStep === 'generating_course';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#0f1523] border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <UploadCloud className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Ingest Course Material</h3>
              <p className="text-[11px] text-slate-400">Upload PDF textbook notes, slides, or syllabus</p>
            </div>
          </div>

          <button
            onClick={() => onClose?.()}
            disabled={isProcessing}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 disabled:opacity-40 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Upload Dropzone */}
        {currentStep === 'idle' || currentStep === 'error' ? (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                dragActive
                  ? 'border-brand-500 bg-brand-500/5'
                  : selectedFile
                  ? 'border-brand-500/40 bg-slate-900/60'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
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
                <div className="flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500">{formatFileSize(selectedFile.size)} • PDF Ready</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setErrorMessage('');
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="h-9 w-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-2">
                    <UploadCloud className="h-4 w-4 text-slate-300" />
                  </div>
                  <p className="text-xs font-medium text-slate-200">
                    Click to browse or drag PDF here
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    PDF format • Up to 25MB
                  </p>
                </div>
              )}
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 text-[11px]">{errorMessage}</div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-[11px]">Or test with:</span>
                <button
                  type="button"
                  onClick={handleLoadSamplePdf}
                  className="text-[11px] text-brand-400 hover:text-brand-300 underline underline-offset-2 transition"
                >
                  Compiler PDF
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleLoadSampleCourse}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline underline-offset-2 transition"
                >
                  Demo Course
                </button>
              </div>

              {selectedFile && (
                <button
                  type="button"
                  onClick={handleStartIngestion}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <span>Build Curriculum</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Processing State */
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-medium text-slate-200 flex items-center gap-2">
                {currentStep === 'complete' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                )}
                <span>{statusMessage}</span>
              </span>
              <span className="font-mono text-[11px]">{progressPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
              <div
                className="h-full bg-brand-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
              <div className={`flex items-center gap-1.5 ${progressPercent >= 25 ? 'text-slate-200' : 'text-slate-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${progressPercent >= 25 ? 'bg-brand-400' : 'bg-slate-700'}`} />
                <span>1. Upload</span>
              </div>
              <div className={`flex items-center gap-1.5 ${progressPercent >= 55 ? 'text-slate-200' : 'text-slate-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${progressPercent >= 55 ? 'bg-brand-400' : 'bg-slate-700'}`} />
                <span>2. Index</span>
              </div>
              <div className={`flex items-center gap-1.5 ${progressPercent >= 85 ? 'text-slate-200' : 'text-slate-500'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${progressPercent >= 85 ? 'bg-brand-400' : 'bg-slate-700'}`} />
                <span>3. Synthesize</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
