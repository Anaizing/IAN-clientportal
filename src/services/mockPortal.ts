export type PortalPage = 'home' | 'onboarding' | 'intake' | 'files' | 'brand' | 'project' | 'agreement' | 'invoices' | 'handover' | 'admin-clients' | 'admin-client'
export type PhaseState = 'complete' | 'in_progress' | 'waiting_on_client' | 'waiting_on_ian' | 'not_started'

export type Phase = { id: string; label: string; state: PhaseState; detail: string }
export type FileAsset = { name: string; type: string; size: string; category: string; date: string; color: string }
export type IntakeQuestion = { label: string; helper: string; value: string; options?: string[] }

export type PortalSnapshot = {
  client: { id: string; name: string; initials: string; company: string; project: string; status: string }
  progress: number
  nextAction: { label: string; description: string; page: PortalPage }
  phases: Phase[]
  files: FileAsset[]
  intake: IntakeQuestion[]
  updates: { title: string; date: string; tone: 'coral' | 'blue' | 'ink' }[]
}

import { getAssignedTemplate } from './intakeTemplates'

const snapshot: PortalSnapshot = {
  client: { id: 'arrowsmithswim', name: 'Amor Today', initials: 'AT', company: 'Arrow Smith Swim', project: 'A digital home for arrowsmith swim', status: 'Brand direction' },
  progress: 38,
  nextAction: { label: 'Complete your intake', description: 'A few thoughtful answers will give the project its best start.', page: 'intake' },
  phases: [
    { id: 'welcome', label: 'Welcome', state: 'complete', detail: 'You are here' },
    { id: 'agreement', label: 'Agreement', state: 'complete', detail: 'Signed 12 Sep' },
    { id: 'intake', label: 'Intake', state: 'waiting_on_client', detail: '65% complete' },
    { id: 'assets', label: 'Assets', state: 'waiting_on_client', detail: 'Upload required' },
    { id: 'brand', label: 'Brand', state: 'not_started', detail: 'Coming next' },
    { id: 'website', label: 'Website', state: 'not_started', detail: 'Coming soon' },
    { id: 'review', label: 'Review', state: 'not_started', detail: 'Coming soon' },
    { id: 'delivery', label: 'Delivery', state: 'not_started', detail: 'Coming soon' },
  ],
  files: [
    { name: 'Northstar-logo-primary.svg', type: 'SVG', size: '248 KB', category: 'Logo', date: '16 Sep 2026', color: 'mint' },
    { name: 'Northstar-team.jpg', type: 'JPG', size: '4.8 MB', category: 'Photography', date: '16 Sep 2026', color: 'peach' },
    { name: '2026-services-overview.pdf', type: 'PDF', size: '1.2 MB', category: 'Reference', date: '14 Sep 2026', color: 'blue' },
  ],
  intake: [
    { label: 'hw does Northstar help people do?', helper: 'A simple description is perfect — no need for polished copy.', value: 'We help purpose-led teams turn complex ideas into clear, beautiful experiences.' },
    { label: 'Which three words should the brand feel like?', helper: 'Choose a few words that feel true, or add your own.', value: 'Clear, thoughtful, optimistic', options: ['Clear', 'Thoughtful', 'Optimistic', 'Bold', 'Premium', 'Warm'] },
    { label: 'What would make this website a success?', helper: 'Think about the action you want the right visitor to take.', value: 'More qualified conversations with organisations who share our values.' },
  ],
  updates: [
    { title: 'Agreement signed', date: '12 Sep 2026', tone: 'blue' },
    { title: 'Ian added a note to your project', date: '14 Sep 2026', tone: 'coral' },
    { title: 'New logo uploaded', date: '16 Sep 2026', tone: 'ink' },
  ],
}

export const portalService = {
  getSnapshot: async (): Promise<PortalSnapshot> => {
    const template = getAssignedTemplate(snapshot.client.id)
    const intake = template?.sections.map((question, index) => ({ ...question, value: snapshot.intake[index]?.value ?? '' })) ?? snapshot.intake
    return { ...snapshot, intake }
  },
  saveIntakeAnswer: async (index: number, value: string) => { snapshot.intake[index].value = value; return snapshot.intake[index] },
  approve: async (label: string) => ({ label, approvedBy: snapshot.client.name, approvedAt: 'Just now', version: 'v1.0' }),
}
