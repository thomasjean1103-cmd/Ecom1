/**
 * @typedef {'approve' | 'review' | 'reject'} AnalysisDecision
 */

/**
 * @typedef {'launch' | 'iterate-creative' | 'request-more-evidence' | 'fix-blockers' | 'monitor'} AnalysisNextAction
 */

/**
 * @typedef {'metric' | 'observation' | 'testimonial' | 'experiment' | 'risk' | 'context'} MissionEvidenceType
 */

/**
 * @typedef {Object} MissionEvidence
 * @property {string} id
 * @property {MissionEvidenceType} type
 * @property {string} label
 * @property {string} value
 * @property {number} [confidence]
 * @property {string} [source]
 * @property {string} [notes]
 */

/**
 * @typedef {Object} MissionAnalysisInput
 * @property {string} missionId
 * @property {string} missionName
 * @property {string} objective
 * @property {string} [market]
 * @property {string} [channel]
 * @property {MissionEvidence[]} evidence
 */

/**
 * @typedef {Object} StructuredPromptSection
 * @property {string} title
 * @property {string[]} lines
 */

/**
 * @typedef {Object} StructuredPrompt
 * @property {string} system
 * @property {StructuredPromptSection[]} sections
 * @property {string} outputContract
 */

/**
 * @typedef {Object} MissionAnalysisResult
 * @property {number} score
 * @property {string} summary
 * @property {AnalysisDecision} decision
 * @property {AnalysisNextAction} next_action
 * @property {string[]} strengths
 * @property {string[]} weaknesses
 * @property {string[]} red_flags
 */

/**
 * @typedef {Object} AnalysisProvider
 * @property {(payload: { input: MissionAnalysisInput, prompt: StructuredPrompt }) => Promise<MissionAnalysisResult>} analyze
 */

export const ANALYSIS_DECISIONS = /** @type {const} */ (['approve', 'review', 'reject']);
export const ANALYSIS_NEXT_ACTIONS = /** @type {const} */ (['launch', 'iterate-creative', 'request-more-evidence', 'fix-blockers', 'monitor']);
export const MISSION_EVIDENCE_TYPES = /** @type {const} */ (['metric', 'observation', 'testimonial', 'experiment', 'risk', 'context']);
