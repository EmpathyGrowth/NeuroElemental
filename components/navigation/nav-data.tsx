import {
    Atom,
    Award,
    BookOpen,
    Brain,
    Calendar,
    FlaskConical,
    Sparkles,
    Wrench
} from 'lucide-react';

export const learnItems = [
  {
    title: 'Framework',
    href: '/framework',
    description: 'The NeuroElemental framework for understanding neurodiversity',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    title: 'Elements',
    href: '/elements',
    description: 'Explore the elemental archetypes of neurodivergent minds',
    icon: <Atom className="w-4 h-4" />,
  },
  {
    title: 'Brain Diversity',
    href: '/brain-diversity',
    description: 'Understanding different neurological profiles',
    icon: <Brain className="w-4 h-4" />,
  },
  {
    title: 'Science',
    href: '/science',
    description: 'Research and evidence behind our approach',
    icon: <FlaskConical className="w-4 h-4" />,
  },
  {
    title: 'Tools',
    href: '/tools',
    description: 'Interactive tools for exploring your energy',
    icon: <Wrench className="w-4 h-4" />,
  },
];

export const offeringsItems = [
  {
    title: 'Courses',
    href: '/courses',
    description: 'Self-paced learning programs for neurodivergent individuals',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    title: 'Events',
    href: '/events',
    description: 'Workshops, webinars, and live training sessions',
    icon: <Calendar className="w-4 h-4" />,
  },
  {
    title: 'Certification',
    href: '/certification',
    description: 'Professional credentials for practitioners',
    icon: <Award className="w-4 h-4" />,
  },
];
