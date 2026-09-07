import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import confetti from 'canvas-confetti';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  MessageSquareQuote, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface QuizWidgetProps {
  questions: QuizQuestion[];
  lessonTitle: string;
  onAskTutor?: (contextPrompt: string) => void;
}

export const QuizWidget: React.FC<QuizWidgetProps> = ({
  questions,
  lessonTitle,
  onAskTutor,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  if (!questions || questions.length === 0) {
    return null;
  }

  const handleSelectOption = (questionId: string, option: string) => {
    if (checkedQuestions[questionId]) return; // already submitted
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleCheckAnswer = (q: QuizQuestion) => {
    const selected = selectedAnswers[q.id];
    if (!selected) return;

    setCheckedQuestions(prev => {
      const next = { ...prev, [q.id]: true };
      // Check if all are answered correctly to trigger celebratory confetti
      const allCorrect = questions.every(currQ => {
        const isCurrent = currQ.id === q.id;
        const answer = isCurrent ? selected : selectedAnswers[currQ.id];
        return answer === currQ.correct_answer;
      });
      if (allCorrect) {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch {
          // ignore if canvas not supported
        }
      }
      return next;
    });
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCheckedQuestions({});
    setRevealedHints({});
  };

  const toggleHint = (questionId: string) => {
    setRevealedHints(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleAskTutorForHelp = (q: QuizQuestion) => {
    if (!onAskTutor) return;
    const prompt = `I am reviewing this quiz question from the lesson "${lessonTitle}":\n"${q.question}"\nHint provided in text: "${q.hint}".\nCan you guide me with a Socratic question to help me understand the core principle?`;
    onAskTutor(prompt);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md mt-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-1.5">
              Concept Mastery Assessment
              <Sparkles className="h-4 w-4 text-accent-amber" />
            </h3>
            <p className="text-xs text-slate-400">
              Verify your understanding with Socratic multiple-choice checks
            </p>
          </div>
        </div>

        <button
          onClick={handleResetQuiz}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
          title="Reset answers"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const isChecked = !!checkedQuestions[q.id];
          const isCorrect = isChecked && selected === q.correct_answer;
          const isIncorrect = isChecked && selected !== q.correct_answer;
          const showHint = !!revealedHints[q.id];

          return (
            <div
              key={q.id || idx}
              className={`p-5 rounded-xl border transition-all ${
                isCorrect
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : isIncorrect
                  ? 'border-rose-500/30 bg-rose-500/5'
                  : 'border-slate-800/80 bg-slate-950/40'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start gap-3 mb-4">
                <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-slate-800 text-brand-300 font-mono text-xs font-bold">
                  {idx + 1}
                </span>
                <p className="text-sm font-medium text-slate-100 leading-relaxed">
                  {q.question}
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-9 mb-4">
                {q.options.map((option, optIdx) => {
                  const isOptSelected = selected === option;
                  const isTheCorrectOpt = option === q.correct_answer;

                  let optStyles = 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60';
                  
                  if (isChecked) {
                    if (isTheCorrectOpt) {
                      optStyles = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 font-medium';
                    } else if (isOptSelected && !isTheCorrectOpt) {
                      optStyles = 'border-rose-500/50 bg-rose-500/10 text-rose-300 line-through';
                    } else {
                      optStyles = 'border-slate-800/40 opacity-50 bg-slate-950/20 text-slate-400';
                    }
                  } else if (isOptSelected) {
                    optStyles = 'border-brand-500 bg-brand-500/15 text-white font-medium shadow-sm shadow-brand-500/20';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isChecked}
                      onClick={() => handleSelectOption(q.id, option)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border text-xs leading-snug transition-all flex items-start gap-2.5 ${optStyles}`}
                    >
                      <span className="shrink-0 font-mono text-[11px] font-semibold text-slate-400">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons & Hint */}
              <div className="pl-9 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {!isChecked ? (
                    <button
                      type="button"
                      disabled={!selected}
                      onClick={() => handleCheckAnswer(q)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selected
                          ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          Correct! Excellent conceptual grasp.
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          Not quite. Check the hint or consult your tutor!
                        </span>
                      )}
                    </div>
                  )}

                  {/* Hint Toggle */}
                  {q.hint && (
                    <button
                      type="button"
                      onClick={() => toggleHint(q.id)}
                      className="flex items-center gap-1 text-xs text-accent-amber hover:text-amber-300 px-2.5 py-1.5 rounded-lg bg-accent-amber/5 hover:bg-accent-amber/10 border border-accent-amber/20 transition"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'Show Socratic Hint'}</span>
                    </button>
                  )}
                </div>

                {/* Ask Tutor CTA */}
                {onAskTutor && (
                  <button
                    type="button"
                    onClick={() => handleAskTutorForHelp(q)}
                    className="flex items-center gap-1.5 text-xs text-brand-300 hover:text-brand-200 px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 transition"
                  >
                    <MessageSquareQuote className="h-3.5 w-3.5 text-accent-cyan" />
                    <span>Ask Tutor to Guide Me</span>
                  </button>
                )}
              </div>

              {/* Revealed Hint Box */}
              {showHint && q.hint && (
                <div className="ml-9 mt-3 p-3 rounded-xl bg-accent-amber/5 border border-accent-amber/20 text-accent-amber text-xs leading-relaxed flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Socratic Hint:</span>
                    <span>{q.hint}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
