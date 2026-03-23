/** @import { AnalysisProvider, MissionAnalysisInput, MissionAnalysisResult, StructuredPrompt } from './types.js' */
import { buildMissionAnalysisPrompt } from './prompt-builder.js';
import { ANALYSIS_DECISIONS, ANALYSIS_NEXT_ACTIONS, MISSION_EVIDENCE_TYPES } from './types.js';

function assertArrayOfStrings(value, fieldName) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new Error(`analysis-engine: ${fieldName} must be an array of strings.`);
  }
}

/**
 * @param {MissionAnalysisInput} input
 */
function validateInput(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('analysis-engine: input is required.');
  }

  for (const field of ['missionId', 'missionName', 'objective']) {
    if (!input[field] || typeof input[field] !== 'string') {
      throw new Error(`analysis-engine: ${field} must be a non-empty string.`);
    }
  }

  if (!Array.isArray(input.evidence)) {
    throw new Error('analysis-engine: evidence must be an array.');
  }

  input.evidence.forEach((item, index) => {
    if (!item.id || !item.label || !item.value) {
      throw new Error(`analysis-engine: evidence[${index}] requires id, label, and value.`);
    }
    if (!MISSION_EVIDENCE_TYPES.includes(item.type)) {
      throw new Error(`analysis-engine: evidence[${index}] type must be one of ${MISSION_EVIDENCE_TYPES.join(', ')}.`);
    }
  });
}

/**
 * @param {MissionAnalysisResult} result
 * @returns {MissionAnalysisResult}
 */
function validateResult(result) {
  if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) {
    throw new Error('analysis-engine: result.score must be a number between 0 and 100.');
  }

  if (typeof result.summary !== 'string' || !result.summary.trim()) {
    throw new Error('analysis-engine: result.summary must be a non-empty string.');
  }

  if (!ANALYSIS_DECISIONS.includes(result.decision)) {
    throw new Error(`analysis-engine: result.decision must be one of ${ANALYSIS_DECISIONS.join(', ')}.`);
  }

  if (!ANALYSIS_NEXT_ACTIONS.includes(result.next_action)) {
    throw new Error(`analysis-engine: result.next_action must be one of ${ANALYSIS_NEXT_ACTIONS.join(', ')}.`);
  }

  assertArrayOfStrings(result.strengths, 'result.strengths');
  assertArrayOfStrings(result.weaknesses, 'result.weaknesses');
  assertArrayOfStrings(result.red_flags, 'result.red_flags');

  return result;
}

export class AnalysisEngine {
  /**
   * @param {{ provider: AnalysisProvider, promptBuilder?: (input: MissionAnalysisInput) => StructuredPrompt }} options
   */
  constructor({ provider, promptBuilder = buildMissionAnalysisPrompt }) {
    if (!provider || typeof provider.analyze !== 'function') {
      throw new Error('analysis-engine: provider.analyze is required.');
    }

    this.provider = provider;
    this.promptBuilder = promptBuilder;
  }

  /**
   * @param {MissionAnalysisInput} input
   * @returns {Promise<MissionAnalysisResult>}
   */
  async analyzeMission(input) {
    validateInput(input);

    const prompt = this.promptBuilder(input);
    const result = await this.provider.analyze({ input, prompt });

    return validateResult(result);
  }
}
