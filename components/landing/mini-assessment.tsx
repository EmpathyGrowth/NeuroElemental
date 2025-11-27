'use client'

import React, { useState, memo, useRef, useEffect } from 'react'
import { ChevronRight, Sparkles, Zap, Brain, Heart, Compass, Mountain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

/** Delay in ms before transitioning to next question or result */
const QUESTION_TRANSITION_DELAY = 300

interface Question {
  id: number
  text: string
  options: {
    value: number
    label: string
    element: 'electric' | 'fiery' | 'aquatic' | 'earthly' | 'airy' | 'metallic'
  }[]
}

const questions: Question[] = [
  {
    id: 1,
    text: "When you're energized, you tend to:",
    options: [
      { value: 1, label: "Seek out new experiences and people", element: 'electric' },
      { value: 2, label: "Dive deep into passionate projects", element: 'fiery' },
      { value: 3, label: "Connect meaningfully with others", element: 'aquatic' },
      { value: 4, label: "Find balance and harmony", element: 'earthly' },
      { value: 5, label: "Explore ideas and possibilities", element: 'airy' },
      { value: 6, label: "Organize and perfect systems", element: 'metallic' }
    ]
  },
  {
    id: 2,
    text: "You recharge best by:",
    options: [
      { value: 1, label: "Trying something completely new", element: 'electric' },
      { value: 2, label: "Achieving a meaningful goal", element: 'fiery' },
      { value: 3, label: "Quality time with loved ones", element: 'aquatic' },
      { value: 4, label: "Being in nature or peaceful spaces", element: 'earthly' },
      { value: 5, label: "Learning or creating alone", element: 'airy' },
      { value: 6, label: "Completing tasks and organizing", element: 'metallic' }
    ]
  },
  {
    id: 3,
    text: "Under stress, you typically:",
    options: [
      { value: 1, label: "Get restless and need change", element: 'electric' },
      { value: 2, label: "Push harder to fix things", element: 'fiery' },
      { value: 3, label: "Feel emotions intensely", element: 'aquatic' },
      { value: 4, label: "Withdraw to find stability", element: 'earthly' },
      { value: 5, label: "Overthink and analyze", element: 'airy' },
      { value: 6, label: "Become rigid about routines", element: 'metallic' }
    ]
  }
]

const elementConfig = {
  electric: {
    color: 'from-yellow-400 to-orange-400',
    icon: Zap,
    name: 'Electric',
    description: 'High energy, spontaneous, novelty-seeking'
  },
  fiery: {
    color: 'from-red-400 to-pink-400',
    icon: Sparkles,
    name: 'Fiery',
    description: 'Passionate, driven, achievement-focused'
  },
  aquatic: {
    color: 'from-blue-400 to-cyan-400',
    icon: Heart,
    name: 'Aquatic',
    description: 'Emotionally deep, empathetic, connection-oriented'
  },
  earthly: {
    color: 'from-green-400 to-emerald-400',
    icon: Mountain,
    name: 'Earthly',
    description: 'Grounded, stable, harmony-seeking'
  },
  airy: {
    color: 'from-cyan-400 to-blue-400',
    icon: Brain,
    name: 'Airy',
    description: 'Curious, thoughtful, idea-focused'
  },
  metallic: {
    color: 'from-gray-400 to-slate-400',
    icon: Compass,
    name: 'Metallic',
    description: 'Structured, precise, system-oriented'
  }
}

export const MiniAssessment = memo(() => {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleAnswer = (element: string) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const newAnswers = { ...answers, [currentQuestion]: element }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      timeoutRef.current = setTimeout(() => setCurrentQuestion(currentQuestion + 1), QUESTION_TRANSITION_DELAY)
    } else {
      timeoutRef.current = setTimeout(() => setShowResult(true), QUESTION_TRANSITION_DELAY)
    }
  }

  const calculateResult = (): keyof typeof elementConfig => {
    const elementCounts: Record<string, number> = {}
    Object.values(answers).forEach(element => {
      elementCounts[element] = (elementCounts[element] || 0) + 1
    })

    const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])
    // Default to 'electric' if no answers (shouldn't happen in normal flow)
    const topElement = sorted[0]?.[0] ?? 'electric'
    return topElement as keyof typeof elementConfig
  }

  const reset = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResult(false)
    setIsStarted(false)
  }

  if (!isStarted) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl" />
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-purple-200 dark:border-purple-800 p-8 text-center">
          <div className="inline-flex p-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 mb-4">
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Energy Check
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Answer 3 quick questions to get an instant preview of your dominant energy element.
            Takes just 30 seconds!
          </p>
          <Button
            size="lg"
            onClick={() => setIsStarted(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          >
            Start Quick Check
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            No email required • Instant results
          </p>
        </div>
      </div>
    )
  }

  if (showResult) {
    const dominantElement = calculateResult()
    const config = elementConfig[dominantElement]
    const Icon = config.icon

    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl" />
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-purple-200 dark:border-purple-800 p-8">
          <div className="text-center mb-8">
            <div className="inline-block">
              <div className={cn(
                "inline-flex p-6 rounded-full bg-gradient-to-br mb-6",
                config.color
              )}>
                <Icon className="w-16 h-16 text-white" />
              </div>
            </div>

            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              You Have Strong {config.name} Energy!
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {config.description}
            </p>

            <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-6 mb-6 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-900 dark:text-gray-300 mb-4 font-medium">
                This is just a glimpse! The full assessment reveals:
              </p>
              <ul className="text-left text-sm text-gray-800 dark:text-gray-400 space-y-2 max-w-sm mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">✓</span>
                  Your complete 6-element energy blend
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">✓</span>
                  How you function in different states (biological, societal, passion, survival)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">✓</span>
                  Personalized regeneration strategies
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">✓</span>
                  Why certain environments drain or energize you
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/assessment')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                Take Full Assessment (5 min)
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={reset}
              >
                Try Again
              </Button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Free forever • No credit card • 1000s discovered their energy today
            </p>
          </div>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl" />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl border border-purple-200 dark:border-purple-800 p-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            {question.text}
          </h3>

            <div className="grid gap-3">
              {question.options.map((option) => {
                const config = elementConfig[option.element]
                const Icon = config.icon

                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.element)}
                    aria-label={`Select: ${option.label}`}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      "hover:border-purple-400 dark:hover:border-purple-600 hover:scale-[1.02]",
                      "border-gray-200 dark:border-gray-800",
                      "bg-white dark:bg-gray-900",
                      "group"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br opacity-20 group-hover:opacity-100 transition-opacity",
                      config.color
                    )}>
                      <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-white" />
                    </div>
                    <span className="text-left flex-1 text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )
              })}
            </div>
        </div>

        <button
          onClick={reset}
          aria-label="Reset assessment and start over"
          className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mx-auto block"
        >
          Start over
        </button>
      </div>
    </div>
  )
})

export default MiniAssessment