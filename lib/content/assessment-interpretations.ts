/**
 * NeuroElemental Assessment Interpretation System
 *
 * Provides detailed, personalized interpretations of assessment results including:
 * - Element blend descriptions
 * - Energy management recommendations
 * - Relationship insights
 * - Work style guidance
 * - Shadow work suggestions
 * - Regeneration strategies
 */

import {
  type ElementType,
  type AssessmentResult,
  type ElementPatterns,
  ELEMENT_DEFINITIONS,
} from './assessment-questions';

// ============================================================================
// ELEMENT BLEND DESCRIPTIONS
// ============================================================================

export const BLEND_DESCRIPTIONS: Record<string, {
  name: string;
  description: string;
  strengths: string[];
  challenges: string[];
  famousExamples: string[];
}> = {
  'Dynamic Catalyst': {
    name: 'Dynamic Catalyst',
    description: 'You combine the Electric spark of innovation with the Fiery drive for achievement. You are a force of nature—initiating projects, inspiring others, and pushing boundaries. Your energy is infectious and your ambition is limitless.',
    strengths: [
      'Exceptional at starting new ventures and initiatives',
      'Natural ability to inspire and motivate others',
      'Thrives in fast-paced, high-stakes environments',
      'Quickly adapts to changing circumstances',
    ],
    challenges: [
      'May struggle with follow-through and completion',
      'Risk of burnout from constant high energy output',
      'Can overwhelm others with intensity',
      'May need to develop patience for slower processes',
    ],
    famousExamples: ['Entrepreneurs', 'Startup founders', 'Athletes', 'Performers'],
  },
  'Enthusiastic Connector': {
    name: 'Enthusiastic Connector',
    description: 'Your Electric energy for new experiences combines beautifully with Aquatic emotional depth. You bring excitement and joy to relationships while also valuing genuine connection. You are the life of the party who also has deep one-on-one conversations.',
    strengths: [
      'Makes others feel seen and energized',
      'Builds wide networks while maintaining depth',
      'Brings creativity to emotional expression',
      'Adapts communication style intuitively',
    ],
    challenges: [
      'May spread emotional energy too thin',
      'Can struggle with emotional consistency',
      'Risk of superficiality when overwhelmed',
      'May need to set better boundaries',
    ],
    famousExamples: ['Talk show hosts', 'Counselors', 'Community organizers'],
  },
  'Energetic Nurturer': {
    name: 'Energetic Nurturer',
    description: 'You blend Electric spontaneity with Earthly nurturing. You bring excitement and joy to caring for others, making even mundane activities feel like adventures. Your home is both a sanctuary and a hub of activity.',
    strengths: [
      'Creates exciting, warm environments',
      'Makes caregiving feel fun and engaging',
      'Builds community through shared experiences',
      'Balances stability with spontaneity',
    ],
    challenges: [
      'May overcommit to helping others',
      'Can struggle with routine maintenance tasks',
      'Risk of restlessness in stable situations',
      'May need to find excitement within structure',
    ],
    famousExamples: ['Event planners', 'Family entertainers', 'Teachers'],
  },
  'Creative Explorer': {
    name: 'Creative Explorer',
    description: 'Your Electric love of novelty pairs with Airy analytical depth. You are endlessly curious, always seeking to understand and experiment. Your mind moves quickly between ideas, finding connections others miss.',
    strengths: [
      'Exceptional creative problem-solving',
      'Combines breadth and depth of knowledge',
      'Natural innovator and thought leader',
      'Quickly grasps complex concepts',
    ],
    challenges: [
      'May start many projects without finishing',
      'Can get lost in theoretical exploration',
      'Risk of analysis paralysis despite quick mind',
      'May need to ground ideas in practical action',
    ],
    famousExamples: ['Inventors', 'Researchers', 'Writers', 'Designers'],
  },
  'Innovative Optimizer': {
    name: 'Innovative Optimizer',
    description: 'You combine Electric innovation with Metallic precision. You love creating new systems and then refining them to perfection. Your unique blend makes you exceptional at disrupting industries while maintaining quality.',
    strengths: [
      'Creates innovative yet reliable systems',
      'Balances creativity with attention to detail',
      'Drives efficiency improvements',
      'Combines vision with execution capability',
    ],
    challenges: [
      'May experience internal tension between novelty and order',
      'Can be frustrated by imperfect implementations',
      'Risk of perfectionism slowing innovation',
      'May need to accept "good enough" sometimes',
    ],
    famousExamples: ['Tech founders', 'Process engineers', 'Quality innovators'],
  },
  'Passionate Empath': {
    name: 'Passionate Empath',
    description: 'Your Fiery drive combines with Aquatic emotional intelligence. You feel deeply and act powerfully on behalf of causes and people you care about. Your passion for connection makes you a fierce advocate and loyal friend.',
    strengths: [
      'Powerful advocate for others',
      'Combines emotional insight with action',
      'Creates deep, transformative relationships',
      'Inspires others through authentic passion',
    ],
    challenges: [
      'May take on others\' emotional burdens too intensely',
      'Can burn out from emotional over-investment',
      'Risk of volatility when emotions run high',
      'May need to develop emotional boundaries',
    ],
    famousExamples: ['Activists', 'Therapists', 'Artists', 'Leaders of movements'],
  },
  'Driven Supporter': {
    name: 'Driven Supporter',
    description: 'You blend Fiery ambition with Earthly care for others. You achieve great things while ensuring everyone around you is supported. Your success is measured not just in accomplishments but in the people you\'ve helped along the way.',
    strengths: [
      'Achieves goals while building strong teams',
      'Natural mentor and leader',
      'Creates sustainable success for groups',
      'Balances personal ambition with collective good',
    ],
    challenges: [
      'May neglect self-care while supporting others',
      'Can struggle when goals conflict with relationships',
      'Risk of resentment if support isn\'t reciprocated',
      'May need to assert personal needs more',
    ],
    famousExamples: ['Team leaders', 'Coaches', 'Social entrepreneurs'],
  },
  'Strategic Visionary': {
    name: 'Strategic Visionary',
    description: 'Your Fiery drive pairs with Airy analytical thinking. You see the big picture and have the ambition to make it reality. You are a natural strategist who combines vision with intellectual rigor.',
    strengths: [
      'Exceptional strategic planning abilities',
      'Combines vision with analytical depth',
      'Natural leader in complex situations',
      'Balances ambition with thoughtful approach',
    ],
    challenges: [
      'May struggle with emotional aspects of leadership',
      'Can over-intellectualize decisions',
      'Risk of impatience with slower thinkers',
      'May need to develop empathetic communication',
    ],
    famousExamples: ['CEOs', 'Strategists', 'Political leaders', 'Consultants'],
  },
  'Excellence Achiever': {
    name: 'Excellence Achiever',
    description: 'You combine Fiery ambition with Metallic precision. You don\'t just want to succeed—you want to be the best, and you have the discipline to achieve it. Your standards are high and your execution is flawless.',
    strengths: [
      'Achieves exceptional quality results',
      'Natural perfectionist with drive to match',
      'Sets and meets the highest standards',
      'Combines passion with discipline',
    ],
    challenges: [
      'May be too hard on self and others',
      'Can struggle with "good enough"',
      'Risk of burnout from relentless drive',
      'May need to develop self-compassion',
    ],
    famousExamples: ['Elite athletes', 'Master craftspeople', 'Top executives'],
  },
  'Nurturing Connector': {
    name: 'Nurturing Connector',
    description: 'Your Aquatic emotional depth pairs beautifully with Earthly nurturing. You create safe, loving spaces where people can be their authentic selves. You are the heart of your community and family.',
    strengths: [
      'Creates deeply supportive relationships',
      'Natural healer and comforter',
      'Builds strong, lasting communities',
      'Combines emotional intelligence with practical care',
    ],
    challenges: [
      'May absorb too much of others\' pain',
      'Can neglect own emotional needs',
      'Risk of codependency patterns',
      'May need to establish firmer boundaries',
    ],
    famousExamples: ['Counselors', 'Nurses', 'Community builders', 'Parents'],
  },
  'Intuitive Analyst': {
    name: 'Intuitive Analyst',
    description: 'You blend Aquatic intuition with Airy analytical thinking. You understand both the logical and emotional dimensions of any situation. Your insights come from both heart and head, making you exceptionally perceptive.',
    strengths: [
      'Combines emotional and logical intelligence',
      'Exceptional at understanding complex situations',
      'Natural counselor and advisor',
      'Sees patterns others miss',
    ],
    challenges: [
      'May overthink emotional situations',
      'Can struggle to act on insights',
      'Risk of detachment from own feelings',
      'May need to trust intuition more',
    ],
    famousExamples: ['Psychologists', 'Writers', 'Researchers', 'Advisors'],
  },
  'Precise Empath': {
    name: 'Precise Empath',
    description: 'Your Aquatic emotional sensitivity pairs with Metallic precision. You notice the subtle details of how people feel and respond with exactly the right support. Your care is both deeply felt and carefully considered.',
    strengths: [
      'Provides precisely calibrated emotional support',
      'Notices subtle emotional cues',
      'Creates reliable, consistent relationships',
      'Combines empathy with practical help',
    ],
    challenges: [
      'May struggle with emotional messiness',
      'Can be perceived as too controlled emotionally',
      'Risk of suppressing own feelings',
      'May need to allow more spontaneity in relationships',
    ],
    famousExamples: ['Therapists', 'Healthcare providers', 'Quality caregivers'],
  },
  'Thoughtful Caretaker': {
    name: 'Thoughtful Caretaker',
    description: 'You combine Earthly nurturing with Airy thoughtfulness. You care for others in considered, intentional ways. Your support is backed by understanding and your presence is both warm and wise.',
    strengths: [
      'Provides wise, considered care',
      'Creates thoughtful, nurturing environments',
      'Natural advisor and mentor',
      'Combines warmth with wisdom',
    ],
    challenges: [
      'May over-think caregiving decisions',
      'Can struggle with urgent emotional needs',
      'Risk of appearing detached when thinking',
      'May need to be more spontaneously warm',
    ],
    famousExamples: ['Teachers', 'Counselors', 'Wise elders', 'Authors'],
  },
  'Reliable Perfectionist': {
    name: 'Reliable Perfectionist',
    description: 'Your Earthly stability pairs with Metallic precision. You are the person everyone counts on to get things right. Your work is impeccable and your reliability is legendary.',
    strengths: [
      'Exceptional reliability and consistency',
      'Produces high-quality, thoughtful work',
      'Creates stable, well-organized environments',
      'Natural project manager and executor',
    ],
    challenges: [
      'May struggle with change and spontaneity',
      'Can be inflexible in approach',
      'Risk of over-working to meet high standards',
      'May need to embrace imperfection',
    ],
    famousExamples: ['Accountants', 'Project managers', 'Administrators', 'Craftspeople'],
  },
  'Analytical Systematizer': {
    name: 'Analytical Systematizer',
    description: 'You blend Airy analysis with Metallic structure. You understand complex systems and can organize them elegantly. Your mind sees both the big picture and the precise details that make it work.',
    strengths: [
      'Exceptional systems thinking',
      'Creates elegant, efficient structures',
      'Natural architect of processes and ideas',
      'Combines vision with precise execution',
    ],
    challenges: [
      'May struggle with emotional aspects of work',
      'Can over-engineer simple situations',
      'Risk of analysis paralysis',
      'May need to develop interpersonal warmth',
    ],
    famousExamples: ['Engineers', 'Architects', 'Scientists', 'System designers'],
  },
};

