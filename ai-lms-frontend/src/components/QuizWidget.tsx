import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { apiService } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  MessageSquareQuote, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface QuizWidgetProps {
  questions: QuizQuestion[];
  lessonTitle: string;
  lessonContent?: string;
  onAskTutor?: (contextPrompt: string) => void;
}

export const QuizWidget: React.FC<QuizWidgetProps> = ({
  questions,
  lessonTitle,
  lessonContent,
  onAskTutor,
}) => {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(questions);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Sync activeQuestions whenever the parent props change (e.g. navigation to another lesson)
  useEffect(() => {
    setActiveQuestions(questions);
    setSelectedAnswers({});
    setCheckedQuestions({});
    setRevealedHints({});
  }, [questions, lessonTitle]);

  if (!activeQuestions || activeQuestions.length === 0) {
    return null;
  }

  const handleSelectOption = (questionId: string, option: string) => {
    if (checkedQuestions[questionId]) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleCheckAnswer = (q: QuizQuestion) => {
    const selected = selectedAnswers[q.id];
    if (!selected) return;

    setCheckedQuestions(prev => {
      const next = { ...prev, [q.id]: true };
      const allCorrect = activeQuestions.every(currQ => {
        const isCurrent = currQ.id === q.id;
        const answer = isCurrent ? selected : selectedAnswers[currQ.id];
        return answer === currQ.correct_answer;
      });
      if (allCorrect) {
        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 }
          });
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  // Reset answers and generate fresh questions for the lesson
  const handleResetQuiz = async () => {
    setSelectedAnswers({});
    setCheckedQuestions({});
    setRevealedHints({});
    setIsRegenerating(true);

    try {
      const newQuestions = await apiService.generateNewQuizQuestions(lessonTitle, lessonContent);
      if (newQuestions && newQuestions.length > 0) {
        setActiveQuestions(newQuestions);
      }
    } catch (err) {
      console.error('Failed to regenerate quiz questions:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const toggleHint = (questionId: string) => {
    setRevealedHints(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleAskTutorForHelp = (q: QuizQuestion) => {
    if (!onAskTutor) return;
    const prompt = `I am reviewing this quiz question (${q.difficulty || 'Medium'} difficulty) from the lesson "${lessonTitle}":\n"${q.question}"\nHint provided: "${q.hint}".\nCan you guide me with a Socratic question to help me understand the core principle?`;
    onAskTutor(prompt);
  };

  const getDifficultyBadge = (difficulty?: string, index: number = 0) => {
    const diff = (difficulty || (index === 0 ? 'Easy' : index === 1 ? 'Medium' : 'Hard')).toLowerCase();

    if (diff === 'easy') {
      return {
        label: 'Easy',
        style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
    }
    if (diff === 'hard') {
      return {
        label: 'Hard',
        style: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      };
    }
    return {
      label: 'Medium',
      style: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };
  };

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-[#0f1523]/80 p-5 backdrop-blur-sm shadow-sm">
      
      {/* Widget Header with Reset & Regenerate Action */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">
            Knowledge Check
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            ({activeQuestions.length} questions)
          </span>
        </div>

        <button
          onClick={handleResetQuiz}
          disabled={isRegenerating}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition disabled:opacity-50"
          title="Reset answers and create fresh questions for this lesson"
        >
          <RotateCcw className={`h-3 w-3 ${isRegenerating ? 'animate-spin text-brand-400' : ''}`} />
          <span>{isRegenerating ? 'Generating Questions...' : 'Reset & New Questions'}</span>
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {activeQuestions.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const isChecked = !!checkedQuestions[q.id];
          const isCorrect = isChecked && selected === q.correct_answer;
          const isIncorrect = isChecked && selected !== q.correct_answer;
          const showHint = !!revealedHints[q.id];
          const diffBadge = getDifficultyBadge(q.difficulty, idx);

          return (
            <div
              key={q.id || idx}
              className={`p-4 rounded-xl border transition-colors ${
                isCorrect
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : isIncorrect
                  ? 'border-rose-500/30 bg-rose-500/5'
                  : 'border-slate-800/80 bg-slate-950/40'
              }`}
            >
              {/* Question Header & Difficulty Tag */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="h-5 w-5 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {/* Difficulty Indicator */}
                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${diffBadge.style}`}>
                  {diffBadge.label}
                </span>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-2 pl-0 sm:pl-7 mb-3">
                {q.options.map((option, optIdx) => {
                  const isOptSelected = selected === option;
                  const isTheCorrectOpt = option === q.correct_answer;

                  let optStyles = 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900';
                  
                  if (isChecked) {
                    if (isTheCorrectOpt) {
                      optStyles = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 font-medium';
                    } else if (isOptSelected && !isTheCorrectOpt) {
                      optStyles = 'border-rose-500/40 bg-rose-500/10 text-rose-300 line-through';
                    } else {
                      optStyles = 'border-slate-800/40 opacity-40 bg-slate-950/20 text-slate-500';
                    }
                  } else if (isOptSelected) {
                    optStyles = 'border-brand-500 bg-brand-500/15 text-white font-medium';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isChecked}
                      onClick={() => handleSelectOption(q.id, option)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs leading-snug transition-colors flex items-start gap-2 ${optStyles}`}
                    >
                      <span className="shrink-0 font-mono text-[10px] text-slate-500 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons & Feedback */}
              <div className="pl-0 sm:pl-7 flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {!isChecked ? (
                    <button
                      type="button"
                      disabled={!selected}
                      onClick={() => handleCheckAnswer(q)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selected
                          ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs">
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Correct!
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-medium">
                          <XCircle className="h-3.5 w-3.5" />
                          Incorrect
                        </span>
                      )}
                    </div>
                  )}

                  {q.hint && (
                    <button
                      type="button"
                      onClick={() => toggleHint(q.id)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-800/60 transition"
                    >
                      <Lightbulb className="h-3 w-3 text-amber-400" />
                      <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                    </button>
                  )}
                </div>

                {onAskTutor && (
                  <button
                    type="button"
                    onClick={() => handleAskTutorForHelp(q)}
                    className="flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 transition"
                  >
                    <MessageSquareQuote className="h-3 w-3" />
                    <span>Ask Socratic Tutor</span>
                  </button>
                )}
              </div>

              {/* Revealed Hint */}
              {showHint && q.hint && (
                <div className="ml-7 mt-2.5 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-300/90 text-xs leading-relaxed">
                  <span className="font-medium">Hint: </span>
                  <span>{q.hint}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
