import { describe, it, expect } from 'vitest';
import {
  ASSESSMENT_SECTIONS,
  VALIDITY_QUESTIONS,
  ELEMENT_DEFINITIONS,
  TOTAL_MAIN_QUESTIONS,
  QUESTIONS_PER_ELEMENT,
  MAX_ELEMENT_SCORE,
  getAllQuestions,
  getQuestionsForElement,
  getAdjustedScore,
  calculateRawScores,
  calculateElementScores,
  calculateValidityIndicators,
  getTopElements,
  getDominantEnergyType,
  analyzePatterns,
  analyzeShadowIndicators,
  calculateAssessmentResult,
  validateAnswers,
  type ElementType,
} from './assessment-questions';

// ============================================================================
// STRUCTURE TESTS
// ============================================================================

describe('Assessment Structure', () => {
  it('should have exactly 6 sections', () => {
    expect(ASSESSMENT_SECTIONS, 'Should have 6 sections').toHaveLength(6);
  });

  it('should have exactly 36 main questions', () => {
    const allQuestions = getAllQuestions(false);
    expect(allQuestions, 'Should have 36 main questions').toHaveLength(TOTAL_MAIN_QUESTIONS);
  });

  it('should have 6 questions per section', () => {
    ASSESSMENT_SECTIONS.forEach(section => {
      expect(
        section.questions,
        `Section "${section.title}" should have 6 questions`
      ).toHaveLength(6);
    });
  });

  it('should have 6 questions per element', () => {
    const elements: ElementType[] = ['electric', 'fiery', 'aquatic', 'earthly', 'airy', 'metallic'];
    elements.forEach(element => {
      const questions = getQuestionsForElement(element);
      expect(
        questions,
        `Element "${element}" should have 6 questions`
      ).toHaveLength(QUESTIONS_PER_ELEMENT);
    });
  });

  it('should have all 6 element definitions', () => {
    const elements: ElementType[] = ['electric', 'fiery', 'aquatic', 'earthly', 'airy', 'metallic'];
    elements.forEach(element => {
      expect(
        ELEMENT_DEFINITIONS[element],
        `Element "${element}" should be defined`
      ).toBeDefined();
      expect(
        ELEMENT_DEFINITIONS[element].name,
        `Element "${element}" should have a name`
      ).toBeTruthy();
      expect(
        ELEMENT_DEFINITIONS[element].energyType,
        `Element "${element}" should have an energyType`
      ).toBeTruthy();
    });
  });

  it('should have unique question IDs', () => {
    const allQuestions = getAllQuestions(true);
    const ids = allQuestions.map(q => q.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids, 'All question IDs should be unique').toHaveLength(uniqueIds.length);
  });

  it('should have sequential main question IDs from 1 to 36', () => {
    const mainQuestions = getAllQuestions(false);
    const ids = mainQuestions.map(q => q.id).sort((a, b) => a - b);
    for (let i = 0; i < 36; i++) {
      expect(ids[i], `Question ID ${i + 1} should exist`).toBe(i + 1);
    }
  });

  it('should have 6 validity questions', () => {
    expect(VALIDITY_QUESTIONS, 'Should have 6 validity questions').toHaveLength(6);
  });

  it('should have validity questions for each element', () => {
    const elements: ElementType[] = ['electric', 'fiery', 'aquatic', 'earthly', 'airy', 'metallic'];
    elements.forEach(element => {
      const validityQ = VALIDITY_QUESTIONS.find(q => q.element === element);
      expect(
        validityQ,
        `Validity question for "${element}" should exist`
      ).toBeDefined();
      expect(
        validityQ?.reversed,
        `Validity question for "${element}" should be reverse-scored`
      ).toBe(true);
    });
  });
});

// ============================================================================
// SCORING TESTS
// ============================================================================