// ============================================================================
// ENERGY STYLE INTERPRETATIONS
// ============================================================================

export const ENERGY_STYLE_DESCRIPTIONS: Record<ElementPatterns['energyStyle'], {
  title: string;
  description: string;
  dailyRhythm: string;
  optimalEnvironment: string;
  warnings: string[];
}> = {
  'high-stimulation': {
    title: 'High-Stimulation Seeker',
    description: 'You thrive on activity, novelty, and engagement. Your ideal day includes variety, social interaction, and new challenges. Quiet or slow environments may feel stifling to you.',
    dailyRhythm: 'Multiple activities, social time, and variety throughout the day. You may work best in bursts with frequent changes in task or environment.',
    optimalEnvironment: 'Open, dynamic spaces with opportunity for movement and interaction. Background energy helps you focus.',
    warnings: [
      'Watch for overscheduling that leads to exhaustion',
      'Build in recovery time even when you don\'t feel you need it',
      'Be mindful of how your energy affects lower-stimulation types',
    ],
  },
  'moderate-stimulation': {
    title: 'Balanced Energy Navigator',
    description: 'You can adapt to various energy environments, though you may have preferences. You can enjoy both active and quiet times, but prolonged extremes in either direction can be draining.',
    dailyRhythm: 'A mix of focused work, social time, and quiet reflection works best. You benefit from variety without constant change.',
    optimalEnvironment: 'Flexible spaces that can shift between collaborative and focused modes. You appreciate having options.',
    warnings: [
      'Don\'t overcommit to high-energy people or environments',
      'Protect your quiet time even when others want your company',
      'Notice when you\'re adapting too much to others\' energy needs',
    ],
  },
  'low-stimulation': {
    title: 'Deep Focus Navigator',
    description: 'You regenerate through quiet, low-stimulation environments. You prefer depth over breadth and quality over quantity in both activities and relationships.',
    dailyRhythm: 'Extended periods of focused work with planned social time. You do best with predictability and control over your environment.',
    optimalEnvironment: 'Quiet, controlled spaces with minimal interruption. You may need noise-canceling headphones or a private workspace.',
    warnings: [
      'Don\'t isolate yourself completely—some connection is needed',
      'Watch for avoidance patterns disguised as "recharging"',
      'Be careful not to see high-energy types as inherently exhausting',
    ],
  },
  'variable': {
    title: 'Adaptive Energy Shifter',
    description: 'Your energy needs vary significantly based on context, mood, and life circumstances. You may feel like a different person in high-energy versus low-energy modes.',
    dailyRhythm: 'Highly context-dependent. You may need to check in with yourself frequently to understand your current energy state.',
    optimalEnvironment: 'Flexible environments that can accommodate both your high-energy and low-energy modes.',
    warnings: [
      'Track your energy patterns to understand your rhythms',
      'Communicate your current state to others',
      'Don\'t commit to one energy style when in the opposite mode',
    ],
  },
};

