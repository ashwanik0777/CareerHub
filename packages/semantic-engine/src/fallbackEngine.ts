import { UnknownDetector } from './unknownDetector';

export interface FallbackResult {
  label: string;
  source: 'ai' | 'rules' | 'historical' | 'unknown';
  confidence: number;
}

export class FallbackEngine {
  /**
   * Smart fallback pipeline. Never randomly autofills.
   */
  static evaluate(
    htmlMetadata: { label: string; placeholder: string; name: string },
    aiPredictions: Array<{ label: string; confidence: number }>
  ): FallbackResult {
    
    // 1. Check if AI is confident
    if (!UnknownDetector.isUnknown(aiPredictions)) {
      return {
        label: aiPredictions[0].label,
        source: 'ai',
        confidence: aiPredictions[0].confidence
      };
    }

    // 2. Rule Engine Fallback (Regex / Exact Match)
    const ruleMatch = this.evaluateRules(htmlMetadata);
    if (ruleMatch) {
      return {
        label: ruleMatch,
        source: 'rules',
        confidence: 0.9 // High confidence because rule matched exactly
      };
    }

    // 3. Historical Similarity Fallback would go here 
    // e.g. using string similarity against user's past filled inputs

    // 4. Ultimate Fallback: UNKNOWN (requires manual user intervention)
    return {
      label: 'miscellaneous',
      source: 'unknown',
      confidence: 0.0
    };
  }

  private static evaluateRules(metadata: { label: string; placeholder: string; name: string }): string | null {
    const combined = `${metadata.label} ${metadata.name} ${metadata.placeholder}`.toLowerCase();
    
    if (combined.includes('first name') || combined === 'fname') return 'personal.firstName';
    if (combined.includes('last name') || combined === 'lname') return 'personal.lastName';
    if (combined.includes('email') || combined === 'e-mail') return 'personal.email';
    if (combined.includes('phone') || combined.includes('mobile')) return 'personal.phone';
    
    return null;
  }
}
