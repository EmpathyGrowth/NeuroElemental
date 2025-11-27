'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

/** Question types supported by the quiz system */
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

/** Individual quiz question */
export interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correct_answer: string | boolean;
  points: number;
  explanation?: string;
}

/** Quiz data structure */
export interface Quiz {
  id: string;
  title: string;
  passing_score: number;
  questions: QuizQuestion[];
}

/** Result feedback for a question */
export interface QuestionFeedback {
  question_id: string;
  question: string;
  user_answer: string | boolean | undefined;
  correct_answer: string | boolean;
  is_correct: boolean;
  explanation?: string;
  points: number;
}

/** Quiz submission result */
export interface QuizResult {
  attempt_id: string;
  score: number;
  passed: boolean;
  passing_score: number;
  total_questions: number;
  correct_count: number;
  total_points: number;
  earned_points: number;
  feedback: QuestionFeedback[];
}

interface QuizPlayerProps {
  quiz: Quiz;
  onSubmit: (answers: Record<string, string | boolean>) => Promise<QuizResult>;
  onComplete?: (result: QuizResult) => void;
  onRetry?: () => void;
  allowRetry?: boolean;
}

type QuizState = 'taking' | 'submitting' | 'results';

/**
 * Quiz Player Component
 * Handles taking quizzes with multiple question types and displaying results
 */
export function QuizPlayer({
  quiz,
  onSubmit,
  onComplete,
  onRetry,
  allowRetry = true,
}: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [quizState, setQuizState] = useState<QuizState>('taking');
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleAnswerChange = useCallback((questionId: string, value: string | boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestionIndex(index);
    }
  }, [totalQuestions]);

  const handleSubmit = async () => {
    // Validate all questions are answered
    const unanswered = quiz.questions.filter(q => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
      return;
    }

    setError(null);
    setQuizState('submitting');

    try {
      const quizResult = await onSubmit(answers);
      setResult(quizResult);
      setQuizState('results');
      onComplete?.(quizResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      setQuizState('taking');
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setQuizState('taking');
    setError(null);
    onRetry?.();
  };

  // Render results view
  if (quizState === 'results' && result) {
    return (
      <QuizResults
        result={result}
        quiz={quiz}
        onRetry={allowRetry ? handleRetry : undefined}
      />
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <CardDescription>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Question */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
          <p className="text-sm text-muted-foreground">
            {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
          </p>

          {/* Answer input based on question type */}
          <QuestionInput
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          />
        </div>

        {/* Question navigation dots */}
        <div className="flex flex-wrap gap-2 justify-center py-4">
          {quiz.questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(index)}
              aria-label={`Go to question ${index + 1}${answers[q.id] !== undefined ? ' (answered)' : ''}`}
              aria-current={index === currentQuestionIndex ? 'step' : undefined}
              className={cn(
                'w-8 h-8 rounded-full text-sm font-medium transition-colors',
                index === currentQuestionIndex
                  ? 'bg-primary text-primary-foreground'
                  : answers[q.id] !== undefined
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => goToQuestion(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={() => goToQuestion(currentQuestionIndex + 1)}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={quizState === 'submitting'}
              className="bg-green-600 hover:bg-green-700"
            >
              {quizState === 'submitting' ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Question input component based on type */
interface QuestionInputProps {
  question: QuizQuestion;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
}

function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  switch (question.type) {
    case 'multiple_choice':
      return (
        <RadioGroup
          value={value as string | undefined}
          onValueChange={onChange}
          className="space-y-3"
        >
          {question.options?.map((option, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center space-x-3 p-3 rounded-lg border transition-colors',
                value === option
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case 'true_false':
      return (
        <RadioGroup
          value={value !== undefined ? String(value) : undefined}
          onValueChange={(v) => onChange(v === 'true')}
          className="space-y-3"
        >
          {['true', 'false'].map((option) => (
            <div
              key={option}
              className={cn(
                'flex items-center space-x-3 p-3 rounded-lg border transition-colors',
                String(value) === option
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <RadioGroupItem value={option} id={`tf-${option}`} />
              <Label htmlFor={`tf-${option}`} className="flex-1 cursor-pointer capitalize">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case 'short_answer':
      return (
        <Input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full"
        />
      );

    default:
      return null;
  }
}

/** Quiz results display component */
interface QuizResultsProps {
  result: QuizResult;
  quiz: Quiz;
  onRetry?: () => void;
}

function QuizResults({ result, quiz: _quiz, onRetry }: QuizResultsProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <div
          className={cn(
            'mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4',
            result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          )}
        >
          {result.passed ? (
            <Trophy className="w-10 h-10" />
          ) : (
            <XCircle className="w-10 h-10" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {result.passed ? 'Congratulations!' : 'Keep Trying!'}
        </CardTitle>
        <CardDescription>
          {result.passed
            ? "You've passed the quiz!"
            : `You need ${result.passing_score}% to pass. Try again!`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold text-primary">{result.score}%</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold">
              {result.correct_count}/{result.total_questions}
            </div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold">
              {result.earned_points}/{result.total_points}
            </div>
            <div className="text-sm text-muted-foreground">Points</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-3xl font-bold">{result.passing_score}%</div>
            <div className="text-sm text-muted-foreground">Passing</div>
          </div>
        </div>

        {/* Toggle details button */}
        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? 'Hide Details' : 'Show Answer Details'}
        </Button>

        {/* Detailed feedback */}
        {showDetails && (
          <div className="space-y-4">
            {result.feedback.map((fb, index) => (
              <div
                key={fb.question_id}
                className={cn(
                  'p-4 rounded-lg border',
                  fb.is_correct
                    ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900'
                    : 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {fb.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">
                      {index + 1}. {fb.question}
                    </p>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Your answer: </span>
                        <span className={fb.is_correct ? 'text-green-600' : 'text-red-600'}>
                          {String(fb.user_answer ?? 'No answer')}
                        </span>
                      </p>
                      {!fb.is_correct && (
                        <p>
                          <span className="text-muted-foreground">Correct answer: </span>
                          <span className="text-green-600">{String(fb.correct_answer)}</span>
                        </p>
                      )}
                      {fb.explanation && (
                        <p className="text-muted-foreground italic mt-2">
                          {fb.explanation}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {fb.is_correct ? fb.points : 0}/{fb.points} points
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Retry button */}
        {onRetry && !result.passed && (
          <Button onClick={onRetry} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default QuizPlayer;