// ============================================================================
// RELATIONSHIP INSIGHTS
// ============================================================================

export const RELATIONSHIP_ORIENTATION_INSIGHTS: Record<ElementPatterns['relationshipOrientation'], {
  title: string;
  description: string;
  inRelationships: string;
  idealPartner: string;
  growthEdge: string;
}> = {
  'connection-seeking': {
    title: 'Heart-Centered Connector',
    description: 'Relationships are central to your sense of meaning and fulfillment. You naturally prioritize connection and may feel incomplete without close bonds.',
    inRelationships: 'You are deeply invested, loyal, and attentive to your partner\'s emotional needs. You may struggle when relationships feel distant or superficial.',
    idealPartner: 'Someone who values depth and is willing to invest in emotional intimacy. You need a partner who is present and emotionally available.',
    growthEdge: 'Learning to maintain your sense of self while deeply connected. Developing tolerance for emotional distance without anxiety.',
  },
  'achievement-seeking': {
    title: 'Goal-Driven Partner',
    description: 'You approach relationships with the same drive you bring to other areas of life. You want partnerships that support mutual growth and achievement.',
    inRelationships: 'You are ambitious for the relationship itself—wanting it to grow and thrive. You may struggle with complacency or stagnation.',
    idealPartner: 'Someone who has their own ambitions and supports yours. You need a partner who is growing alongside you.',
    growthEdge: 'Learning to value being over doing in relationships. Developing appreciation for moments of rest and contentment.',
  },
  'understanding-seeking': {
    title: 'Thoughtful Observer',
    description: 'You seek to understand your relationships deeply. You may analyze dynamics and patterns, wanting to comprehend the why behind connections.',
    inRelationships: 'You bring thoughtfulness and insight. You may struggle with the irrational aspects of emotion and connection.',
    idealPartner: 'Someone who appreciates your depth of thought and gives you space to process. You need a partner who doesn\'t demand constant emotional expression.',
    growthEdge: 'Learning to feel and express without always understanding. Developing comfort with emotional spontaneity.',
  },
  'balanced': {
    title: 'Adaptive Partner',
    description: 'You don\'t have one dominant relationship orientation, which gives you flexibility but may also create uncertainty about what you need.',
    inRelationships: 'You can adapt to different partner styles but may struggle to advocate for your own needs clearly.',
    idealPartner: 'Someone who helps you understand your own needs and supports you in expressing them.',
    growthEdge: 'Developing clarity about your core relationship needs. Learning to assert these needs consistently.',
  },
};

