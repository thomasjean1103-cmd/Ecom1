import { MISSION_SEED } from '@/lib/constants/missions';
import { AiAnalysis, CreateProjectInput, EvidenceItem, Project, ProjectBundle, ProjectMission, SubmitMissionInput } from '@/lib/domain/types';
import { buildMockAnalysis } from '@/lib/analysis/mock-engine';

const DEMO_USER = 'demo-user';
const PROJECTS_KEY = 'mission-commerce-projects';
const PM_KEY = 'mission-commerce-project-missions';
const EVIDENCE_KEY = 'mission-commerce-evidence';
const ANALYSIS_KEY = 'mission-commerce-analyses';

const now = () => new Date().toISOString();
const uid = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = window.localStorage.getItem(key);
  return raw ? JSON.parse(raw) as T : fallback;
}
function write<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const mockRepository = {
  listProjects(): Project[] {
    return read<Project[]>(PROJECTS_KEY, []);
  },
  createProject(input: CreateProjectInput): ProjectBundle {
    const project: Project = { id: uid('project'), userId: DEMO_USER, status: 'active', currentPhase: 'recherche-produit', currentMissionOrder: 1, overallScore: null, createdAt: now(), updatedAt: now(), ...input };
    const projects = [project, ...this.listProjects()];
    write(PROJECTS_KEY, projects);
    const projectMissions: ProjectMission[] = MISSION_SEED.map((mission) => ({ id: uid(`pm-${mission.slug}`), projectId: project.id, missionId: mission.id, status: mission.orderIndex === 1 ? 'active' : 'locked', submittedAt: null, score: null, aiSummary: null, aiDecision: null, nextAction: null, createdAt: now(), updatedAt: now() }));
    write(PM_KEY, [...read<ProjectMission[]>(PM_KEY, []), ...projectMissions]);
    return this.getProjectBundle(project.id)!;
  },
  getProjectBundle(projectId: string): ProjectBundle | null {
    const project = this.listProjects().find((item) => item.id === projectId);
    if (!project) return null;
    const projectMissions = read<ProjectMission[]>(PM_KEY, []).filter((item) => item.projectId === projectId);
    const evidence = read<EvidenceItem[]>(EVIDENCE_KEY, []);
    const analyses = read<AiAnalysis[]>(ANALYSIS_KEY, []);
    return {
      project,
      missions: projectMissions
        .map((pm) => ({
          ...pm,
          mission: MISSION_SEED.find((mission) => mission.id === pm.missionId)!,
          evidenceItems: evidence.filter((item) => item.projectMissionId === pm.id),
          analysis: analyses.find((item) => item.projectMissionId === pm.id),
        }))
        .sort((a, b) => a.mission.orderIndex - b.mission.orderIndex),
    };
  },
  submitMission(input: SubmitMissionInput): ProjectBundle | null {
    const evidence = read<EvidenceItem[]>(EVIDENCE_KEY, []);
    const linksEvidence = input.links.filter(Boolean).map((link) => ({ id: uid('evidence-link'), projectMissionId: input.projectMissionId, type: 'link' as const, content: link, fileUrl: null, createdAt: now() }));
    const noteEvidence = input.note ? [{ id: uid('evidence-note'), projectMissionId: input.projectMissionId, type: 'note' as const, content: input.note, fileUrl: null, createdAt: now() }] : [];
    const uploadEvidence = input.uploads.map((upload) => ({ id: uid('evidence-image'), projectMissionId: input.projectMissionId, type: 'image' as const, content: null, fileUrl: upload, createdAt: now() }));
    write(EVIDENCE_KEY, [...evidence, ...linksEvidence, ...noteEvidence, ...uploadEvidence]);

    const projectMissions = read<ProjectMission[]>(PM_KEY, []);
    const current = projectMissions.find((item) => item.id === input.projectMissionId);
    if (!current) return this.getProjectBundle(input.projectId);
    const output = buildMockAnalysis(input);
    const analyses = read<AiAnalysis[]>(ANALYSIS_KEY, []);
    const analysis: AiAnalysis = { id: uid('analysis'), projectMissionId: current.id, model: 'mock-mission-analyzer-v1', inputSummary: `${input.links.length} liens, ${input.uploads.length} uploads`, outputJson: output, createdAt: now() };
    write(ANALYSIS_KEY, [...analyses, analysis]);

    const updated = projectMissions.map((item) => {
      if (item.id === current.id) return { ...item, status: 'reviewed' as const, submittedAt: now(), score: output.score, aiSummary: output.summary, aiDecision: output.decision, nextAction: output.nextAction, updatedAt: now() };
      const mission = MISSION_SEED.find((m) => m.id === item.missionId);
      if (item.projectId === input.projectId && mission && mission.orderIndex === MISSION_SEED.find((m) => m.id === current.missionId)!.orderIndex + 1 && item.status === 'locked') return { ...item, status: 'active' as const, updatedAt: now() };
      return item;
    });
    write(PM_KEY, updated);

    const bundle = this.getProjectBundle(input.projectId);
    if (!bundle) return null;
    const reviewed = bundle.missions.filter((mission) => typeof mission.score === 'number');
    const average = reviewed.length ? Math.round(reviewed.reduce((sum, mission) => sum + (mission.score ?? 0), 0) / reviewed.length) : null;
    const currentMissionOrder = bundle.missions.find((mission) => mission.status === 'active')?.mission.orderIndex ?? 5;
    const projects = this.listProjects().map((project) => project.id === input.projectId ? { ...project, overallScore: average, currentMissionOrder, updatedAt: now(), status: currentMissionOrder === 5 && reviewed.length === 5 ? 'completed' as const : project.status } : project);
    write(PROJECTS_KEY, projects);
    return this.getProjectBundle(input.projectId);
  },
};
