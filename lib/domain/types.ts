export type ProjectStatus = 'draft' | 'active' | 'completed';
export type MissionStatus = 'locked' | 'active' | 'submitted' | 'reviewed';
export type ExperienceLevel = 'débutant' | 'intermédiaire' | 'avancé';
export type EvidenceType = 'note' | 'link' | 'image';

export interface MissionDefinition {
  id: string;
  slug: string;
  title: string;
  objective: string;
  instructions: string;
  requiredEvidence: string[];
  orderIndex: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  niche: string;
  market: string;
  budget: string;
  experienceLevel: ExperienceLevel;
  status: ProjectStatus;
  currentPhase: string;
  currentMissionOrder: number;
  overallScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMission {
  id: string;
  projectId: string;
  missionId: string;
  status: MissionStatus;
  submittedAt: string | null;
  score: number | null;
  aiSummary: string | null;
  aiDecision: string | null;
  nextAction: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceItem {
  id: string;
  projectMissionId: string;
  type: EvidenceType;
  content: string | null;
  fileUrl: string | null;
  createdAt: string;
}

export interface AiAnalysis {
  id: string;
  projectMissionId: string;
  model: string;
  inputSummary: string;
  outputJson: { score: number; summary: string; decision: string; nextAction: string; strengths: string[]; risks: string[] };
  createdAt: string;
}

export interface ProjectBundle {
  project: Project;
  missions: Array<ProjectMission & { mission: MissionDefinition; evidenceItems: EvidenceItem[]; analysis?: AiAnalysis }>;
}

export interface CreateProjectInput {
  name: string;
  niche: string;
  market: string;
  budget: string;
  experienceLevel: ExperienceLevel;
}

export interface SubmitMissionInput {
  projectId: string;
  projectMissionId: string;
  note: string;
  links: string[];
  uploads: string[];
}