// ============================================================================
// WORK STYLE GUIDANCE
// ============================================================================

export const WORK_STYLE_INSIGHTS: Record<ElementPatterns['workStyle'], {
  title: string;
  description: string;
  optimalRole: string;
  teamDynamics: string;
  productivityTips: string[];
}> = {
  dynamic: {
    title: 'Dynamic Mover',
    description: 'You thrive in fast-paced environments with variety and change. Routine work quickly becomes draining.',
    optimalRole: 'Roles involving project variety, new challenges, and quick decision-making. You excel in startup environments or change-oriented positions.',
    teamDynamics: 'You energize teams with your enthusiasm but may need partners who handle follow-through and detail work.',
    productivityTips: [
      'Use time-boxing to create artificial variety',
      'Have multiple projects to switch between',
      'Build in movement breaks throughout the day',
      'Partner with detail-oriented colleagues for completion',
    ],
  },
  structured: {
    title: 'Systematic Builder',
    description: 'You excel with clear processes, defined expectations, and systematic approaches. Ambiguity and chaos are draining.',
    optimalRole: 'Roles with clear metrics, established processes, and opportunities for mastery. You excel in quality-focused or technical positions.',
    teamDynamics: 'You bring reliability and attention to detail. You may need support in fast-changing or ambiguous situations.',
    productivityTips: [
      'Create clear systems and checklists',
      'Define success metrics for every project',
      'Build buffers for unexpected changes',
      'Document processes for consistency',
    ],
  },
  collaborative: {
    title: 'Team Harmonizer',
    description: 'You work best in connection with others. Solo work can feel isolating and draining without regular interaction.',
    optimalRole: 'Roles involving teamwork, customer interaction, or relationship management. You excel in supportive or coordinating positions.',
    teamDynamics: 'You are the glue that holds teams together. You may need protection from taking on too much of others\' work.',
    productivityTips: [
      'Schedule regular collaboration time',
      'Use co-working or accountability partners',
      'Take breaks that involve connection',
      'Balance helping others with your own work',
    ],
  },
  independent: {
    title: 'Autonomous Expert',
    description: 'You work best with autonomy and space to focus. Constant collaboration or oversight can be draining.',
    optimalRole: 'Roles with independence, expertise recognition, and minimal meetings. You excel in research, specialist, or remote positions.',
    teamDynamics: 'You contribute expertise and deep work. You may need support in highly collaborative or political environments.',
    productivityTips: [
      'Protect focused work time fiercely',
      'Batch meetings and communications',
      'Create physical or temporal separation for deep work',
      'Schedule minimal but high-quality collaboration',
    ],
  },
};

