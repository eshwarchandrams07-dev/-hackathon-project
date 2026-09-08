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
  onAnswerSubmit?: (question: QuizQuestion, selectedAnswer: string, isCorrect: boolean) => void;
}

export const QuizWidget: React.FC<QuizWidgetProps> = ({
  questions,
  lessonTitle,
  lessonContent,
  onAskTutor,
  onAnswerSubmit,
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

    const isCorrect = selected.trim() === q.correct_answer.trim();
    onAnswerSubmit?.(q, selected, isCorrect);

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
    <div className="rounded-2xl border border-[#D9E2EC] bg-white p-5 shadow-sm">
      
      {/* Widget Header with Reset & Regenerate Action */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D9E2EC]">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#00A3BF]" />
          <h3 className="text-sm font-semibold text-[#102A43]">
            Knowledge Check
          </h3>
          <span className="text-[11px] font-mono text-[#627D98]">
            ({activeQuestions.length} questions)
          </span>
        </div>

        <button
          onClick={handleResetQuiz}
          disabled={isRegenerating}
          className="flex items-center gap-1.5 text-xs text-[#243B53] px-2.5 py-1 rounded-lg bg-[#F0F4F8] border border-[#D9E2EC] hover:border-[#00A3BF]/40 hover:bg-[#E6F8FB] hover:text-[#00A3BF] transition disabled:opacity-50 font-medium"
          title="Reset answers and create fresh questions for this lesson"
        >
          <RotateCcw className={`h-3 w-3 ${isRegenerating ? 'animate-spin text-[#00A3BF]' : ''}`} />
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
                  ? 'border-emerald-500/40 bg-emerald-50/70'
                  : isIncorrect
                  ? 'border-rose-500/40 bg-rose-50/70'
                  : 'border-[#D9E2EC] bg-[#F0F4F8]/50 hover:bg-[#F0F4F8]'
              }`}
            >
              {/* Question Header & Difficulty Tag */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="h-5 w-5 rounded-md bg-[#102A43]/10 text-[#102A43] flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-[#102A43] leading-relaxed">
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

                  let optStyles = 'border-[#D9E2EC] bg-white text-[#243B53] hover:border-[#00A3BF]/40 hover:bg-[#F0F4F8] shadow-sm';
                  
                  if (isChecked) {
                    if (isTheCorrectOpt) {
                      optStyles = 'border-emerald-500 bg-emerald-100/80 text-emerald-900 font-semibold shadow-sm';
                    } else if (isOptSelected && !isTheCorrectOpt) {
                      optStyles = 'border-rose-400 bg-rose-100/80 text-rose-900 line-through';
                    } else {
                      optStyles = 'border-[#E2E8F0] opacity-40 bg-[#F8FAFC] text-[#627D98]';
                    }
                  } else if (isOptSelected) {
                    optStyles = 'border-[#00A3BF] bg-[#E6F8FB] text-[#00A3BF] font-semibold ring-1 ring-[#00A3BF]/40 shadow-sm';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={isChecked}
                      onClick={() => handleSelectOption(q.id, option)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs leading-snug transition-colors flex items-start gap-2 ${optStyles}`}
                    >
                      <span className={`shrink-0 font-mono text-[10px] mt-0.5 font-bold ${isOptSelected ? 'text-[#00A3BF]' : 'text-[#627D98]'}`}>
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        selected
                          ? 'bg-[#00A3BF] hover:bg-[#008CA4] text-white shadow-sm'
                          : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                      }`}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs">
                      {isCorrect ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Correct!
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1 font-bold">
                          <XCircle className="h-4 w-4 text-rose-600" />
                          Incorrect
                        </span>
                      )}
                    </div>
                  )}

                  {q.hint && (
                    <button
                      type="button"
                      onClick={() => toggleHint(q.id)}
                      className="flex items-center gap-1 text-[11px] text-[#627D98] hover:text-[#102A43] px-2 py-1 rounded-md hover:bg-[#E2E8F0]/60 transition"
                    >
                      <Lightbulb className="h-3 w-3 text-amber-500" />
                      <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
                    </button>
                  )}
                </div>

                {onAskTutor && (
                  <button
                    type="button"
                    onClick={() => handleAskTutorForHelp(q)}
                    className="flex items-center gap-1 text-[11px] text-[#7B61FF] hover:text-[#6348EE] hover:bg-[#F3F0FF] px-2 py-1 rounded-md transition font-medium"
                  >
                    <MessageSquareQuote className="h-3.5 w-3.5" />
                    <span>Ask Socratic Tutor</span>
                  </button>
                )}
              </div>

              {/* Revealed Hint */}
              {showHint && q.hint && (
                <div className="ml-7 mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs leading-relaxed">
                  <span className="font-bold text-amber-950">Hint: </span>
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
