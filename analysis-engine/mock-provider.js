/** @import { AnalysisProvider, MissionAnalysisResult } from './types.js' */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pickTop(items, count) {
  return items.slice(0, count);
}

/**
 * @implements {AnalysisProvider}
 */
export class MockAnalysisProvider {
  /**
   * @param {{ input: import('./types.js').MissionAnalysisInput }} payload
   * @returns {Promise<MissionAnalysisResult>}
   */
  async analyze({ input }) {
    const evidence = input.evidence || [];
    const metrics = evidence.filter(item => item.type === 'metric');
    const positives = evidence.filter(item => item.type === 'testimonial' || item.type === 'experiment');
    const risks = evidence.filter(item => item.type === 'risk');
    const confidenceAverage = evidence.length
      ? evidence.reduce((sum, item) => sum + (item.confidence ?? 0.5), 0) / evidence.length
      : 0;

    const rawScore = 45
      + metrics.length * 8
      + positives.length * 6
      - risks.length * 14
      + confidenceAverage * 20
      + Math.min(evidence.length, 5) * 2;

    const score = Math.round(clamp(rawScore, 0, 100));
    const decision = score >= 75 ? 'approve' : score >= 50 ? 'review' : 'reject';
    const next_action = risks.length > 0
      ? 'fix-blockers'
      : evidence.length < 3
        ? 'request-more-evidence'
        : score >= 75
          ? 'launch'
          : 'iterate-creative';

    const strengths = pickTop(
      [
        ...metrics.map(item => `${item.label} apporte un signal quantifiable.`),
        ...positives.map(item => `${item.label} confirme une traction exploitable.`),
      ],
      3,
    );

    const weaknesses = pickTop(
      [
        ...(evidence.length < 3 ? ['Le volume de preuves est encore limité.'] : []),
        ...evidence
          .filter(item => (item.confidence ?? 0.5) < 0.6)
          .map(item => `${item.label} repose sur une confiance faible.`),
        ...(metrics.length === 0 ? ['Aucune métrique dure n’est fournie pour valider la mission.'] : []),
      ],
      3,
    );

    const red_flags = pickTop(
      risks.length > 0
        ? risks.map(item => `${item.label}: ${item.value}`)
        : confidenceAverage < 0.45
          ? ['La qualité moyenne des preuves est trop faible pour conclure.']
          : [],
      3,
    );

    return {
      score,
      summary: [
        `${input.missionName} obtient un score mock de ${score}/100 sur la base de ${evidence.length} preuve(s) structurée(s).`,
        decision === 'approve'
          ? 'Les signaux sont suffisamment solides pour passer à l’exécution.'
          : decision === 'review'
            ? 'Le potentiel existe, mais l’analyse recommande encore une validation complémentaire.'
            : 'Les preuves actuelles sont insuffisantes ou trop risquées pour avancer sans correction.',
      ].join(' '),
      decision,
      next_action,
      strengths,
      weaknesses,
      red_flags,
    };
  }
}
