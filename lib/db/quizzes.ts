/**
 * Quiz Repository
 * Handles quiz CRUD operations and quiz attempt management
 */

import { BaseRepository } from './base-repository';
import { getSupabaseServer } from './supabase-server';
import type { Database } from '@/lib/types/supabase';

type Quiz = Database['public']['Tables']['quizzes']['Row'];
type _QuizInsert = Database['public']['Tables']['quizzes']['Insert'];
type QuizUpdate = Database['public']['Tables']['quizzes']['Update'];
type QuizAttempt = Database['public']['Tables']['quiz_attempts']['Row'];
type QuizAttemptInsert = Database['public']['Tables']['quiz_attempts']['Insert'];

/** Question structure within a quiz */
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string | boolean;
  points: number;
  explanation?: string;
}

/** Quiz with parsed questions */
export interface QuizWithQuestions extends Omit<Quiz, 'questions'> {
  questions: QuizQuestion[];
}

/** Quiz attempt result */
export interface QuizAttemptResult {
  quiz_id: string;
  score: number;
  passed: boolean;
  total_points: number;
  earned_points: number;
  answers: Record<string, string | boolean>;
  correct_count: number;
  total_questions: number;
}

class QuizRepository extends BaseRepository<'quizzes'> {
  constructor() {
    super('quizzes');
  }

  /**
   * Find quiz by lesson ID
   */
  async findByLessonId(lessonId: string): Promise<QuizWithQuestions | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .single();

    if (error || !data) return null;
    return this.parseQuizQuestions(data);
  }

  /**
   * Find quiz by ID with parsed questions
   */
  async findByIdWithQuestions(id: string): Promise<QuizWithQuestions | null> {
    const quiz = await this.findByIdOrNull(id);
    if (!quiz) return null;
    return this.parseQuizQuestions(quiz);
  }

  /**
   * Create a quiz for a lesson
   */
  async createForLesson(
    lessonId: string,
    title: string,
    questions: QuizQuestion[],
    passingScore: number = 70
  ): Promise<Quiz> {
    return this.create({
      lesson_id: lessonId,
      title,
      questions: questions as unknown as Database['public']['Tables']['quizzes']['Insert']['questions'],
      passing_score: passingScore,
    });
  }

  /**
   * Update quiz questions
   */
  async updateQuestions(
    quizId: string,
    questions: QuizQuestion[],
    passingScore?: number
  ): Promise<Quiz | null> {
    const updateData: QuizUpdate = {
      questions: questions as unknown as Database['public']['Tables']['quizzes']['Update']['questions'],
    };
    if (passingScore !== undefined) {
      updateData.passing_score = passingScore;
    }
    return this.update(quizId, updateData);
  }

  /**
   * Grade a quiz submission
   */
  gradeQuiz(
    quiz: QuizWithQuestions,
    answers: Record<string, string | boolean>
  ): QuizAttemptResult {
    let earnedPoints = 0;
    let correctCount = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    for (const question of quiz.questions) {
      const userAnswer = answers[question.id];
      const isCorrect = this.checkAnswer(question, userAnswer);

      if (isCorrect) {
        earnedPoints += question.points;
        correctCount++;
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= (quiz.passing_score || 70);

    return {
      quiz_id: quiz.id,
      score,
      passed,
      total_points: totalPoints,
      earned_points: earnedPoints,
      answers,
      correct_count: correctCount,
      total_questions: quiz.questions.length,
    };
  }

  /**
   * Submit a quiz attempt
   */
  async submitAttempt(
    userId: string,
    quizId: string,
    answers: Record<string, string | boolean>
  ): Promise<{ attempt: QuizAttempt; result: QuizAttemptResult }> {
    const quiz = await this.findByIdWithQuestions(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const result = this.gradeQuiz(quiz, answers);

    const supabase = getSupabaseServer();
    const attemptData: QuizAttemptInsert = {
      user_id: userId,
      quiz_id: quizId,
      answers: answers as unknown as Database['public']['Tables']['quiz_attempts']['Insert']['answers'],
      score: result.score,
      passed: result.passed,
      completed_at: new Date().toISOString(),
    };

    const { data: attempt, error } = await (supabase as any)
      .from('quiz_attempts')
      .insert(attemptData)
      .select()
      .single() as { data: QuizAttempt | null; error: Error | null };

    if (error || !attempt) {
      throw new Error('Failed to save quiz attempt');
    }

    return { attempt, result };
  }

  /**
   * Get user's attempts for a quiz
   */
  async getUserAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false });

    if (error) return [];
    return data || [];
  }

  /**
   * Get user's best attempt for a quiz
   */
  async getUserBestAttempt(userId: string, quizId: string): Promise<QuizAttempt | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data;
  }

  /**
   * Check if user has passed the quiz
   */
  async hasUserPassed(userId: string, quizId: string): Promise<boolean> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .eq('passed', true)
      .limit(1)
      .single();

    return !error && !!data;
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats(quizId: string): Promise<{
    total_attempts: number;
    pass_rate: number;
    average_score: number;
  }> {
    const supabase = getSupabaseServer();
    const { data: attempts, error } = await (supabase as any)
      .from('quiz_attempts')
      .select('score, passed')
      .eq('quiz_id', quizId) as { data: { score: number; passed: boolean }[] | null; error: Error | null };

    if (error || !attempts || attempts.length === 0) {
      return { total_attempts: 0, pass_rate: 0, average_score: 0 };
    }

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a: { passed: boolean }) => a.passed).length;
    const totalScore = attempts.reduce((sum: number, a: { score: number }) => sum + a.score, 0);

    return {
      total_attempts: totalAttempts,
      pass_rate: Math.round((passedAttempts / totalAttempts) * 100),
      average_score: Math.round(totalScore / totalAttempts),
    };
  }

  /**
   * Parse quiz questions from JSON
   */
  private parseQuizQuestions(quiz: Quiz): QuizWithQuestions {
    const questions = Array.isArray(quiz.questions)
      ? (quiz.questions as unknown as QuizQuestion[])
      : [];

    // Ensure each question has an ID
    const questionsWithIds = questions.map((q, index) => ({
      ...q,
      id: q.id || `q_${index}`,
    }));

    return {
      ...quiz,
      questions: questionsWithIds,
    };
  }

  /**
   * Check if an answer is correct
   */
  private checkAnswer(
    question: QuizQuestion,
    userAnswer: string | boolean | undefined
  ): boolean {
    if (userAnswer === undefined || userAnswer === null) return false;

    switch (question.type) {
      case 'true_false':
        return userAnswer === question.correct_answer;
      case 'multiple_choice':
        return String(userAnswer).toLowerCase() === String(question.correct_answer).toLowerCase();
      case 'short_answer':
        // Case-insensitive comparison for short answers
        return String(userAnswer).toLowerCase().trim() ===
               String(question.correct_answer).toLowerCase().trim();
      default:
        return false;
    }
  }
}

export const quizRepository = new QuizRepository();
export { QuizRepository };
