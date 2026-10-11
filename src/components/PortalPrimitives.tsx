import type { CSSProperties, ReactNode } from 'react'
import { Check } from 'lucide-react'
import type { PhaseState } from '../services/mockPortal'

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-intro"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>
}

export function StatusBadge({ state }: { state: PhaseState }) {
  const labels: Record<PhaseState, string> = { complete: 'Complete', in_progress: 'In progress', waiting_on_client: 'Your action', waiting_on_ian: 'With Ian', not_started: 'Not started' }
  return <span className={`status-badge ${state}`}>{state === 'complete' && <Check size={12} />}{labels[state]}</span>
}

export function ProgressRing({ value }: { value: number }) {
  return <div className="progress-ring" style={{ '--progress': `${value * 3.6}deg` } as CSSProperties}><div><strong>{value}%</strong><span>complete</span></div></div>
}
