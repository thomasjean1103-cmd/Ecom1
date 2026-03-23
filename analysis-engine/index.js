export { AnalysisEngine } from './service.js';
export { buildMissionAnalysisPrompt } from './prompt-builder.js';
export { MockAnalysisProvider } from './mock-provider.js';
export {
  ANALYSIS_DECISIONS,
  ANALYSIS_NEXT_ACTIONS,
  MISSION_EVIDENCE_TYPES,
} from './types.js';

import { AnalysisEngine } from './service.js';
import { MockAnalysisProvider } from './mock-provider.js';

export function createMockAnalysisEngine() {
  return new AnalysisEngine({
    provider: new MockAnalysisProvider(),
  });
}
