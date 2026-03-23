/** @import { MissionAnalysisInput, StructuredPrompt } from './types.js' */

function formatEvidenceLine(evidence) {
  const details = [
    `type=${evidence.type}`,
    evidence.confidence != null ? `confidence=${evidence.confidence}` : null,
    evidence.source ? `source=${evidence.source}` : null,
    evidence.notes ? `notes=${evidence.notes}` : null,
  ].filter(Boolean).join(' | ');

  return `- [${evidence.id}] ${evidence.label}: ${evidence.value}${details ? ` (${details})` : ''}`;
}

/**
 * @param {MissionAnalysisInput} input
 * @returns {StructuredPrompt}
 */
export function buildMissionAnalysisPrompt(input) {
  return {
    system: [
      'You are analysis-engine, a modular evaluator for e-commerce missions.',
      'Use only the supplied evidence.',
      'Return a concise JSON-compatible assessment that follows the output contract exactly.',
      'Do not invent missing evidence: if the signal is weak, say so in weaknesses or red_flags.',
    ].join(' '),
    sections: [
      {
        title: 'MISSION',
        lines: [
          `mission_id: ${input.missionId}`,
          `mission_name: ${input.missionName}`,
          `objective: ${input.objective}`,
          `market: ${input.market || 'unknown'}`,
          `channel: ${input.channel || 'unknown'}`,
        ],
      },
      {
        title: 'EVIDENCE',
        lines: input.evidence.length > 0
          ? input.evidence.map(formatEvidenceLine)
          : ['- No evidence supplied.'],
      },
      {
        title: 'SCORING_RULES',
        lines: [
          'Score is an integer from 0 to 100.',
          'Decision must be approve, review, or reject.',
          'Next action must be one of: launch, iterate-creative, request-more-evidence, fix-blockers, monitor.',
          'Strengths, weaknesses, and red_flags must be arrays of short strings.',
          'Summary must synthesize the evidence in 2-3 sentences.',
        ],
      },
    ],
    outputContract: JSON.stringify({
      score: 'number',
      summary: 'string',
      decision: 'approve | review | reject',
      next_action: 'launch | iterate-creative | request-more-evidence | fix-blockers | monitor',
      strengths: ['string'],
      weaknesses: ['string'],
      red_flags: ['string'],
    }, null, 2),
  };
}