// ============================================================================
// SHADOW WORK INTERPRETATIONS
// ============================================================================

export const SHADOW_ELEMENT_INTERPRETATIONS: Record<ElementType, {
  shadowDescription: string;
  manifestations: string[];
  integrationPath: string;
  affirmation: string;
}> = {
  electric: {
    shadowDescription: 'When Electric is in shadow, you may fear change, avoid novelty, or feel trapped by your own need for stability. You might judge spontaneity in yourself or others.',
    manifestations: [
      'Rigid adherence to routine out of fear',
      'Judging spontaneous or "flighty" behavior',
      'Feeling trapped but unable to make changes',
      'Denying your need for variety and stimulation',
    ],
    integrationPath: 'Start small with controlled novelty. Give yourself permission to change your mind. Recognize that stability can include variety.',
    affirmation: 'I embrace healthy change and growth. My need for novelty is valid and life-giving.',
  },
  fiery: {
    shadowDescription: 'When Fiery is in shadow, you may suppress ambition, avoid competition, or feel guilty about wanting recognition. You might resent others\' success.',
    manifestations: [
      'Downplaying your achievements',
      'Passive-aggressive competition',
      'Feeling bitter about others\' recognition',
      'Hiding your ambitions from yourself and others',
    ],
    integrationPath: 'Acknowledge your desires for success and recognition. Practice celebrating your wins. Reframe competition as motivation.',
    affirmation: 'My ambition is a gift. I deserve recognition for my contributions.',
  },
  aquatic: {
    shadowDescription: 'When Aquatic is in shadow, you may avoid emotional depth, dismiss feelings as weakness, or struggle with genuine intimacy.',
    manifestations: [
      'Intellectualizing emotions',
      'Keeping relationships superficial',
      'Judging emotional expression as "too much"',
      'Feeling lonely despite social connections',
    ],
    integrationPath: 'Practice naming and accepting feelings. Allow yourself to be vulnerable in safe relationships. Recognize emotion as information.',
    affirmation: 'My emotions are valid and valuable. Deep connection enriches my life.',
  },
  earthly: {
    shadowDescription: 'When Earthly is in shadow, you may neglect self-care while caring for others, resent those you help, or feel unworthy of receiving support.',
    manifestations: [
      'Martyrdom and resentment',
      'Inability to receive help',
      'Over-functioning for others',
      'Feeling taken for granted',
    ],
    integrationPath: 'Practice receiving without giving back immediately. Set boundaries on your caregiving. Recognize your own needs as valid.',
    affirmation: 'I am worthy of care. My needs matter as much as others\' needs.',
  },
  airy: {
    shadowDescription: 'When Airy is in shadow, you may act impulsively without thinking, dismiss intellectual pursuits, or feel anxious without constant stimulation.',
    manifestations: [
      'Acting without reflection',
      'Anti-intellectual attitudes',
      'Avoiding quiet or introspection',
      'Fear of being alone with your thoughts',
    ],
    integrationPath: 'Build small moments of reflection into your day. Trust your ability to think things through. Recognize the value of understanding.',
    affirmation: 'My thoughts and analysis are valuable. Taking time to reflect serves me.',
  },
  metallic: {
    shadowDescription: 'When Metallic is in shadow, you may embrace chaos, reject all structure, or feel paralyzed by perfectionism that you deny having.',
    manifestations: [
      'Reactive rejection of any system or rule',
      'Chronic disorganization despite suffering from it',
      'Hidden perfectionism causing procrastination',
      'Criticizing others\' organization while being chaotic',
    ],
    integrationPath: 'Experiment with small structures that serve you. Recognize that some order reduces anxiety. Separate perfectionism from healthy standards.',
    affirmation: 'Structure serves my freedom. I can create order that supports my life.',
  },
};