describe('Scoring Functions', () => {
  describe('getAdjustedScore', () => {
    it('should return raw score for non-reversed questions', () => {
      // Question 1 is not reversed
      expect(getAdjustedScore(1, 5)).toBe(5);
      expect(getAdjustedScore(1, 1)).toBe(1);
      expect(getAdjustedScore(1, 3)).toBe(3);
    });

    it('should reverse score for reversed questions', () => {
      // Question 101 is reversed
      expect(getAdjustedScore(101, 5)).toBe(1);
      expect(getAdjustedScore(101, 1)).toBe(5);
      expect(getAdjustedScore(101, 3)).toBe(3);
    });

    it('should return raw score for unknown question IDs', () => {
      expect(getAdjustedScore(999, 4)).toBe(4);
    });
  });

  describe('calculateRawScores', () => {
    it('should return zero scores for empty answers', () => {
      const scores = calculateRawScores({});
      expect(scores.electric).toBe(0);
      expect(scores.fiery).toBe(0);
      expect(scores.aquatic).toBe(0);
      expect(scores.earthly).toBe(0);
      expect(scores.airy).toBe(0);
      expect(scores.metallic).toBe(0);
    });

    it('should correctly sum scores for each element', () => {
      // Electric questions: 1, 7, 13, 19, 25, 31
      const answers: Record<number, number> = {
        1: 5, 7: 5, 13: 5, 19: 5, 25: 5, 31: 5, // All 5s for electric
        2: 1, 8: 1, 14: 1, 20: 1, 26: 1, 32: 1, // All 1s for fiery
      };

      const scores = calculateRawScores(answers);
      expect(scores.electric).toBe(30); // 6 * 5
      expect(scores.fiery).toBe(6); // 6 * 1
    });

    it('should only count main questions (1-36)', () => {
      const answers: Record<number, number> = {
        1: 5,
        101: 5, // Validity question - should not be counted
      };

      const scores = calculateRawScores(answers);
      expect(scores.electric).toBe(5); // Only question 1 counted
    });

    it('should calculate max possible score correctly', () => {
      // All 5s for all questions
      const answers: Record<number, number> = {};
      for (let i = 1; i <= 36; i++) {
        answers[i] = 5;
      }

      const scores = calculateRawScores(answers);
      expect(scores.electric).toBe(MAX_ELEMENT_SCORE);
      expect(scores.fiery).toBe(MAX_ELEMENT_SCORE);
      expect(scores.aquatic).toBe(MAX_ELEMENT_SCORE);
      expect(scores.earthly).toBe(MAX_ELEMENT_SCORE);
      expect(scores.airy).toBe(MAX_ELEMENT_SCORE);
      expect(scores.metallic).toBe(MAX_ELEMENT_SCORE);
    });
  });

  describe('calculateElementScores', () => {
    it('should return percentage scores', () => {
      // All 5s for electric = 30/30 = 100%
      const answers: Record<number, number> = {
        1: 5, 7: 5, 13: 5, 19: 5, 25: 5, 31: 5,
      };

      const scores = calculateElementScores(answers);
      expect(scores.electric.percentage).toBe(100);
      expect(scores.electric.raw).toBe(30);
    });

    it('should calculate confidence levels', () => {
      // High consistency, high score = high confidence
      const highConfidenceAnswers: Record<number, number> = {
        1: 5, 7: 5, 13: 5, 19: 5, 25: 5, 31: 5,
      };

      const highScores = calculateElementScores(highConfidenceAnswers);
      expect(highScores.electric.confidence).toBe('high');

      // Mixed answers = lower confidence
      const mixedAnswers: Record<number, number> = {
        1: 5, 7: 1, 13: 3, 19: 2, 25: 4, 31: 5,
      };

      const mixedScores = calculateElementScores(mixedAnswers);
      expect(mixedScores.electric.confidence).not.toBe('high');
    });
  });
});

// ============================================================================
// VALIDITY TESTS
// ============================================================================

describe('Validity Indicators', () => {
  it('should detect straight-lining', () => {
    // All 3s = straight-lining
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 36; i++) {
      answers[i] = 3;
    }

    const validity = calculateValidityIndicators(answers);
    expect(validity.straightLiningScore).toBeGreaterThan(0.5);
    expect(validity.warnings.length).toBeGreaterThan(0);
  });

  it('should detect extreme response bias', () => {
    // All 5s = extreme response
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 36; i++) {
      answers[i] = 5;
    }

    const validity = calculateValidityIndicators(answers);
    expect(validity.extremeResponseBias).toBeGreaterThan(0.8);
    expect(validity.warnings.length).toBeGreaterThan(0);
  });

  it('should calculate completion rate correctly', () => {
    const partialAnswers: Record<number, number> = {};
    for (let i = 1; i <= 18; i++) {
      partialAnswers[i] = 3;
    }

    const validity = calculateValidityIndicators(partialAnswers);
    expect(validity.completionRate).toBe(0.5);
  });

  it('should mark valid assessments as valid', () => {
    // Varied, complete answers
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 36; i++) {
      answers[i] = (i % 5) + 1; // Varies 1-5
    }

    const validity = calculateValidityIndicators(answers);
    expect(validity.isValid).toBe(true);
  });
});

// ============================================================================
// ANALYSIS TESTS
// ============================================================================

