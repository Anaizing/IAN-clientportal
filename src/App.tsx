import { useEffect, useState } from 'react'
import {
  ArrowRight, Bell, BookOpen, BriefcaseBusiness, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, CircleUserRound, ClipboardCheck, CloudUpload, CreditCard, FileText, FolderOpen,
  House, LayoutGrid, LogOut, Menu, MessageCircle, MoreHorizontal, PackageCheck, Palette,
  PenLine, Plus, Search, Settings2, ShieldCheck, Sparkles, Upload, X, Zap,
} from 'lucide-react'
import { Phase, PhaseState, PortalPage, PortalSnapshot, portalService } from './services/mockPortal'
import { IntakeFlow } from './components/IntakeFlow'
import { PageIntro, ProgressRing, StatusBadge } from './components/PortalPrimitives'
import { AdminPortal } from './components/AdminPortal'
import { ThemeToggle } from './components/ThemeToggle'

const navItems: { page: PortalPage; label: string; icon: typeof House }[] = [
  { page: 'home', label: 'Overview', icon: House },
  { page: 'welcome', label: 'Welcome letter', icon: BookOpen },
  { page: 'onboarding', label: 'Onboarding', icon: ClipboardCheck },
  { page: 'intake', label: 'Website intake', icon: PenLine },
  { page: 'files', label: 'Files & assets', icon: FolderOpen },
  { page: 'brand', label: 'Brand direction', icon: Palette },
  { page: 'project', label: 'Project progress', icon: BriefcaseBusiness },
  { page: 'agreement', label: 'Agreement', icon: FileText },
  { page: 'invoices', label: 'Invoices', icon: CreditCard },
  { page: 'handover', label: 'Handover', icon: PackageCheck },
]

function pageFromHash(): PortalPage {
  const route = location.hash.replace('#/', '')
  if (route === 'admin/clients') return 'admin-clients'
  if (route.startsWith('admin/clients/')) return 'admin-client'
  return (route as PortalPage) || 'intake'
}

