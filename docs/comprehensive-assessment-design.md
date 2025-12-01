# NeuroElemental Comprehensive Assessment System v2.0

## Overview

A psychometrically-sound assessment measuring six elemental energy types with:
- **36 questions** (6 per element) for improved reliability
- **Reverse-scored validity questions** to detect inconsistent responding
- **Confidence intervals** for each element score
- **Pattern analysis** including blend types, energy styles, and shadow indicators
- **Comprehensive interpretation system** with personalized recommendations

---

## Assessment Structure

### 6 Sections (6 questions each)

| Section | ID | Focus Area |
|---------|----|----|
| 1 | `motivations` | Core Motivations & Drives |
| 2 | `energy-drains` | Energy Drains |
| 3 | `energy-sources` | Energy Sources |
| 4 | `social-style` | Social Style & Relationships |
| 5 | `cognitive-style` | Thinking & Working Style |
| 6 | `values-identity` | Core Values & Identity |

### 6 Elements

| Element | Energy Type | Core Drive | Key Distinction |
|---------|-------------|------------|-----------------|
| **Electric** ⚡ | Extroverted | Novelty, freedom, variety | Seeks stimulation/change |
| **Fiery** 🔥 | Extroverted | Achievement, impact, recognition | Seeks accomplishment/legacy |
| **Aquatic** 🌊 | Ambiverted | Emotional depth, intimacy | Seeks connection/vulnerability |
| **Earthly** 🌱 | Ambiverted | Harmony, comfort, nurturing | Seeks stability/helping others |
| **Airy** 💨 | Introverted | Understanding, analysis | Seeks knowledge/clarity |
| **Metallic** 🪙 | Introverted | Structure, precision, mastery | Seeks order/competence |

---

## Rating Scale

```
1 = Almost Never True    - "This rarely or never describes me"
2 = Rarely True          - "This occasionally applies, but not often"
3 = Sometimes True       - "This applies about half the time"
4 = Often True           - "This usually describes me well"
5 = Almost Always True   - "This consistently and accurately describes me"
```

---

## Questions by Section

### Section 1: Core Motivations & Drives

| Q# | Element | Question |
|----|---------|----------|
| 1 | Electric | I am driven by the pursuit of new experiences, adventures, and dynamic change. |
| 2 | Fiery | I am most motivated when pursuing challenging goals that allow for growth and recognition. |
| 3 | Aquatic | I feel a deep need for emotional intimacy and vulnerability in my closest relationships. |
| 4 | Earthly | I am motivated to create harmony, comfort, and a sense of community for those around me. |
| 5 | Airy | I am driven by curiosity and the need to deeply understand how things work. |
| 6 | Metallic | I feel most motivated when I can apply precision and structure to achieve excellent results. |

### Section 2: Energy Drains

| Q# | Element | Question |
|----|---------|----------|
| 7 | Electric | I feel trapped and drained by monotony, rigid schedules, and long periods of inactivity. |
| 8 | Fiery | My energy depletes when I feel unproductive, stagnant, or when my efforts go unrecognized. |
| 9 | Aquatic | Superficial conversations and emotionally disconnected interactions leave me feeling empty. |
| 10 | Earthly | Conflict, disharmony, and chaotic environments are deeply draining to me. |
| 11 | Airy | I feel overwhelmed by constant social demands, noise, and pressure to respond quickly. |
| 12 | Metallic | Disorder, unpredictability, and unclear expectations drain my energy significantly. |

### Section 3: Energy Sources

| Q# | Element | Question |
|----|---------|----------|
| 13 | Electric | I recharge through spontaneous activities, trying new things, and being around energetic people. |
| 14 | Fiery | I feel energized when making progress on important goals and receiving acknowledgment for my work. |
| 15 | Aquatic | Deep, meaningful conversations with people I trust recharge me more than anything else. |
| 16 | Earthly | I regenerate by nurturing others, creating cozy environments, and maintaining peaceful routines. |
| 17 | Airy | Quiet time alone to think, learn, and process information is essential for my energy. |
| 18 | Metallic | I recharge through organizing, completing tasks to a high standard, and following reliable routines. |

### Section 4: Social Style & Relationships

| Q# | Element | Question |
|----|---------|----------|
| 19 | Electric | I thrive in high-energy social settings with movement, humor, and lighthearted interaction. |
| 20 | Fiery | I enjoy situations where I can share my passions, debate ideas, and potentially influence others. |
| 21 | Aquatic | I prefer intimate gatherings with close friends over large parties with acquaintances. |
| 22 | Earthly | I find joy in hosting, creating welcoming spaces, and ensuring everyone feels included. |
| 23 | Airy | I prefer one-on-one conversations or small groups where I can really listen and think. |
| 24 | Metallic | I prefer social interactions with clear purpose over casual small talk. |

### Section 5: Thinking & Working Style

| Q# | Element | Question |
|----|---------|----------|
| 25 | Electric | I prefer jumping between tasks and ideas rather than following a rigid step-by-step process. |
| 26 | Fiery | I am highly focused on efficiency and results, motivated by competition and ambitious targets. |
| 27 | Aquatic | I make decisions primarily based on how they will affect people and relationships. |
| 28 | Earthly | I work best at a steady pace, prioritizing team harmony and making sure everyone is supported. |
| 29 | Airy | I need significant time to analyze and process before I feel ready to make important decisions. |
| 30 | Metallic | I thrive with clear procedures, defined standards, and environments where quality is valued. |

### Section 6: Core Values & Identity

