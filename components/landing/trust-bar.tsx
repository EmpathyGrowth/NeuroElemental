"use client"

import React, { useEffect, useState } from 'react'
import { Shield, Users, Clock, TrendingUp, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustMetric {
  icon: React.ComponentType<{ className?: string }>
  value: string | number
  label: string
  isAnimated?: boolean
  suffix?: string
}

const TrustBar = ({ className }: { className?: string }) => {
  const metrics: TrustMetric[] = [
    {
      icon: Award,
      value: "10",
      label: "Years of Research",
      suffix: " years"
    },
    {
      icon: Users,
      value: "1000s",
      label: "People Helped"
    },
    {
      icon: Clock,
      value: 5,
      label: "Minutes to Complete",
      suffix: " min"
    },
    {
      icon: Shield,
      value: "100%",
      label: "Private & Secure"
    }
  ]

  return (
    <div className={cn(
      "w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20",
      "border-y border-purple-100 dark:border-purple-900/50",
      className
    )}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {metrics.map((metric) => (
            <TrustMetricItem key={metric.label} {...metric} />
          ))}
        </div>
      </div>
    </div>
  )
}

const TrustMetricItem = ({
  icon: Icon,
  value,
  label,
  isAnimated,
  suffix
}: TrustMetric) => {
  return (
    <div className="flex items-center gap-3 group">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-400 dark:bg-purple-600 blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
        <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400 relative z-10" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "text-2xl font-bold text-gray-900 dark:text-white",
            isAnimated && "transition-all duration-500"
          )}>
            {value}
          </span>
          {suffix && (
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {suffix}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
    </div>
  )
}

// Inline trust indicators for CTAs
export const InlineTrust = ({ metric }: { metric: 'users' | 'time' | 'free' }) => {
  const metrics = {
    users: { icon: Users, text: "1000s of users" },
    time: { icon: Clock, text: "5 minutes" },
    free: { icon: Shield, text: "100% free" }
  }

  const { icon: Icon, text } = metrics[metric]

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
      <Icon className="w-4 h-4" />
      {text}
    </span>
  )
}

// Floating trust badge for sticky positioning
export const FloatingTrustBadge = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-in slide-in-from-left-5 duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-purple-100 dark:border-purple-900 px-4 py-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">
            <span className="text-green-600 dark:text-green-400">217</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">
              taking assessment now
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

// Trust section for landing page
export const TrustSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Diverse Thinkers Worldwide
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From neurodivergent individuals to mental health professionals,
            thousands trust NeuroElemental to understand their unique energy patterns.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <TrustCard
            icon={Award}
            title="Research-Backed"
            description="10 years of research, development and practice. Built on 20+ peer-reviewed studies"
          />
          <TrustCard
            icon={Shield}
            title="Ethically Designed"
            description="No manipulation, clear boundaries, transparent about limitations"
          />
          <TrustCard
            icon={Users}
            title="Community Validated"
            description="Tested and refined with thousands of neurodivergent individuals"
          />
          <TrustCard
            icon={TrendingUp}
            title="Continuously Improving"
            description="Regular updates based on user feedback and latest research"
          />
        </div>

        <TrustBar />
      </div>
    </section>
  )
}

const TrustCard = ({
  icon: Icon,
  title,
  description
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) => {
  return (
    <div className="text-center group">
      <div className="inline-flex p-3 rounded-full bg-purple-100 dark:bg-purple-900/50 mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

export default TrustBar