export function App() {
  const [page, setPage] = useState<PortalPage>(pageFromHash)
  const [adminClientId, setAdminClientId] = useState(() => location.hash.split('/').pop() || '')
  const [snapshot, setSnapshot] = useState<PortalSnapshot | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

  useEffect(() => { portalService.getSnapshot().then(setSnapshot) }, [])
  useEffect(() => { if (page === 'admin-client') return; history.replaceState(null, '', page === 'admin-clients' ? '#/admin/clients' : `#/${page}`) }, [page])
  useEffect(() => { const handleHashChange = () => { setPage(pageFromHash()); setAdminClientId(location.hash.split('/').pop() || '') }; window.addEventListener('hashchange', handleHashChange); return () => window.removeEventListener('hashchange', handleHashChange) }, [])

  if (!snapshot) return <div className="loading-screen"><div className="wordmark">[IAN]</div><span>Preparing your workspace…</span></div>

  const navigate = (next: PortalPage) => { setPage(next); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  if (page === 'admin-clients' || page === 'admin-client') return <AdminPortal detailId={page === 'admin-client' ? adminClientId : undefined} onRoute={navigate} />
  if (page === 'intake') return <div className="intake-landing"><div className="intake-corner-logo">[IAN]</div><ThemeToggle /><main className="intake-landing-main"><IntakeFlow snapshot={snapshot} onChange={setSnapshot} onComplete={() => setShowWelcomeModal(true)} /></main>{showWelcomeModal && <WelcomeLetterModal snapshot={snapshot} onContinue={() => { setShowWelcomeModal(false); navigate('home') }} />}</div>

  return <div className="app-shell">
    <Sidebar page={page} navigate={navigate} />
    <div className="main-column">
      <Topbar client={snapshot.client} onMenu={() => setMenuOpen(true)} />
      {menuOpen && <MobileMenu page={page} navigate={navigate} onClose={() => setMenuOpen(false)} />}
      <main className="page-content">
        {page === 'home' && <Home snapshot={snapshot} navigate={navigate} />}
        {page === 'welcome' && <WelcomeLetter snapshot={snapshot} navigate={navigate} />}
        {page === 'onboarding' && <Onboarding snapshot={snapshot} navigate={navigate} />}
        {page === 'files' && <Files snapshot={snapshot} />}
        {page === 'brand' && <Brand />}
        {page === 'project' && <Project snapshot={snapshot} />}
        {page === 'agreement' && <Agreement />}
        {page === 'invoices' && <Invoices />}
        {page === 'handover' && <Handover />}
      </main>
      <footer className="footer"><span>[IAN] Studio</span><span>Private client workspace · Need help? <a href="mailto:hello@ian.studio">Say hello</a></span></footer>
    </div>
  </div>
}

function Sidebar({ page, navigate }: { page: PortalPage; navigate: (page: PortalPage) => void }) {
  return <aside className="sidebar">
    <div className="brand-lockup"><span className="brand-mark">[IAN]</span><span className="brand-sub">STUDIO</span></div>
    <div className="sidebar-label">Your workspace</div>
    <nav>{navItems.map(({ page: itemPage, label, icon: Icon }) => <button key={itemPage} className={`nav-item ${page === itemPage ? 'active' : ''}`} onClick={() => navigate(itemPage)}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{itemPage === 'intake' && <span className="nav-dot" />}</button>)}</nav>
    <div className="sidebar-bottom"><button className="nav-item"><CircleHelp size={17} /><span>Help centre</span></button><div className="sidebar-user"><div className="avatar">ST</div><div><strong>Sophie Taylor</strong><span>Northstar Studio</span></div><MoreHorizontal size={17} /></div></div>
  </aside>
}

function Topbar({ client, onMenu }: { client: PortalSnapshot['client']; onMenu: () => void }) {
  return <header className="topbar"><button className="mobile-menu-button" onClick={onMenu}><Menu size={20} /></button><div className="breadcrumb"><span>Client portal</span><ChevronRight size={14} /><strong>{client.project}</strong></div><div className="topbar-actions"><ThemeToggle /><button className="icon-button"><Search size={18} /></button><button className="icon-button notification"><Bell size={18} /><span /></button><div className="top-avatar">{client.initials}</div></div></header>
}

function MobileMenu({ page, navigate, onClose }: { page: PortalPage; navigate: (page: PortalPage) => void; onClose: () => void }) {
  return <div className="mobile-menu"><div className="mobile-menu-head"><span className="wordmark">[IAN]</span><button className="icon-button" onClick={onClose}><X size={18} /></button></div>{navItems.map(({ page: itemPage, label, icon: Icon }) => <button key={itemPage} className={`nav-item ${page === itemPage ? 'active' : ''}`} onClick={() => navigate(itemPage)}><Icon size={17} /><span>{label}</span></button>)}</div>
}

function Home({ snapshot, navigate }: { snapshot: PortalSnapshot; navigate: (page: PortalPage) => void }) {
  return <><PageIntro eyebrow="Good morning, Sophie" title="Your project, at a glance." description="A calm place to keep everything moving. Here’s what’s happening with your new digital home." action={<button className="outline-button"><MessageCircle size={16} /> Message Ian</button>} />
    <section className="hero-grid"><div className="welcome-card"><div className="card-kicker">NORTHSTAR STUDIO · WEBSITE PROJECT</div><h2>Making the complex<br /><em>feel clear.</em></h2><p>We’re shaping a digital home that feels as thoughtful and purposeful as the work you do.</p><div className="hero-meta"><span><strong>Started</strong> 12 September 2026</span><span><strong>Target launch</strong> 24 November 2026</span></div></div><div className="progress-card"><div className="card-kicker">YOUR PROGRESS</div><div className="progress-layout"><ProgressRing value={snapshot.progress} /><div><h3>Brand direction</h3><p>You’re in the early, exciting part — getting clear on what makes Northstar, Northstar.</p><button className="text-button" onClick={() => navigate('project')}>View project progress <ArrowRight size={15} /></button></div></div></div></section>
    <section className="section-heading"><div><div className="eyebrow">The next best step</div><h2>Keep the momentum going.</h2></div><span className="saved-label"><Check size={14} /> Saved just now</span></section><div className="next-action-card"><div className="action-icon"><Zap size={21} /></div><div className="action-copy"><span className="small-label">ACTION NEEDED FROM YOU</span><h3>{snapshot.nextAction.label}</h3><p>{snapshot.nextAction.description}</p></div><button className="coral-button" onClick={() => navigate(snapshot.nextAction.page)}>Continue <ArrowRight size={16} /></button></div>
    <section className="overview-grid"><div className="panel"><div className="panel-heading"><div><div className="eyebrow">Project journey</div><h2>Where we are now</h2></div><button className="quiet-button" onClick={() => navigate('onboarding')}>See all <ArrowRight size={15} /></button></div><Timeline phases={snapshot.phases} /></div><div className="panel updates-panel"><div className="panel-heading"><div><div className="eyebrow">Studio notes</div><h2>Latest updates</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div>{snapshot.updates.map((update) => <div className="update-row" key={update.title}><span className={`update-dot ${update.tone}`} /><div><strong>{update.title}</strong><span>{update.date}</span></div><ChevronRight size={15} /></div>)}<button className="full-quiet-button">View activity history <ArrowRight size={15} /></button></div></section>
  </>
}

function intakeAnswer(snapshot: PortalSnapshot, patterns: RegExp[]) {
  return snapshot.intake.find((item) => patterns.some((pattern) => pattern.test(item.label)))?.value.trim() || ''
}

function welcomeLetterData(snapshot: PortalSnapshot) {
  const firstName = snapshot.client.name.split(' ')[0] || snapshot.client.name
  const brandName = intakeAnswer(snapshot, [/brand name/i]) || snapshot.client.company
  const brandQualities = intakeAnswer(snapshot, [/qualities.*brand/i, /three words/i, /brand feel/i])
  const customerFeeling = intakeAnswer(snapshot, [/feel.*wear/i, /customer.*feel/i])
  const heroProduct = intakeAnswer(snapshot, [/hero.*website/i, /hero.*collection/i, /most want people to buy/i])
  const success = intakeAnswer(snapshot, [/website.*success/i, /make this website a success/i])
  const visualDirection = intakeAnswer(snapshot, [/visual direction/i, /website feel most like/i, /how bold/i])
  const projectLabel = snapshot.client.project || `${snapshot.client.company} website project`
  const priorities = [heroProduct ? `Give ${heroProduct} the right presence so customers understand why it matters.` : `Make the offer easy to understand and easy to act on.`, brandQualities ? `Carry the feeling of ${brandQualities} through the brand, interface and content.` : `Build a brand direction that feels confident, distinct and useful.`, success ? `Measure decisions against this goal: ${success}` : `Make practical technical decisions that support performance, clarity and trust.`]
  const introDetails = [brandQualities && `the brand qualities you named: ${brandQualities}`, customerFeeling && `the way you want people to feel: ${customerFeeling}`, heroProduct && `the product or collection you want to lead with: ${heroProduct}`].filter(Boolean).join(', ')
  const directionDetails = [success && `what success looks like: ${success}`, visualDirection && `the visual direction you are drawn to: ${visualDirection}`].filter(Boolean).join(', ')
  const paragraphs = [`Hi ${firstName}, welcome aboard. Thank you for taking the time to share the shape of ${brandName}${introDetails ? `, including ${introDetails}` : ''}. That gives us a much more human starting point than a generic brief: we can already see what needs to feel special, what needs to be clear, and where the website needs to build confidence for the people discovering the brand.`, `From here, our job is to turn that into a professional, well-communicated ${projectLabel} that supports the business rather than just decorating it${directionDetails ? `, guided by ${directionDetails}` : ''}. We’ll make careful calls on structure, brand expression, ecommerce flow, performance and any AI/networking features, and we’ll keep you close to the decisions that matter while handling the technical detail for you. You’re in good hands.`]
  return { firstName, brandName, projectLabel, priorities, paragraphs }
}

function WelcomeLetterContent({ snapshot }: { snapshot: PortalSnapshot }) {
  const letter = welcomeLetterData(snapshot)
  return <><article className="welcome-letter-paper"><div className="letter-meta"><span>[IAN] STUDIO</span><span>{letter.brandName}</span></div>{letter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="letter-signoff"><strong>Ian</strong><span>Studio founder · [IAN]</span></div></article><aside className="welcome-letter-side"><div><span className="small-label">PROJECT OVERVIEW</span><h2>{letter.brandName}</h2><p>{letter.projectLabel}</p></div><div className="welcome-priority-list">{letter.priorities.map((priority, index) => <div className="welcome-priority" key={priority}><span>{index + 1}</span><p>{priority}</p></div>)}</div><div className="welcome-trust-panel"><ShieldCheck size={20} /><div><strong>How we’ll protect the outcome</strong><p>Clear communication, thoughtful technical judgement, and decisions made around the client experience first.</p></div></div></aside></>
}

function WelcomeLetter({ snapshot, navigate }: { snapshot: PortalSnapshot; navigate: (page: PortalPage) => void }) {
  const letter = welcomeLetterData(snapshot)
  return <><section className="welcome-letter-hero"><div><span className="eyebrow">Welcome aboard</span><h1>{letter.firstName}, your project is in good hands.</h1><p>Your letter is shaped from the answers you shared in the intake, so it reflects the business, the project and the outcome we’re working toward together.</p></div><button className="coral-button" onClick={() => navigate('project')}>View project plan <ArrowRight size={16} /></button></section>
    <section className="welcome-letter-page"><WelcomeLetterContent snapshot={snapshot} /></section></>
}

function WelcomeLetterModal({ snapshot, onContinue }: { snapshot: PortalSnapshot; onContinue: () => void }) {
  const letter = welcomeLetterData(snapshot)
  return <div className="welcome-letter-modal" role="dialog" aria-modal="true" aria-label="Welcome aboard letter"><article className="welcome-modal-letter"><div className="letter-meta"><span>[IAN] STUDIO</span><span>{letter.brandName}</span></div><span className="eyebrow">Intake complete</span><h1>{letter.firstName}, welcome aboard.</h1>{letter.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<div className="letter-signoff"><strong>Ian</strong><span>Studio founder · [IAN]</span></div><button className="coral-button" onClick={onContinue}>Continue to overview <ArrowRight size={16} /></button></article></div>
}

function Timeline({ phases }: { phases: Phase[] }) { return <div className="timeline">{phases.map((phase, index) => <div className={`timeline-item ${phase.state}`} key={phase.id}><div className="timeline-marker">{phase.state === 'complete' ? <Check size={12} /> : <span>{String(index + 1).padStart(2, '0')}</span>}</div><div><strong>{phase.label}</strong><span>{phase.detail}</span></div></div>)}</div> }

function Onboarding({ snapshot, navigate }: { snapshot: PortalSnapshot; navigate: (page: PortalPage) => void }) { const items = [{ title: 'Welcome aboard', detail: 'Get familiar with how we’ll work together.', state: 'complete' as PhaseState, page: 'welcome' as PortalPage }, { title: 'Review & sign agreement', detail: 'Your agreement is safely signed and on file.', state: 'complete' as PhaseState, page: 'agreement' as PortalPage }, { title: 'Complete website intake', detail: 'Tell us about your business, audience and ambition.', state: 'waiting_on_client' as PhaseState, page: 'intake' as PortalPage }, { title: 'Upload brand assets', detail: 'Logos, photography, copy and anything else that helps.', state: 'waiting_on_client' as PhaseState, page: 'files' as PortalPage }, { title: 'Review colour palette', detail: 'A first point of view from Ian, ready for your eyes.', state: 'not_started' as PhaseState, page: 'brand' as PortalPage }, { title: 'Approve design direction', detail: 'The north star for every design decision that follows.', state: 'not_started' as PhaseState, page: 'project' as PortalPage }]; return <><PageIntro eyebrow="Your onboarding journey" title="One step at a time." description="Everything we need to make the project feel distinctly yours, in one simple checklist." /><div className="onboarding-layout"><div className="checklist-card">{items.map((item, index) => <div className="checklist-row" key={item.title}><div className={`check-circle ${item.state}`}>{item.state === 'complete' ? <Check size={15} /> : <span>{index + 1}</span>}</div><div className="check-content"><div className="check-title"><h3>{item.title}</h3><StatusBadge state={item.state} /></div><p>{item.detail}</p>{item.title === 'Complete website intake' && <div className="mini-progress"><span style={{ width: '65%' }} /></div>}</div><button className="row-arrow" onClick={() => navigate(item.page)}><ArrowRight size={17} /></button></div>)}</div><aside className="side-note"><div className="note-icon"><Sparkles size={18} /></div><h3>A note from Ian</h3><p>Don’t overthink your answers. The best starting point is usually the honest one — we’ll shape the words together later.</p><div className="note-sign">Ian <span>· Studio founder</span></div></aside></div></> }

function Files({ snapshot }: { snapshot: PortalSnapshot }) { return <><PageIntro eyebrow="Files & assets" title="Everything in one place." description="Upload the things that make your business yours. You can add more whenever inspiration strikes." action={<button className="coral-button"><Upload size={16} /> Upload files</button>} /><div className="upload-zone"><div className="upload-icon"><CloudUpload size={22} /></div><div><h3>Drop files here, or browse</h3><p>Images, PDFs, documents and brand files up to 50 MB.</p></div><button className="outline-button">Choose files</button></div><div className="asset-toolbar"><div className="filter-tabs"><button className="active">All files <span>3</span></button><button>Logo</button><button>Photography</button><button>Reference</button></div><button className="quiet-button"><Search size={15} /> Search</button></div><div className="asset-grid">{snapshot.files.map((file) => <div className="asset-card" key={file.name}><div className={`asset-preview ${file.color}`}><FileText size={28} strokeWidth={1.5} /><span>{file.type}</span></div><div className="asset-info"><div><strong>{file.name}</strong><span>{file.category} · {file.size}</span></div><MoreHorizontal size={18} /></div><div className="asset-meta"><span>Uploaded by you</span><span>{file.date}</span></div></div>)}</div></> }

function Brand() { const colors = [{ name: 'Deep ink', hex: '#1B1E2A', tone: 'ink' }, { name: 'Northstar coral', hex: '#E97861', tone: 'coral' }, { name: 'Warm paper', hex: '#F7F5F0', tone: 'paper' }, { name: 'Moss light', hex: '#C7D7CA', tone: 'moss' }]; return <><PageIntro eyebrow="Brand direction · Version 01" title="A first point of view." description="This is a living board — a place to react, refine and find the feeling before we make it real." action={<button className="outline-button"><MessageCircle size={16} /> Add comment</button>} /><div className="brand-board"><div className="brand-board-head"><div><span className="small-label">NORTHSTAR STUDIO</span><h2>Clear thinking.<br /><em>Beautifully expressed.</em></h2></div><div className="approval-stamp"><Check size={15} /> Awaiting your review</div></div><div className="brand-board-grid"><div className="brand-block mood-block"><span className="small-label">THE FEELING</span><div className="mood-words"><span>Clear</span><span>Thoughtful</span><span>Optimistic</span></div><p>Northstar should feel like a deep breath: considered, capable and quietly confident.</p></div><div className="brand-block palette-block"><span className="small-label">COLOUR PALETTE</span><div className="swatches">{colors.map((color) => <div key={color.name}><span className={`swatch ${color.tone}`} /><strong>{color.name}</strong><code>{color.hex}</code></div>)}</div></div><div className="brand-block type-block"><span className="small-label">TYPE DIRECTION</span><div className="type-sample serif">A thoughtful<br />point of view.</div><div className="type-sample sans">Inter / clean, clear, human</div></div><div className="brand-block visual-block"><span className="small-label">VISUAL LANGUAGE</span><div className="visual-shapes"><span /><span /><span /></div><p>Editorial space, warm neutrals and a confident accent. Images should feel candid, intelligent and full of light.</p></div></div></div><div className="approval-bar"><div><strong>Ready to respond?</strong><span>Approve this direction, or tell Ian what you’d like to explore.</span></div><div><button className="outline-button">Request changes</button><button className="coral-button"><Check size={16} /> Approve direction</button></div></div></> }

function Project({ snapshot }: { snapshot: PortalSnapshot }) { const milestones = ['Discovery', 'Brand direction', 'Content preparation', 'Wireframes', 'Visual design', 'Development', 'Client review', 'Revisions', 'Testing', 'Launch', 'Handover']; return <><PageIntro eyebrow="Project progress" title="A clear path to launch." description="The big picture, without the noise. We’ll keep this timeline current as the work moves forward." /><div className="project-progress"><div className="project-progress-head"><div><span className="small-label">OVERALL PROJECT</span><h2>{snapshot.progress}% complete</h2></div><ProgressRing value={snapshot.progress} /></div><div className="milestone-list">{milestones.map((milestone, index) => <div className={`milestone ${index < 2 ? 'done' : index === 2 ? 'current' : ''}`} key={milestone}><div className="milestone-line"><span className="milestone-dot">{index < 2 ? <Check size={12} /> : index + 1}</span>{index < milestones.length - 1 && <i />}</div><div className="milestone-body"><div><strong>{milestone}</strong><span>{index < 2 ? 'Completed · ' + (index === 0 ? '12 Sep 2026' : 'Coming together now') : index === 2 ? 'Your intake helps us begin' : 'Coming later'}</span></div>{index === 2 && <StatusBadge state="waiting_on_client" />}</div></div>)}</div></div></> }

function Agreement() { return <><PageIntro eyebrow="Agreement · Signed 12 September 2026" title="The details, clearly set out." description="A shared understanding of the work, responsibilities and investment behind Northstar’s new website." action={<button className="outline-button"><FileText size={16} /> Download PDF</button>} /><div className="agreement-layout"><div className="agreement-card"><div className="agreement-heading"><div><span className="small-label">[IAN] STUDIO</span><h2>Website design & development</h2></div><span className="status-badge complete"><Check size={12} /> Complete</span></div><div className="agreement-meta"><div><span>Client</span><strong>Sophie Taylor · Northstar Studio</strong></div><div><span>Start date</span><strong>12 September 2026</strong></div><div><span>Conclusion date</span><strong>24 November 2026</strong></div></div>{['01 · Agreement overview', '02 · Services to be provided', '03 · Payment terms', '04 · Responsibilities of agency', '05 · Responsibilities of client', '06 · Revisions / change requests', '07 · Intellectual property', '08 · Cancellation / termination', '09 · Confidentiality'].map((section, index) => <div className="agreement-section" key={section}><span>{section}</span><ChevronDown size={16} /></div>)}<div className="signature-grid"><div><span>Agency signature</span><strong className="signature">Ian</strong><small>Ian · 12 Sep 2026</small></div><div><span>Client signature</span><strong className="signature">Sophie Taylor</strong><small>Sophie Taylor · 12 Sep 2026</small></div></div></div><aside className="side-note"><div className="note-icon"><ShieldCheck size={18} /></div><h3>Safely on file</h3><p>This agreement is complete and securely recorded for both you and [IAN] Studio.</p><button className="text-button">View activity history <ArrowRight size={15} /></button></aside></div></> }

function Invoices() { return <><PageIntro eyebrow="Invoices" title="The practical details." description="Your invoices are kept here for easy reference. They’re view-only — Ian manages the details." /><div className="invoice-card"><div className="invoice-top"><div><span className="small-label">[IAN] STUDIO · INVOICE</span><h2>#IAN-2026-002</h2></div><span className="status-badge waiting_on_ian">Issued</span></div><div className="invoice-details"><div><span>Issued</span><strong>12 September 2026</strong></div><div><span>Due</span><strong>26 September 2026</strong></div><div><span>Project</span><strong>Northstar website</strong></div></div><div className="invoice-lines"><div className="invoice-line header"><span>Description</span><span>Amount</span></div><div className="invoice-line"><span>Website design & development · Phase 01</span><strong>$2,400.00</strong></div><div className="invoice-line"><span>Brand direction & visual system</span><strong>$1,200.00</strong></div><div className="invoice-total"><span>Total</span><strong>$3,600.00 <small>AUD</small></strong></div></div><div className="invoice-bottom"><p>Payment details are included on your downloadable invoice. Questions? <a href="mailto:hello@ian.studio">Message Ian.</a></p><button className="coral-button"><FileText size={16} /> Download invoice</button></div></div></> }

function Handover() { return <><PageIntro eyebrow="Handover" title="The finish line, thoughtfully done." description="When we launch, everything you need to feel confident looking after your new website will live here." /><div className="handover-hero"><div><span className="small-label">YOUR PROJECT HOME</span><h2>Almost time to hand<br /><em>you the keys.</em></h2><p>Your handover space will appear as we get closer to launch. For now, here’s what we’re working towards.</p></div><div className="handover-orbit"><span>LAUNCH<br />READY</span></div></div><div className="handover-grid">{[['Final website URL', 'Your live website address'], ['Brand files', 'Logo exports and brand board'], ['Documentation', 'A simple guide to your new site'], ['Training material', 'Everything you need to feel at home']].map(([title, detail]) => <div className="handover-card" key={title}><div className="handover-card-icon"><Check size={16} /></div><div><strong>{title}</strong><span>{detail}</span></div><span className="coming-pill">Coming later</span></div>)}</div></> }