| Q# | Element | Question |
|----|---------|----------|
| 31 | Electric | Freedom and flexibility are essential to me—I resist anything that feels confining or overly serious. |
| 32 | Fiery | Making a significant impact and being recognized for excellence is deeply important to me. |
| 33 | Aquatic | Loyalty and deep emotional bonds matter more to me than almost anything else. |
| 34 | Earthly | I naturally prioritize the well-being and comfort of others, often before my own needs. |
| 35 | Airy | I value knowledge and understanding—I constantly ask "why" to get to the root of things. |
| 36 | Metallic | I believe strongly in keeping commitments, maintaining standards, and doing things properly. |

---

## Validity Questions (Reverse-Scored)

These questions check for consistency and are reverse-scored:

| Q# | Element | Question |
|----|---------|----------|
| 101 | Electric | I prefer sticking to familiar routines rather than seeking new experiences. |
| 102 | Fiery | I am comfortable letting others take the lead and receive recognition. |
| 103 | Aquatic | I prefer keeping conversations light and avoiding deep emotional topics. |
| 104 | Earthly | I am comfortable with conflict and don't mind when there's tension in a group. |
| 105 | Airy | I prefer making quick decisions without too much analysis or overthinking. |
| 106 | Metallic | I am comfortable with ambiguity and don't need things to be perfectly organized. |

---

## Scoring System

### Raw Score Calculation
- 6 questions per element × 5 max points = **30 max points per element**
- Reverse-scored questions: `adjusted = 6 - raw_answer`

### Percentage Conversion
```typescript
percentage = Math.round((rawScore / 30) * 100);
```

### Confidence Levels
- **High**: Consistency > 0.7 AND (percentage > 70 OR percentage < 30)
- **Medium**: Consistency > 0.5
- **Low**: Consistency ≤ 0.5

### Validity Indicators
- **Completion Rate**: Questions answered / 36
- **Straight-Lining Score**: Max same answer / total answers (detect same response patterns)
- **Extreme Response Bias**: (Count of 1s + 5s) / total answers
- **Response Consistency**: Agreement between main questions and reverse-scored validity questions
- **Social Desirability Index**: Average score > 4 indicates possible inflation

---

## Result Types

### ElementScore
```typescript
interface ElementScore {
  raw: number;           // 0-30
  percentage: number;    // 0-100
  confidence: 'high' | 'medium' | 'low';
  consistency: number;   // 0-1
}
```

### AssessmentResult
```typescript
interface AssessmentResult {
  scores: Record<ElementType, ElementScore>;
  topElements: ElementType[];      // Top 3 by percentage
  energyType: EnergyType;          // Extroverted | Ambiverted | Introverted
  validity: ValidityIndicators;
  patterns: ElementPatterns;
  shadowIndicators: ShadowIndicators;
}
```

### ElementPatterns
```typescript
interface ElementPatterns {
  blendType: string;               // e.g., "Dynamic Catalyst"
  energyStyle: 'high-stimulation' | 'moderate-stimulation' | 'low-stimulation' | 'variable';
  relationshipOrientation: 'connection-seeking' | 'achievement-seeking' | 'understanding-seeking' | 'balanced';
  workStyle: 'dynamic' | 'structured' | 'collaborative' | 'independent';
}
```

---

## Blend Types (15 combinations)

| Top 2 Elements | Blend Name |
|----------------|------------|
| Electric + Fiery | Dynamic Catalyst |
| Electric + Aquatic | Enthusiastic Connector |
| Electric + Earthly | Energetic Nurturer |
| Electric + Airy | Creative Explorer |
| Electric + Metallic | Innovative Optimizer |
| Fiery + Aquatic | Passionate Empath |
| Fiery + Earthly | Driven Supporter |
| Fiery + Airy | Strategic Visionary |
| Fiery + Metallic | Excellence Achiever |
| Aquatic + Earthly | Nurturing Connector |
| Aquatic + Airy | Intuitive Analyst |
| Aquatic + Metallic | Precise Empath |
| Earthly + Airy | Thoughtful Caretaker |
| Earthly + Metallic | Reliable Perfectionist |
| Airy + Metallic | Analytical Systematizer |

---

## Files Structure

```
lib/content/
├── assessment-questions.ts        # Questions, scoring, validation
├── assessment-questions.test.ts   # Unit tests (37 tests)
└── assessment-interpretations.ts  # Interpretation system

app/
├── assessment/page.tsx            # Assessment UI (uses centralized module)
└── api/assessment/submit/route.ts # Scoring API (uses centralized module)
```

---

## Distinguishing Similar Elements

### Electric vs Fiery (Both Extroverted)
- **Electric**: novelty-seeking, spontaneous, playful, adaptable
- **Fiery**: ambitious, competitive, driven, influential
- Questions differentiate via: "new experiences" vs "challenging goals"

### Aquatic vs Earthly (Both Ambiverted, Relational)
- **Aquatic**: empathetic, intuitive, loyal, emotionally aware
- **Earthly**: nurturing, patient, generous, stabilizing
- Questions differentiate via: "emotional intimacy" vs "harmony/comfort"

### Airy vs Metallic (Both Introverted)
- **Airy**: analytical, curious, observant, thoughtful
- **Metallic**: precise, systematic, reliable, quality-focused
- Questions differentiate via: "understand why" vs "precision/structure"

---

## Test Coverage

**37 tests passing** covering:
- Structure validation (sections, questions, element definitions)
- Scoring functions (raw scores, percentages, confidence)
- Validity indicators (straight-lining, extreme bias, completion)
- Analysis functions (top elements, energy type, patterns, shadows)
- Answer validation
- Integration tests

---

## Backwards Compatibility

The API route supports both:
- **v1.0 (30 questions)**: Original format
- **v2.0 (36 questions)**: New comprehensive format

Detection is automatic based on presence of questions 31-36.
