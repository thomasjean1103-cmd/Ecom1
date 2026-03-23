import { MISSION_SEED } from '@/lib/constants/missions';
import { AiAnalysis, SubmitMissionInput } from '@/lib/domain/types';

const decisionFromScore = (score: number) => {
  if (score >= 75) return 'GO';
  if (score >= 55) return 'GO prudent';
  return 'NO GO';
};

export function buildMockAnalysis(input: SubmitMissionInput): AiAnalysis['outputJson'] {
  const mission = MISSION_SEED.find((item) => item.id === input.projectMissionId || item.slug === input.projectMissionId);
  const signalCount = input.links.length + input.uploads.length + (input.note ? 1 : 0);
  const noteSignal = Math.min(input.note.length / 8, 22);
  const score = Math.max(38, Math.min(94, Math.round(36 + signalCount * 9 + noteSignal)));
  const decision = decisionFromScore(score);

  return {
    score,
    summary: `${mission?.title ?? 'Mission'} validée avec ${signalCount} preuves utiles. Les signaux sont ${score >= 70 ? 'solides' : score >= 55 ? 'prometteurs mais incomplets' : 'encore fragiles'} et demandent ${score >= 70 ? 'un passage rapide à la mission suivante.' : 'un approfondissement ciblé.'}`,
    decision,
    nextAction: score >= 70 ? 'Passe à la mission suivante et documente les meilleurs patterns observés.' : 'Ajoute davantage de preuves terrain avant de verrouiller la décision.',
    strengths: ['Preuves terrain structurées', 'Mission cadrée par objectif', 'Analyse facilement remplaçable par OpenAI ensuite'],
    risks: score >= 70 ? ['Sur-confiance sur peu de canaux'] : ['Volume de preuve encore faible', 'Angles insuffisamment comparés'],
  };
}
