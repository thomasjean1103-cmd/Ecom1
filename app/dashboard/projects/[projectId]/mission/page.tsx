import { MissionForm } from '@/components/forms/mission-form';
export default async function MissionPage({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return <MissionForm projectId={projectId} />; }