// ============================================================================
// COMPREHENSIVE INTERPRETATION GENERATOR
// ============================================================================

export interface ComprehensiveInterpretation {
  overview: string;
  blendAnalysis: typeof BLEND_DESCRIPTIONS[string];
  energyInsights: typeof ENERGY_STYLE_DESCRIPTIONS[ElementPatterns['energyStyle']];
  relationshipInsights: typeof RELATIONSHIP_ORIENTATION_INSIGHTS[ElementPatterns['relationshipOrientation']];
  workInsights: typeof WORK_STYLE_INSIGHTS[ElementPatterns['workStyle']];
  shadowWork: {
    primaryShadows: Array<typeof SHADOW_ELEMENT_INTERPRETATIONS[ElementType]>;
    growthAreas: ElementType[];
  };
  dailyRecommendations: string[];
  weeklyRecommendations: string[];
}

/**
 * Generate a comprehensive interpretation from assessment results
 */
export function generateInterpretation(result: AssessmentResult): ComprehensiveInterpretation {
  const { patterns, shadowIndicators, topElements } = result;

  // Get blend analysis
  const blendAnalysis = BLEND_DESCRIPTIONS[patterns.blendType] || {
    name: patterns.blendType,
    description: `Your unique blend of ${ELEMENT_DEFINITIONS[topElements[0]].name} and ${ELEMENT_DEFINITIONS[topElements[1]].name} creates a distinctive energy profile.`,
    strengths: [
      `${ELEMENT_DEFINITIONS[topElements[0]].name} ${ELEMENT_DEFINITIONS[topElements[0]].distinguishingTraits[0]}`,
      `${ELEMENT_DEFINITIONS[topElements[1]].name} ${ELEMENT_DEFINITIONS[topElements[1]].distinguishingTraits[0]}`,
    ],
    challenges: [
      'Balancing potentially competing needs',
      'Finding environments that honor both elements',
    ],
    famousExamples: [],
  };

  // Get energy insights
  const energyInsights = ENERGY_STYLE_DESCRIPTIONS[patterns.energyStyle];

  // Get relationship insights
  const relationshipInsights = RELATIONSHIP_ORIENTATION_INSIGHTS[patterns.relationshipOrientation];

  // Get work insights
  const workInsights = WORK_STYLE_INSIGHTS[patterns.workStyle];

  // Get shadow work
  const primaryShadows = shadowIndicators.potentialShadows.map(
    element => SHADOW_ELEMENT_INTERPRETATIONS[element]
  );

  // Generate daily recommendations
  const dailyRecommendations = generateDailyRecommendations(result);

  // Generate weekly recommendations
  const weeklyRecommendations = generateWeeklyRecommendations(result);

  // Generate overview
  const overview = generateOverview(result, blendAnalysis);

  return {
    overview,
    blendAnalysis,
    energyInsights,
    relationshipInsights,
    workInsights,
    shadowWork: {
      primaryShadows,
      growthAreas: shadowIndicators.growthAreas,
    },
    dailyRecommendations,
    weeklyRecommendations,
  };
}