describe('Analysis Functions', () => {
  describe('getTopElements', () => {
    it('should return top 3 elements by default', () => {
      const scores = {
        electric: { raw: 30, percentage: 100, confidence: 'high' as const, consistency: 1 },
        fiery: { raw: 24, percentage: 80, confidence: 'high' as const, consistency: 1 },
        aquatic: { raw: 18, percentage: 60, confidence: 'medium' as const, consistency: 0.8 },
        earthly: { raw: 12, percentage: 40, confidence: 'medium' as const, consistency: 0.7 },
        airy: { raw: 6, percentage: 20, confidence: 'low' as const, consistency: 0.5 },
        metallic: { raw: 3, percentage: 10, confidence: 'low' as const, consistency: 0.3 },
      };

      const top = getTopElements(scores);
      expect(top).toHaveLength(3);
      expect(top[0]).toBe('electric');
      expect(top[1]).toBe('fiery');
      expect(top[2]).toBe('aquatic');
    });

    it('should return requested number of elements', () => {
      const scores = {
        electric: { raw: 30, percentage: 100, confidence: 'high' as const, consistency: 1 },
        fiery: { raw: 24, percentage: 80, confidence: 'high' as const, consistency: 1 },
        aquatic: { raw: 18, percentage: 60, confidence: 'medium' as const, consistency: 0.8 },
        earthly: { raw: 12, percentage: 40, confidence: 'medium' as const, consistency: 0.7 },
        airy: { raw: 6, percentage: 20, confidence: 'low' as const, consistency: 0.5 },
        metallic: { raw: 3, percentage: 10, confidence: 'low' as const, consistency: 0.3 },
      };

      const top2 = getTopElements(scores, 2);
      expect(top2).toHaveLength(2);
    });
  });

  describe('getDominantEnergyType', () => {
    it('should return Extroverted for electric/fiery dominant', () => {
      const energyType = getDominantEnergyType(['electric', 'fiery', 'aquatic']);
      expect(energyType).toBe('Extroverted');
    });

    it('should return Introverted for airy/metallic dominant', () => {
      const energyType = getDominantEnergyType(['airy', 'metallic', 'earthly']);
      expect(energyType).toBe('Introverted');
    });

    it('should return Ambiverted for aquatic/earthly dominant', () => {
      const energyType = getDominantEnergyType(['aquatic', 'earthly', 'airy']);
      expect(energyType).toBe('Ambiverted');
    });
  });

  describe('analyzePatterns', () => {
    it('should identify blend type', () => {
      const scores = {
        electric: { raw: 30, percentage: 100, confidence: 'high' as const, consistency: 1 },
        fiery: { raw: 24, percentage: 80, confidence: 'high' as const, consistency: 1 },
        aquatic: { raw: 18, percentage: 60, confidence: 'medium' as const, consistency: 0.8 },
        earthly: { raw: 12, percentage: 40, confidence: 'medium' as const, consistency: 0.7 },
        airy: { raw: 6, percentage: 20, confidence: 'low' as const, consistency: 0.5 },
        metallic: { raw: 3, percentage: 10, confidence: 'low' as const, consistency: 0.3 },
      };

      const patterns = analyzePatterns(scores, ['electric', 'fiery', 'aquatic']);
      expect(patterns.blendType).toBe('Dynamic Catalyst');
    });

    it('should identify energy style', () => {
      // High electric + fiery = high stimulation
      const highStimScores = {
        electric: { raw: 30, percentage: 100, confidence: 'high' as const, consistency: 1 },
        fiery: { raw: 30, percentage: 100, confidence: 'high' as const, consistency: 1 },
        aquatic: { raw: 6, percentage: 20, confidence: 'low' as const, consistency: 0.5 },
        earthly: { raw: 6, percentage: 20, confidence: 'low' as const, consistency: 0.5 },
        airy: { raw: 6, percentage: 20, confidence: 'low' as const, consistency: 0.5 },
        metallic: { raw: 6, percentage: 20, confidence: 'low' as const, consistency: 0.5 },
      };

      const patterns = analyzePatterns(highStimScores, ['electric', 'fiery', 'aquatic']);
      expect(patterns.energyStyle).toBe('high-stimulation');
    });
  });

  describe('analyzeShadowIndicators', () => {
    it('should identify growth areas from lowest scores', () => {
      const scores = {
        electric: { raw: 30, percentage: 100, confidence: 'high' as const, consistency: 1 },
        fiery: { raw: 24, percentage: 80, confidence: 'high' as const, consistency: 1 },
        aquatic: { raw: 18, percentage: 60, confidence: 'medium' as const, consistency: 0.8 },
        earthly: { raw: 12, percentage: 40, confidence: 'medium' as const, consistency: 0.7 },
        airy: { raw: 6, percentage: 20, confidence: 'low' as const, consistency: 0.5 },
        metallic: { raw: 3, percentage: 10, confidence: 'low' as const, consistency: 0.3 },
      };

      const shadow = analyzeShadowIndicators(scores);
      expect(shadow.growthAreas).toContain('metallic');
      expect(shadow.growthAreas).toContain('airy');
    });

    it('should identify potential shadows', () => {
      // High electric (100%) with very low metallic (10%) = potential shadow
      const scores = {
        electric: { raw: 30, percentage: 100, confidence: 'high' as const, consistency: 1 },
        fiery: { raw: 15, percentage: 50, confidence: 'medium' as const, consistency: 0.7 },
        aquatic: { raw: 15, percentage: 50, confidence: 'medium' as const, consistency: 0.7 },
        earthly: { raw: 15, percentage: 50, confidence: 'medium' as const, consistency: 0.7 },
        airy: { raw: 15, percentage: 50, confidence: 'medium' as const, consistency: 0.7 },
        metallic: { raw: 3, percentage: 10, confidence: 'low' as const, consistency: 0.3 },
      };

      const shadow = analyzeShadowIndicators(scores);
      expect(shadow.potentialShadows).toContain('metallic');
    });

    it('should calculate burnout risk based on imbalance', () => {
      // Large imbalance = high burnout risk
      const imbalancedScores = {
        electric: { raw: 30, percentage: 100, confidence: 'high' as const, consistency: 1 },
        fiery: { raw: 3, percentage: 10, confidence: 'low' as const, consistency: 0.3 },
        aquatic: { raw: 3, percentage: 10, confidence: 'low' as const, consistency: 0.3 },
        earthly: { raw: 3, percentage: 10, confidence: 'low' as const, consistency: 0.3 },
        airy: { raw: 3, percentage: 10, confidence: 'low' as const, consistency: 0.3 },
        metallic: { raw: 3, percentage: 10, confidence: 'low' as const, consistency: 0.3 },
      };

      const shadow = analyzeShadowIndicators(imbalancedScores);
      expect(shadow.burnoutRisk).toBe('high');
    });
  });
});

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe('validateAnswers', () => {
  it('should pass valid complete answers', () => {
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 36; i++) {
      answers[i] = 3;
    }

    const validation = validateAnswers(answers);
    expect(validation.valid).toBe(true);
    expect(validation.missingQuestions).toHaveLength(0);
    expect(validation.invalidAnswers).toHaveLength(0);
  });

  it('should detect missing questions', () => {
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 30; i++) {
      answers[i] = 3;
    }
    // Missing 31-36

    const validation = validateAnswers(answers);
    expect(validation.valid).toBe(false);
    expect(validation.missingQuestions).toHaveLength(6);
    expect(validation.missingQuestions).toContain(31);
  });

  it('should detect invalid answer values', () => {
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 36; i++) {
      answers[i] = i === 1 ? 6 : 3; // Invalid value for question 1
    }

    const validation = validateAnswers(answers);
    expect(validation.valid).toBe(false);
    expect(validation.invalidAnswers).toContain(1);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('calculateAssessmentResult', () => {
  it('should return complete result for valid assessment', () => {
    const answers: Record<number, number> = {};
    // Create a profile heavy on electric
    for (let i = 1; i <= 36; i++) {
      if (i % 6 === 1) { // Electric questions
        answers[i] = 5;
      } else {
        answers[i] = 2;
      }
    }

    const result = calculateAssessmentResult(answers);

    // Check structure
    expect(result.scores).toBeDefined();
    expect(result.topElements).toBeDefined();
    expect(result.energyType).toBeDefined();
    expect(result.validity).toBeDefined();
    expect(result.patterns).toBeDefined();
    expect(result.shadowIndicators).toBeDefined();

    // Check top element is electric
    expect(result.topElements[0]).toBe('electric');
    expect(result.energyType).toBe('Extroverted');
  });

  it('should handle balanced profile', () => {
    const answers: Record<number, number> = {};
    for (let i = 1; i <= 36; i++) {
      answers[i] = 3; // All moderate
    }

    const result = calculateAssessmentResult(answers);

    // All elements should be roughly equal
    const scores = Object.values(result.scores).map(s => s.percentage);
    const variance = Math.max(...scores) - Math.min(...scores);
    expect(variance).toBeLessThan(10); // Should be very balanced
  });
});
