'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  ChevronLeft,
  Save,
  Loader2,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';

type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

interface QuizQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options: string[];
  correct_answer: string | boolean;
  points: number;
  explanation: string;
}

interface Lesson {
  id: string;
  title: string;
  module_id: string;
}

interface Course {
  id: string;
  title: string;
}

const createEmptyQuestion = (): QuizQuestion => ({
  id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  question: '',
  type: 'multiple_choice',
  options: ['', '', '', ''],
  correct_answer: '',
  points: 1,
  explanation: '',
});

export default function NewQuizPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Quiz form state
  const [title, setTitle] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestion[]>([createEmptyQuestion()]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse);
    } else {
      setLessons([]);
      setLessonId('');
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || data || []);
      }
    } catch (error) {
      logger.error('Error fetching courses:', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const fetchLessons = async (courseId: string) => {
    setLoadingLessons(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`);
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      }
    } catch (error) {
      logger.error('Error fetching lessons:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoadingLessons(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map((q, i) =>
      i === index ? { ...q, ...updates } : q
    ));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const question = questions[questionIndex];
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(questionIndex, { options: newOptions });
  };

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options.length < 6) {
      updateQuestion(questionIndex, { options: [...question.options, ''] });
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex];
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      // Reset correct answer if it was the removed option
      const newCorrectAnswer = question.correct_answer === question.options[optionIndex]
        ? ''
        : question.correct_answer;
      updateQuestion(questionIndex, { options: newOptions, correct_answer: newCorrectAnswer });
    }
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }
    if (!lessonId) {
      toast.error('Please select a lesson');
      return;
    }
    if (questions.some(q => !q.question.trim())) {
      toast.error('All questions must have text');
      return;
    }
    if (questions.some(q => q.type === 'multiple_choice' && q.options.filter(o => o.trim()).length < 2)) {
      toast.error('Multiple choice questions must have at least 2 options');
      return;
    }
    if (questions.some(q => !q.correct_answer && q.correct_answer !== false)) {
      toast.error('All questions must have a correct answer');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          lesson_id: lessonId,
          passing_score: passingScore,
          questions: questions.map(q => ({
            question: q.question,
            type: q.type,
            options: q.type === 'multiple_choice' ? q.options.filter(o => o.trim()) : undefined,
            correct_answer: q.correct_answer,
            points: q.points,
            explanation: q.explanation || undefined,
          })),
        }),
      });

      if (response.ok) {
        toast.success('Quiz created successfully');
        router.push('/dashboard/admin/quizzes');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create quiz');
      }
    } catch (error) {
      logger.error('Error creating quiz:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create New Quiz</h1>
        <p className="text-muted-foreground">
          Create a quiz for a lesson to test student knowledge
        </p>
      </div>

      {/* Basic Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
          <CardDescription>
            Basic quiz settings and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Module 1 Knowledge Check"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select
                value={lessonId}
                onValueChange={setLessonId}
                disabled={!selectedCourse || loadingLessons}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingLessons ? "Loading..." : "Select a lesson"} />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing Score (%)</Label>
            <Input
              id="passingScore"
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Questions</h2>
          <Button onClick={addQuestion} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <Card key={question.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Question {qIndex + 1}</CardTitle>
                </div>
                {questions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(qIndex)}
                    aria-label={`Delete question ${qIndex + 1}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question Text</Label>
                <Textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                  placeholder="Enter your question..."
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={question.type}
                    onValueChange={(value: QuestionType) => {
                      const updates: Partial<QuizQuestion> = { type: value };
                      if (value === 'true_false') {
                        updates.options = ['True', 'False'];
                        updates.correct_answer = true;
                      } else if (value === 'short_answer') {
                        updates.options = [];
                        updates.correct_answer = '';
                      } else {
                        updates.options = ['', '', '', ''];
                        updates.correct_answer = '';
                      }
                      updateQuestion(qIndex, updates);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min={1}
                    value={question.points}
                    onChange={(e) => updateQuestion(qIndex, { points: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {/* Multiple Choice Options */}
              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  <Label>Answer Options</Label>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correct_answer === option && option.trim() !== ''}
                          onChange={() => updateQuestion(qIndex, { correct_answer: option })}
                          className="w-4 h-4"
                          disabled={!option.trim()}
                        />
                        <Input
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1"
                        />
                        {question.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(qIndex, oIndex)}
                            aria-label={`Remove option ${oIndex + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {question.options.length < 6 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(qIndex)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select the radio button next to the correct answer
                  </p>
                </div>
              )}

              {/* True/False Options */}
              {question.type === 'true_false' && (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={question.correct_answer === true}
                        onChange={() => updateQuestion(qIndex, { correct_answer: true })}
                        className="w-4 h-4"
                      />
                      True
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={question.correct_answer === false}
                        onChange={() => updateQuestion(qIndex, { correct_answer: false })}
                        className="w-4 h-4"
                      />
                      False
                    </label>
                  </div>
                </div>
              )}

              {/* Short Answer */}
              {question.type === 'short_answer' && (
                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <Input
                    value={question.correct_answer as string}
                    onChange={(e) => updateQuestion(qIndex, { correct_answer: e.target.value })}
                    placeholder="Enter the correct answer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Student answers will be matched case-insensitively
                  </p>
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-2">
                <Label>Explanation (Optional)</Label>
                <Textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                  placeholder="Explain why this is the correct answer..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
