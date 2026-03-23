'use client';

import { CreateProjectInput, ProjectBundle, SubmitMissionInput } from '@/lib/domain/types';
import { mockRepository } from '@/lib/mock/storage';

export const appRepository = {
  listProjects: () => mockRepository.listProjects(),
  createProject: (input: CreateProjectInput): ProjectBundle => mockRepository.createProject(input),
  getProjectBundle: (projectId: string): ProjectBundle | null => mockRepository.getProjectBundle(projectId),
  submitMission: (input: SubmitMissionInput): ProjectBundle | null => mockRepository.submitMission(input),
};

// Zone prévue pour brancher Supabase/OpenAI plus tard sans casser l'UI.
