import React, { useState } from 'react';
import { SmartAssessment, QuizQuestion, QuizAttempt } from '../types';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Trophy, 
  Clock,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface SmartAssessmentModalProps {
  assessment: SmartAssessment;
  isOpen: boolean;
  onClose: () => void;
  onRecordAttempt: (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => void;
  onComplete: (assessmentId: string, scorePct: number, subjectKey: string) => void;
}

export const SmartAssessmentModal: React.FC<SmartAssessmentModalProps> = ({
  assessment,
  isOpen,
  onClose,
  onRecordAttempt,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ: QuizQuestion = assessment.questions[currentIndex] || assessment.questions[0];
  const selectedOption = selectedAnswers[currentIndex];
  const hasAnsweredCurrent = selectedOption !== undefined;
  const isCurrentCorrect = hasAnsweredCurrent && selectedOption === currentQ.correct_answer;

  const handleSelectOption = (option: string) => {
    if (isSubmitted || hasAnsweredCurrent) return;

    const isCorrect = option === currentQ.correct_answer;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }));

    // Record into Skill Analytics immediately
    onRecordAttempt({
      courseTitle: assessment.subjectName,
      lessonId: assessment.id,
      lessonTitle: assessment.title,
      questionId: currentQ.id,
      questionText: currentQ.question,
      selectedAnswer: option,
      correctAnswer: currentQ.correct_answer,
      isCorrect,
      topicOrConcept: assessment.topic,
      difficulty: assessment.difficulty
    });
  };

  const handleNext = () => {
    if (currentIndex < assessment.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Finished all questions
      let correctCount = 0;
      assessment.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correct_answer) {
          correctCount += 1;
        }
      });
      const scorePct = Math.round((correctCount / assessment.questions.length) * 100);
      onComplete(assessment.id, scorePct, assessment.subjectKey);
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowHint({});
    setIsSubmitted(false);
    setIsFinished(false);
  };

  // Compute final score
  let correctCount = 0;
  assessment.questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correct_answer) correctCount++;
  });
  const finalScore = Math.round((correctCount / assessment.questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#D9E2EC] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#D9E2EC] bg-[#F0F4F8] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E6F8FB] border border-[#00A3BF]/30 text-[#00A3BF]">
                {assessment.subjectName}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white text-[#243B53] border border-[#D9E2EC]">
                {assessment.difficulty}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#7B61FF] font-medium">
                <Clock className="h-3 w-3" />
                <span>{assessment.dueDateLabel}</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#102A43] tracking-tight">
              {assessment.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#627D98] hover:text-[#102A43] hover:bg-[#E2E8F0] transition shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar Across Questions */}
        {!isFinished && (
          <div className="w-full bg-[#E2E8F0] h-1.5 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00A3BF] to-[#7B61FF] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / assessment.questions.length) * 100}%` }}
            />
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {!isFinished ? (
            <>
              {/* Question Meta & Count */}
              <div className="flex items-center justify-between text-xs text-[#627D98]">
                <span>Question {currentIndex + 1} of {assessment.questions.length}</span>
                <span className="font-mono text-[#00A3BF] font-semibold">{assessment.topic}</span>
              </div>

              {/* Question Text */}
              <div className="rounded-xl border border-[#D9E2EC] bg-[#F0F4F8]/70 p-4 sm:p-5">
                <h3 className="text-sm sm:text-base font-semibold text-[#102A43] leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQ.correct_answer;

                  let cardStyle = 'border-[#D9E2EC] bg-white hover:border-[#00A3BF]/40 hover:bg-[#F0F4F8] text-[#243B53] shadow-xs';
                  let badgeStyle = 'bg-[#F0F4F8] text-[#243B53] border-[#D9E2EC]';

                  if (hasAnsweredCurrent) {
                    if (isCorrect) {
                      cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs font-semibold';
                      badgeStyle = 'bg-emerald-600 text-white border-emerald-500';
                    } else if (isSelected) {
                      cardStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-semibold';
                      badgeStyle = 'bg-rose-600 text-white border-rose-500';
                    } else {
                      cardStyle = 'border-[#E2E8F0] bg-[#F8FAFC] text-[#627D98] opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasAnsweredCurrent}
                      onClick={() => handleSelectOption(option)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer disabled:cursor-default ${cardStyle}`}
                    >
                      <div className={`h-7 w-7 rounded-lg border flex items-center justify-center font-mono text-xs font-bold shrink-0 ${badgeStyle}`}>
                        {letter}
                      </div>
                      <span className="text-xs sm:text-sm font-medium flex-1">
                        {option}
                      </span>
                      {hasAnsweredCurrent && isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                      {hasAnsweredCurrent && isSelected && !isCorrect && (
                        <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Socratic Concept Explanation Box */}
              {hasAnsweredCurrent && (
                <div className={`p-4 rounded-xl border animate-fade-in ${
                  isCurrentCorrect 
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900' 
                    : 'border-amber-300 bg-amber-50 text-amber-950'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <Sparkles className={`h-4 w-4 shrink-0 mt-0.5 ${isCurrentCorrect ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold">
                        {isCurrentCorrect ? 'Correct! Excellent concept recall.' : 'Incorrect, but a great learning point:'}
                      </p>
                      <p className="leading-relaxed">
                        {currentQ.hint}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Socratic Hint Button before answering */}
              {!hasAnsweredCurrent && (
                <div className="pt-1">
                  {showHint[currentIndex] ? (
                    <div className="p-3 rounded-xl border border-[#7B61FF]/30 bg-[#F3F0FF] text-[#243B53] text-xs flex items-start gap-2">
                      <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#7B61FF]" />
                      <p><span className="font-semibold text-[#7B61FF]">Socratic Hint:</span> {currentQ.hint}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowHint(prev => ({ ...prev, [currentIndex]: true }))}
                      className="text-xs text-[#7B61FF] hover:text-[#6348EE] flex items-center gap-1.5 font-semibold transition"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Need a Socratic hint before answering?</span>
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Assessment Completed Screen */
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-[#F3F0FF] text-[#7B61FF] border border-[#7B61FF]/30 shadow-md">
                <Trophy className="h-10 w-10 text-[#7B61FF]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#102A43]">
                  Assessment Completed! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-[#627D98] max-w-md mx-auto leading-relaxed">
                  Your answers have been logged into <span className="text-[#00A3BF] font-semibold">Skill Analytics</span> and your subject progress has been automatically updated.
                </p>
              </div>

              {/* Score Display Card */}
              <div className="max-w-xs mx-auto p-5 rounded-2xl border border-[#D9E2EC] bg-[#F0F4F8] space-y-2">
                <div className="text-3xl font-black text-[#102A43]">
                  {finalScore}%
                </div>
                <div className="text-xs text-[#627D98]">
                  {correctCount} of {assessment.questions.length} Questions Correct
                </div>
                <div className="pt-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md border ${
                    finalScore >= 70 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{finalScore >= 70 ? 'Mastery Demonstrated' : 'Review Recommended'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2.5 rounded-xl border border-[#D9E2EC] bg-white hover:bg-[#F0F4F8] text-[#243B53] text-xs font-semibold transition flex items-center gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#00A3BF] hover:bg-[#008CA4] text-white text-xs font-bold transition shadow-sm"
                >
                  <span>Return to Dashboard</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        {!isFinished && (
          <div className="p-4 sm:p-5 border-t border-[#D9E2EC] bg-[#F0F4F8]/70 flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-3.5 py-2 rounded-xl border border-[#D9E2EC] bg-white hover:bg-[#F0F4F8] text-[#243B53] disabled:opacity-40 disabled:pointer-events-none text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!hasAnsweredCurrent}
              className="px-5 py-2 rounded-xl bg-[#00A3BF] hover:bg-[#008CA4] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>{currentIndex === assessment.questions.length - 1 ? 'Finish Assessment' : 'Next Question'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
