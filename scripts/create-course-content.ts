/**
 * Script to create course modules and lessons in Supabase
 * Run with: npx tsx scripts/create-course-content.ts
 */

import { createScriptAdminClient } from './lib/supabase-admin';

const supabase = createScriptAdminClient();

async function createEnergyManagementCourse() {
  console.log('Creating Energy Management Fundamentals course content...');

  // Get course ID
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'energy-management-fundamentals')
    .single();

  if (!course) {
    console.error('Course not found');
    return;
  }

  const courseId = course.id;

  // Module 1: Understanding Your Energy System
  const { data: module1 } = await supabase
    .from('course_modules')
    .insert({
      course_id: courseId,
      title: 'Understanding Your Energy System',
      description: 'Learn the foundations of energy management and how your unique nervous system works',
      order_index: 1,
    })
    .select()
    .single();

  if (module1) {
    // Lessons for Module 1
    await supabase.from('course_lessons').insert([
      {
        module_id: module1.id,
        title: 'Welcome to Energy Management',
        content_type: 'video',
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content_text: '<h2>Welcome to Energy Management Fundamentals</h2><p>This course will transform how you understand and manage your energy. You\'ll learn to identify what drains you, what regenerates you, and how to build sustainable routines that honor your nervous system.</p><p><strong>What you\'ll learn in this module:</strong></p><ul><li>The difference between energy and willpower</li><li>How neurodivergent energy patterns differ</li><li>Your personal energy baseline</li><li>The science of energy regulation</li></ul>',
        duration_minutes: 8,
        order_index: 1,
        is_preview: true,
      },
      {
        module_id: module1.id,
        title: 'The Science of Energy Regulation',
        content_type: 'video',
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content_text: '<h2>The Science of Energy Regulation</h2><p>Your energy isn\'t just about sleep or calories. It\'s regulated by your nervous system, neurotransmitters, and stress response patterns.</p><h3>Key Concepts</h3><ul><li><strong>Autonomic Nervous System:</strong> Your body\'s automatic energy regulation system</li><li><strong>Allostatic Load:</strong> The cumulative burden of chronic stress</li><li><strong>Homeostasis vs. Allostasis:</strong> Stability vs. adaptation</li><li><strong>Energy Accounting:</strong> Tracking inputs and outputs</li></ul><h3>Neurotransmitters and Energy</h3><p>Different activities affect different neurotransmitter systems:</p><ul><li><strong>Dopamine:</strong> Motivation and reward (affected by novelty, achievement)</li><li><strong>Serotonin:</strong> Mood stability (affected by sunlight, routine)</li><li><strong>Cortisol:</strong> Stress response (affected by unpredictability, pressure)</li><li><strong>Oxytocin:</strong> Connection and bonding (affected by safe relationships)</li></ul>',
        duration_minutes: 12,
        order_index: 2,
        is_preview: false,
      },
      {
        module_id: module1.id,
        title: 'Identifying Your Energy Baseline',
        content_type: 'text',
        content_text: '<h2>Finding Your Energy Baseline</h2><p>Your energy baseline is your natural capacity when well-rested and unstressed. Understanding it helps you recognize when you\'re depleted and what "normal" feels like for you.</p><h3>Energy Baseline Assessment</h3><p>For one week, rate your energy levels 1-10 at three times per day: morning, midday, evening. Note:</p><ul><li>What you did that day</li><li>How well you slept</li><li>Social interactions</li><li>Stress levels</li><li>Food and hydration</li></ul><h3>Patterns to Look For</h3><ul><li><strong>Time of day patterns:</strong> Are you naturally a morning or evening person?</li><li><strong>Activity impacts:</strong> Which tasks drain you most?</li><li><strong>Social patterns:</strong> Does socializing energize or deplete?</li><li><strong>Recovery times:</strong> How long to bounce back from depleting activities?</li></ul><h3>Your Unique Baseline</h3><p>Remember: Your baseline is NOT the same as someone else\'s. A "good day" for you might be different from others, and that\'s completely valid.</p>',
        duration_minutes: 15,
        order_index: 3,
        is_preview: false,
      },
      {
        module_id: module1.id,
        title: 'Energy vs. Willpower: The Critical Difference',
        content_type: 'video',
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content_text: '<h2>Energy vs. Willpower</h2><p>One of the biggest mistakes in personal development is confusing energy depletion with lack of willpower. Understanding the difference changes everything.</p><h3>Willpower is NOT Energy</h3><p><strong>Willpower:</strong> Your ability to override impulses and do what you planned. This is a LIMITED resource that depletes throughout the day.</p><p><strong>Energy:</strong> Your nervous system\'s capacity to function, process, and respond. This is affected by sleep, stress, sensory input, and neurotransmitter levels.</p><h3>Why This Matters</h3><p>When you\'re out of energy, willpower alone cannot help you. Trying to "push through" when energy-depleted:</p><ul><li>Damages your nervous system</li><li>Increases burnout risk</li><li>Reduces effectiveness</li><li>Creates shame spirals</li></ul><h3>The Solution</h3><p>Instead of asking "Can I force myself to do this?" ask:</p><ul><li>Do I have the energy for this right now?</li><li>What would restore my energy first?</li><li>Is this the right time, or should I wait?</li><li>What support would make this easier?</li></ul>',
        duration_minutes: 10,
        order_index: 4,
        is_preview: false,
      },
    ]);
  }

  // Module 2: Element-Based Energy Patterns
  const { data: module2 } = await supabase
    .from('course_modules')
    .insert({
      course_id: courseId,
      title: 'Your Element and Energy Patterns',
      description: 'Discover how your element mix affects your energy needs and restoration strategies',
      order_index: 2,
    })
    .select()
    .single();

  if (module2) {
    await supabase.from('course_lessons').insert([
      {
        module_id: module2.id,
        title: 'Introduction to the Six Elements',
        content_type: 'video',
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content_text: '<h2>The Six Elemental Energy Types</h2><p>Each element represents a distinct pattern of energy regulation, stimulation needs, and restoration preferences.</p><h3>The Six Elements</h3><p><strong>Electric ⚡:</strong> High-voltage, fast-processing energy. Thrives on novelty and stimulation.</p><p><strong>Fiery 🔥:</strong> Intense, driven, action-oriented. Fueled by achievement and challenge.</p><p><strong>Aquatic 🌊:</strong> Deep, emotionally attuned, connection-seeking. Regenerates through meaningful relationships.</p><p><strong>Earthly 🌱:</strong> Grounded, nurturing, stability-focused. Restores through routine and care.</p><p><strong>Airy 💨:</strong> Mentally agile, conceptually-focused. Energized by ideas and possibilities.</p><p><strong>Metallic 🪙:</strong> Precise, systematic, excellence-driven. Thrives on structure and mastery.</p>',
        duration_minutes: 15,
        order_index: 1,
        is_preview: false,
      },
      {
        module_id: module2.id,
        title: 'Energy Drains by Element',
        content_type: 'text',
        content_text: '<h2>What Drains Each Element</h2><p>Understanding your energy drains is the first step to protecting your energy.</p><h3>Electric Energy Drains</h3><ul><li>Repetitive tasks and monotony</li><li>Slow-moving meetings</li><li>Rigid schedules without flexibility</li><li>Lack of novelty or challenge</li><li>Being told to "slow down"</li></ul><h3>Fiery Energy Drains</h3><ul><li>Lack of progress or forward movement</li><li>Passive, indecisive people</li><li>Unclear goals or expectations</li><li>Forced rest without achievement</li><li>Being told to "calm down"</li></ul><h3>Aquatic Energy Drains</h3><ul><li>Emotional disconnection or superficiality</li><li>Harsh, cold environments</li><li>Lack of emotional safety</li><li>Feeling unseen or unheard</li><li>Conflicts without resolution</li></ul><h3>Earthly Energy Drains</h3><ul><li>Giving without receiving</li><li>Chaos and unpredictability</li><li>Neglecting own needs for others</li><li>Feeling unappreciated</li><li>Violation of boundaries</li></ul><h3>Airy Energy Drains</h3><ul><li>Mindless busywork</li><li>Forced social interaction</li><li>Lack of mental stimulation</li><li>Emotional intensity without processing</li><li>Being rushed through thoughts</li></ul><h3>Metallic Energy Drains</h3><ul><li>Sloppiness and lack of standards</li><li>Uncertainty and ambiguity</li><li>Social obligations without purpose</li><li>Breaking of routines</li><li>Criticism without constructive feedback</li></ul>',
        duration_minutes: 20,
        order_index: 2,
        is_preview: false,
      },
      {
        module_id: module2.id,
        title: 'Regeneration Strategies by Element',
        content_type: 'text',
        content_text: '<h2>How Each Element Regenerates</h2><p>Regeneration isn\'t one-size-fits-all. What restores you depends on your element mix.</p><h3>Electric Regeneration</h3><p><strong>Daily:</strong> 5-min dance break, try something new, quick social check-in, playful activity</p><p><strong>Weekly:</strong> Adventure with friends, new hobby exploration, physical activity with others, spontaneous trip</p><p><strong>Emergency:</strong> Call your most energetic friend, upbeat music + movement, change environment completely</p><h3>Fiery Regeneration</h3><p><strong>Daily:</strong> Workout or physical challenge, clear one task completely, competitive activity, progress tracking</p><p><strong>Weekly:</strong> Challenging project, leadership opportunity, competitive sport, tangible achievement</p><p><strong>Emergency:</strong> Intense physical activity, tackle one urgent problem, set and hit a short-term goal</p><h3>Aquatic Regeneration</h3><p><strong>Daily:</strong> Deep conversation, emotional processing, creative expression, connection ritual</p><p><strong>Weekly:</strong> Quality time with close friends, therapy or coaching, artistic creation, nature immersion</p><p><strong>Emergency:</strong> Cry it out, talk to your person, journal deeply, water-based activity</p><h3>Earthly Regeneration</h3><p><strong>Daily:</strong> Nourishing routine, care for plants/pets, gentle movement, prepare food with intention</p><p><strong>Weekly:</strong> Nature time, massage or bodywork, deep rest, organize physical space</p><p><strong>Emergency:</strong> Return to simplest routines, physical grounding, ask for help, radical rest</p><h3>Airy Regeneration</h3><p><strong>Daily:</strong> Solo thinking time, learn something new, creative problem-solving, meditation or breathwork</p><p><strong>Weekly:</strong> Deep reading, philosophical discussion, solo retreat, museum or learning experience</p><p><strong>Emergency:</strong> Complete solitude, mental puzzle, write/journal, stargazing or nature observation</p><h3>Metallic Regeneration</h3><p><strong>Daily:</strong> Maintain routine, organize something, practice a skill, complete checklist</p><p><strong>Weekly:</strong> Deep clean or organize, master new technique, systematic learning, detailed planning</p><p><strong>Emergency:</strong> Return to strictest routine, one perfect task, systems analysis, detailed list-making</p>',
        duration_minutes: 25,
        order_index: 3,
        is_preview: false,
      },
    ]);
  }

  // Module 3: Tracking and Optimizing Energy
  const { data: module3 } = await supabase
    .from('course_modules')
    .insert({
      course_id: courseId,
      title: 'Tracking and Optimizing Your Energy',
      description: 'Practical tools and techniques for monitoring and managing your energy daily',
      order_index: 3,
    })
    .select()
    .single();

  if (module3) {
    await supabase.from('course_lessons').insert([
      {
        module_id: module3.id,
        title: 'The Energy Budget System',
        content_type: 'video',
        content_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content_text: '<h2>Energy Budgeting 101</h2><p>Just like financial budgeting, energy budgeting helps you spend wisely and avoid deficit.</p><h3>Your Daily Energy Budget</h3><p>Think of energy as units you start each day with. Different activities cost different amounts:</p><ul><li><strong>High-cost activities (20-30 units):</strong> Difficult meetings, complex decisions, emotional labor, masking-heavy situations</li><li><strong>Medium-cost (10-20 units):</strong> Regular work tasks, social interaction, planning, multitasking</li><li><strong>Low-cost (5-10 units):</strong> Routine tasks, familiar activities, solo work, simple decisions</li><li><strong>Regeneration (+5 to +15 units):</strong> Element-aligned restoration activities</li></ul><h3>Calculating Your Budget</h3><p>Start with your baseline capacity (typically 100-150 units when well-rested). Track activities for a week to learn their actual costs for YOU.</p><p>Use the Energy Budget Calculator tool to plan your days and track actual vs. expected expenditure.</p>',
        duration_minutes: 12,
        order_index: 1,
        is_preview: false,
      },
      {
        module_id: module3.id,
        title: 'Daily Energy Tracking Template',
        content_type: 'download',
        content_url: '/downloads/energy-tracking-template.pdf',
        content_text: '<h2>Your Energy Tracking Template</h2><p>Download this PDF template to track your energy patterns for 30 days.</p><h3>How to Use This Template</h3><ol><li>Rate your energy level (1-10) three times daily</li><li>Note major activities and their impact</li><li>Track regeneration activities used</li><li>Identify patterns weekly</li></ol><p><strong>What to look for:</strong></p><ul><li>Time of day patterns</li><li>Activity correlations</li><li>Recovery effectiveness</li><li>Unexpected drains or boosts</li></ul>',
        duration_minutes: 5,
        order_index: 2,
        is_preview: false,
      },
      {
        module_id: module3.id,
        title: 'Building Your Personal Energy Profile',
        content_type: 'text',
        content_text: '<h2>Creating Your Energy Profile</h2><p>Based on your tracking, create a comprehensive energy profile document.</p><h3>Your Profile Should Include</h3><p><strong>Section 1: My Energy Baseline</strong></p><ul><li>Average daily capacity</li><li>Best time of day</li><li>Worst time of day</li><li>Recovery time needed</li></ul><p><strong>Section 2: My Top 5 Energy Drains</strong></p><p>List specific activities/situations with their approximate cost</p><p><strong>Section 3: My Top 5 Regeneration Strategies</strong></p><p>List element-aligned activities with their restoration value</p><p><strong>Section 4: My Warning Signs</strong></p><p>Early indicators that you\'re heading toward depletion</p><p><strong>Section 5: My Emergency Protocol</strong></p><p>Step-by-step plan for when you\'ve overextended</p><h3>Using Your Profile</h3><p>Reference this profile when:</p><ul><li>Planning your week</li><li>Deciding whether to commit to something</li><li>Explaining needs to others</li><li>Recovering from overextension</li></ul>',
        duration_minutes: 20,
        order_index: 3,
        is_preview: false,
      },
    ]);
  }

  console.log('✓ Energy Management Fundamentals course created successfully!');
}

async function main() {
  try {
    await createEnergyManagementCourse();
    console.log('Course content creation complete!');
  } catch (error) {
    console.error('Error creating course content:', error);
    process.exit(1);
  }
}

main();
