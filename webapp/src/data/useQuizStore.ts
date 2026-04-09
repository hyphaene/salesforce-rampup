import { useState, useCallback, useMemo } from "react";
import type { QuizQuestion, QuizDomain } from "./questions/types";

const HISTORY_KEY = "sf-rampup-quiz-history";

export interface QuizAttempt {
  questionId: string;
  selectedAnswer: string | string[];
  correct: boolean;
  timestamp: number;
}

function loadHistory(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: QuizAttempt[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export type QuizMode = "training" | "exam";

export function useQuizStore(allQuestions: QuizQuestion[]) {
  const [history, setHistory] = useState<QuizAttempt[]>(loadHistory);
  const [activeQuiz, setActiveQuiz] = useState<{
    questions: QuizQuestion[];
    currentIndex: number;
    answers: Map<string, string | string[]>;
    mode: QuizMode;
    domain: QuizDomain | "all";
    startTime: number;
  } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<
    string | string[] | null
  >(null);

  const startQuiz = useCallback(
    (domain: QuizDomain | "all", mode: QuizMode, count: number = 20) => {
      const pool =
        domain === "all"
          ? allQuestions
          : allQuestions.filter((q) => q.domain === domain);
      const questions = shuffleArray(pool).slice(
        0,
        Math.min(count, pool.length),
      );
      setActiveQuiz({
        questions,
        currentIndex: 0,
        answers: new Map(),
        mode,
        domain,
        startTime: Date.now(),
      });
      setShowExplanation(false);
      setSelectedAnswer(null);
    },
    [allQuestions],
  );

  const submitAnswer = useCallback(
    (answer: string | string[]) => {
      if (!activeQuiz) return;
      const question = activeQuiz.questions[activeQuiz.currentIndex];
      const correct = Array.isArray(question.answer)
        ? Array.isArray(answer) &&
          question.answer.length === answer.length &&
          question.answer.every((a) => answer.includes(a))
        : answer === question.answer;

      const attempt: QuizAttempt = {
        questionId: question.id,
        selectedAnswer: answer,
        correct,
        timestamp: Date.now(),
      };

      const newHistory = [...history, attempt];
      setHistory(newHistory);
      saveHistory(newHistory);

      const newAnswers = new Map(activeQuiz.answers);
      newAnswers.set(question.id, answer);
      setActiveQuiz({ ...activeQuiz, answers: newAnswers });
      setSelectedAnswer(answer);

      if (activeQuiz.mode === "training") {
        setShowExplanation(true);
      }
    },
    [activeQuiz, history],
  );

  const nextQuestion = useCallback(() => {
    if (!activeQuiz) return;
    if (activeQuiz.currentIndex < activeQuiz.questions.length - 1) {
      setActiveQuiz({
        ...activeQuiz,
        currentIndex: activeQuiz.currentIndex + 1,
      });
      setShowExplanation(false);
      setSelectedAnswer(null);
    }
  }, [activeQuiz]);

  const currentQuestion =
    activeQuiz?.questions[activeQuiz.currentIndex] ?? null;
  const isLastQuestion =
    activeQuiz !== null &&
    activeQuiz.currentIndex === activeQuiz.questions.length - 1;

  const quizResults = useMemo(() => {
    if (!activeQuiz) return null;
    const answered = activeQuiz.questions.filter((q) =>
      activeQuiz.answers.has(q.id),
    );
    const correct = answered.filter((q) => {
      const ans = activeQuiz.answers.get(q.id);
      if (!ans) return false;
      return Array.isArray(q.answer)
        ? Array.isArray(ans) &&
            q.answer.length === ans.length &&
            q.answer.every((a) => ans.includes(a))
        : ans === q.answer;
    });
    return {
      total: activeQuiz.questions.length,
      answered: answered.length,
      correct: correct.length,
      percent:
        answered.length === 0
          ? 0
          : Math.round((correct.length / answered.length) * 100),
      duration: Date.now() - activeQuiz.startTime,
      questions: activeQuiz.questions.map((q) => ({
        question: q,
        userAnswer: activeQuiz.answers.get(q.id) ?? null,
        correct: (() => {
          const ans = activeQuiz.answers.get(q.id);
          if (!ans) return false;
          return Array.isArray(q.answer)
            ? Array.isArray(ans) &&
                q.answer.length === ans.length &&
                q.answer.every((a) => ans.includes(a))
            : ans === q.answer;
        })(),
      })),
    };
  }, [activeQuiz]);

  const domainStats = useMemo(() => {
    const stats = new Map<string, { total: number; correct: number }>();
    for (const attempt of history) {
      const question = allQuestions.find((q) => q.id === attempt.questionId);
      if (!question) continue;
      const existing = stats.get(question.domain) ?? { total: 0, correct: 0 };
      existing.total++;
      if (attempt.correct) existing.correct++;
      stats.set(question.domain, existing);
    }
    return stats;
  }, [history, allQuestions]);

  const endQuiz = useCallback(() => {
    setActiveQuiz(null);
    setShowExplanation(false);
    setSelectedAnswer(null);
  }, []);

  return {
    activeQuiz,
    currentQuestion,
    isLastQuestion,
    showExplanation,
    selectedAnswer,
    quizResults,
    domainStats,
    startQuiz,
    submitAnswer,
    nextQuestion,
    endQuiz,
    setSelectedAnswer,
  };
}
