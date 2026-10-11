import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import type { PortalSnapshot } from '../services/mockPortal'
import { portalService } from '../services/mockPortal'

type IntakeFlowProps = { snapshot: PortalSnapshot; onChange: (snapshot: PortalSnapshot) => void; onComplete: () => void }

export function IntakeFlow({ snapshot, onChange, onComplete }: IntakeFlowProps) {
  const [step, setStep] = useState(0)
  const [saved, setSaved] = useState(false)
  const [completed, setCompleted] = useState(() => localStorage.getItem('ian-intake-complete') === 'true')
  const question = snapshot.intake[step]
  const totalQuestions = snapshot.intake.length
  const currentQuestion = Math.min(step + 1, totalQuestions)
  const progress = totalQuestions ? Math.round((currentQuestion / totalQuestions) * 100) : 0

  const save = async (value: string) => {
    const next = { ...snapshot, intake: snapshot.intake.map((item, index) => index === step ? { ...item, value } : item) }
    onChange(next)
    await portalService.saveIntakeAnswer(step, value)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1600)
  }

  const toggleOption = (option: string) => {
    const selected = question.value.split(',').map((item) => item.trim()).filter(Boolean)
    const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]
    void save(next.join(', '))
  }

  const finish = () => {
    localStorage.setItem('ian-intake-complete', 'true')
    onChange({ ...snapshot, nextAction: { label: 'Review your project', description: 'Your intake is complete. [IAN] is taking it from here.', page: 'project' }, phases: snapshot.phases.map((phase) => phase.id === 'intake' ? { ...phase, state: 'complete', detail: 'Completed just now' } : phase) })
    setCompleted(true)
    onComplete()
  }

  if (!question) return <section className="intake-complete" aria-label="Website intake unavailable">
    <h1>No intake questions yet.</h1>
    <p>Your intake template does not have any questions assigned right now.</p>
    <button type="button" className="intake-continue" onClick={onComplete}>Go to overview <ArrowRight size={16} /></button>
  </section>

  if (completed) return <section className="intake-complete" aria-label="Website intake complete">
    <div className="intake-complete-mark"><Check size={22} /></div>
    <h1>Intake complete.</h1>
    <p>Thank you. We have what we need to begin shaping the work. [IAN] will take it from here.</p>
    <button type="button" className="intake-continue" onClick={onComplete}>Go to overview <ArrowRight size={16} /></button>
  </section>

  return <section className="intake-simple" aria-label="Website intake questionnaire">
    <div className="intake-simple-header">
      <div>
        <span className="intake-step-label">Question {currentQuestion} of {totalQuestions}</span>
        <strong>{progress}% complete</strong>
      </div>
      <div className="intake-simple-track" role="progressbar" aria-label="Intake progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
    <div className="intake-simple-card">
      <h2>{question.label}</h2>
      {question.options ? <div className="intake-options">{question.options.map((option) => <button type="button" className={`intake-option ${question.value.split(',').map((item) => item.trim()).includes(option) ? 'selected' : ''}`} key={option} onClick={() => toggleOption(option)}>{question.value.split(',').map((item) => item.trim()).includes(option) && <Check size={15} />}{option}</button>)}</div> : <label className="intake-answer"><span className="sr-only">Your answer</span><textarea value={question.value} onChange={(event) => void save(event.target.value)} rows={5} placeholder={question.helper} /></label>}
    </div>
    <div className="intake-simple-actions"><button type="button" className="intake-back" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>Back</button><button type="button" className="intake-continue" onClick={() => step === snapshot.intake.length - 1 ? finish() : setStep((current) => current + 1)}>{step === snapshot.intake.length - 1 ? 'Finish intake' : 'Continue'} <ArrowRight size={16} /></button></div>
  </section>
}