function generateOverview(result: AssessmentResult, blend: typeof BLEND_DESCRIPTIONS[string]): string {
  const { topElements, energyType, scores } = result;
  const primary = ELEMENT_DEFINITIONS[topElements[0]];
  const secondary = ELEMENT_DEFINITIONS[topElements[1]];

  const strengthPercentage = scores[topElements[0]].percentage;

  let overviewIntro: string;
  if (strengthPercentage > 80) {
    overviewIntro = `You have a strongly defined ${primary.name} nature`;
  } else if (strengthPercentage > 60) {
    overviewIntro = `You lead with ${primary.name} energy`;
  } else {
    overviewIntro = `You have a balanced profile with ${primary.name} as your primary element`;
  }

  return `${overviewIntro}, complemented by ${secondary.name} as your secondary element. This makes you a "${blend.name}"—${blend.description.split('.')[0].toLowerCase()}. As an ${energyType.toLowerCase()} type, ${energyType === 'Extroverted' ? 'you gain energy from external stimulation and interaction' : energyType === 'Introverted' ? 'you regenerate through solitude and low-stimulation environments' : 'you balance between internal and external energy sources'}.`;
}

function generateDailyRecommendations(result: AssessmentResult): string[] {
  const { topElements, patterns } = result;
  const recommendations: string[] = [];

  // Based on top element
  const primary = topElements[0];
  switch (primary) {
    case 'electric':
      recommendations.push('Start your day with something novel—a new route, podcast, or breakfast');
      recommendations.push('Build in movement breaks every 90 minutes');
      break;
    case 'fiery':
      recommendations.push('Begin with your most important task when energy is highest');
      recommendations.push('Track and celebrate daily wins, no matter how small');
      break;
    case 'aquatic':
      recommendations.push('Connect with someone you care about early in the day');
      recommendations.push('Process your emotions through journaling or conversation');
      break;
    case 'earthly':
      recommendations.push('Create a calming morning routine you look forward to');
      recommendations.push('Do something nurturing for yourself or someone else');
      break;
    case 'airy':
      recommendations.push('Protect quiet morning time for thinking and reflection');
      recommendations.push('Schedule your most analytical work when distractions are low');
      break;
    case 'metallic':
      recommendations.push('Review your priorities and plan your day systematically');
      recommendations.push('Complete at least one task to high standard for satisfaction');
      break;
  }

  // Based on energy style
  if (patterns.energyStyle === 'high-stimulation') {
    recommendations.push('Plan for variety—don\'t schedule back-to-back similar tasks');
  } else if (patterns.energyStyle === 'low-stimulation') {
    recommendations.push('Build in buffer time between commitments');
  }

  // Universal
  recommendations.push('Honor your energy rhythms—work with them, not against them');

  return recommendations;
}

