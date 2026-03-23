import { MissionDefinition } from '@/lib/domain/types';

export const MISSION_SEED: MissionDefinition[] = [
  {
    id: 'mission-signaux-organiques', slug: 'signaux-organiques', title: 'Signaux organiques', objective: 'Vérifier si le problème et l’intérêt existent déjà sur les plateformes organiques.', instructions: 'Va sur TikTok ou Instagram, cherche des contenus liés au problème, trouve 5 à 10 contenus pertinents, puis envoie captures, liens, hooks et commentaires utiles.', requiredEvidence: ['5 à 10 liens de contenus', 'Hooks observés', 'Commentaires / preuves d’intérêt', 'Captures ou uploads'], orderIndex: 1,
  },
  {
    id: 'mission-signaux-pub', slug: 'signaux-pub', title: 'Signaux publicitaires', objective: 'Vérifier l’existence d’annonceurs actifs et d’angles déjà monétisés.', instructions: 'Va sur Meta Ads Library, trouve 5 annonces liées au problème ou produit, puis envoie captures de la créa, texte et landing.', requiredEvidence: ['5 annonces minimum', 'Angles pub', 'Texte publicitaire', 'Landing pages'], orderIndex: 2,
  },
  {
    id: 'mission-concurrence', slug: 'concurrence', title: 'Analyse concurrence', objective: 'Analyser 3 concurrents directs.', instructions: 'Trouve 3 boutiques concurrentes, puis envoie captures hero, prix, offre, bundle, promesse et avis.', requiredEvidence: ['3 concurrents', 'Hero section', 'Prix et offre', 'Promesse + avis'], orderIndex: 3,
  },
  {
    id: 'mission-voix-client', slug: 'voix-client', title: 'Voix du client', objective: 'Récupérer frustrations, objections et désirs réels.', instructions: 'Va sur Amazon, Trustpilot, forums et commentaires, puis récupère 10 frustrations, 10 objections et 10 désirs.', requiredEvidence: ['10 frustrations', '10 objections', '10 désirs', 'Sources / liens'], orderIndex: 4,
  },
  {
    id: 'mission-verdict-produit', slug: 'verdict-produit', title: 'Verdict final produit', objective: 'Produire une synthèse finale de validation.', instructions: 'Synthétise les missions précédentes, calcule un score global et produis un verdict GO / GO prudent / NO GO.', requiredEvidence: ['Synthèse globale', 'Points forts', 'Risques', 'Recommandation finale'], orderIndex: 5,
  },
];