function generateWeeklyRecommendations(result: AssessmentResult): string[] {
  const { topElements, patterns, shadowIndicators } = result;
  const recommendations: string[] = [];

  // Based on secondary element
  const secondary = topElements[1];
  recommendations.push(`Nurture your ${ELEMENT_DEFINITIONS[secondary].name} side with activities that speak to ${ELEMENT_DEFINITIONS[secondary].coreMotivation.toLowerCase()}`);

  // Based on growth areas
  if (shadowIndicators.growthAreas.length > 0) {
    const growthElement = shadowIndicators.growthAreas[0];
    recommendations.push(`Growth edge: Experiment with ${ELEMENT_DEFINITIONS[growthElement].name} activities—${ELEMENT_DEFINITIONS[growthElement].shortDescription.toLowerCase()}`);
  }

  // Based on work style
  if (patterns.workStyle === 'dynamic') {
    recommendations.push('Schedule a completion day to finish lingering projects');
  } else if (patterns.workStyle === 'structured') {
    recommendations.push('Allow one unstructured block for spontaneous activities');
  } else if (patterns.workStyle === 'collaborative') {
    recommendations.push('Schedule focused solo time to recharge your giving');
  } else {
    recommendations.push('Plan at least one meaningful collaborative experience');
  }

  // Based on burnout risk
  if (shadowIndicators.burnoutRisk === 'high') {
    recommendations.push('IMPORTANT: Your profile shows risk of over-reliance on one mode. Build in diverse activities.');
  }

  // Universal
  recommendations.push('Review your week: What energized you? What drained you? Adjust accordingly.');

  return recommendations;
}
