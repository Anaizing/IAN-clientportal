import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, MoreHorizontal, Search, Users } from 'lucide-react'
import type { PortalPage } from '../services/mockPortal'
import { ThemeToggle } from './ThemeToggle'
import { assignTemplate, defaultTemplateMarkdown, defaultTemplates, templatesFromMarkdown } from '../services/intakeTemplates'

type AdminClient = { id: string; name: string; initials: string; company: string; project: string; progress: number; status: 'Your action' | 'With Ian' | 'Complete'; intake: 'Not started' | 'In progress' | 'Complete'; lastActivity: string; due: string; active: boolean }

const seedClients: AdminClient[] = [
  { id: 'northstar', name: 'Sophie Taylor', initials: 'ST', company: 'Northstar Studio', project: 'A digital home for Northstar', progress: 38, status: 'Your action', intake: 'In progress', lastActivity: '2 hours ago', due: '24 Nov 2026', active: true },
  { id: 'fieldwork', name: 'Marcus Lee', initials: 'ML', company: 'Fieldwork Advisory', project: 'A sharper digital presence', progress: 72, status: 'With Ian', intake: 'Complete', lastActivity: 'Yesterday', due: '08 Nov 2026', active: true },
  { id: 'atlas', name: 'Amelia Chen', initials: 'AC', company: 'Atlas Objects', project: 'A new home for Atlas', progress: 100, status: 'Complete', intake: 'Complete', lastActivity: '18 Sep 2026', due: 'Complete', active: true },
]

function readClients(): AdminClient[] { try { return JSON.parse(localStorage.getItem('ian-admin-clients') || 'null') ?? seedClients } catch { return seedClients } }
function writeClients(items: AdminClient[]) { localStorage.setItem('ian-admin-clients', JSON.stringify(items)) }

export function AdminPortal({ detailId, onRoute }: { detailId?: string; onRoute: (page: PortalPage) => void }) {
  const [clients, setClients] = useState(readClients)
  const client = clients.find((item) => item.id === detailId)
  if (client) return <AdminDetail client={client} onBack={() => onRoute('admin-clients')} />
  return <AdminDirectory clients={clients} onClientsChange={(next) => { setClients(next); writeClients(next) }} onOpen={(id) => { window.location.hash = `#/admin/clients/${id}` }} />
}

function AdminShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return <div className="admin-shell"><header className="admin-topbar"><div className="admin-brand"><span>[IAN]</span><small>STUDIO · ADMIN</small></div><div className="admin-user"><ThemeToggle admin /><span className="admin-avatar">IS</span><span>Ian Studio</span><MoreHorizontal size={17} /></div></header><main className="admin-main"><div className="admin-heading"><div><span className="admin-eyebrow">Client workspace</span><h1>{title}</h1><p>{subtitle}</p></div><span className="admin-secure">Private admin view</span></div>{children}</main></div>
}

function AdminDirectory({ clients, onClientsChange, onOpen }: { clients: AdminClient[]; onClientsChange: (clients: AdminClient[]) => void; onOpen: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'All' | AdminClient['status']>('All')
  const [showInactive, setShowInactive] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', company: '', project: '' })
  const visibleClients = clients.filter((client) => showInactive ? !client.active : client.active)
  const filtered = useMemo(() => visibleClients.filter((client) => `${client.name} ${client.company} ${client.project}`.toLowerCase().includes(query.toLowerCase()) && (filter === 'All' || client.status === filter)), [visibleClients, query, filter])
  const createClient = () => { if (!newClient.name.trim() || !newClient.company.trim()) return; const id = newClient.company.toLowerCase().replace(/[^a-z0-9]+/g, '-'); const initials = newClient.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); onClientsChange([...clients, { id, name: newClient.name.trim(), initials, company: newClient.company.trim(), project: newClient.project.trim() || 'New website project', progress: 0, status: 'Your action', intake: 'Not started', lastActivity: 'Just now', due: 'To be set', active: true }]); setNewClient({ name: '', company: '', project: '' }); setCreating(false) }
  const archiveClient = (id: string) => onClientsChange(clients.map((client) => client.id === id ? { ...client, active: false } : client))
  return <AdminShell title="Your clients, at a glance." subtitle="A quiet view of every active portal, what needs your attention, and where each project stands.">
    <div className="admin-directory-actions"><button className="admin-primary" onClick={() => setCreating((value) => !value)}>+ New client</button><button className="admin-outline" onClick={() => setShowInactive((value) => !value)}>{showInactive ? 'Show active clients' : `View inactive (${clients.filter((client) => !client.active).length})`}</button></div>
    {creating && <div className="client-create"><input placeholder="Client name" value={newClient.name} onChange={(event) => setNewClient({ ...newClient, name: event.target.value })} /><input placeholder="Business name" value={newClient.company} onChange={(event) => setNewClient({ ...newClient, company: event.target.value })} /><input placeholder="Project name (optional)" value={newClient.project} onChange={(event) => setNewClient({ ...newClient, project: event.target.value })} /><button className="admin-primary" onClick={createClient}>Create client <CheckCircle2 size={15} /></button></div>}
    <div className="admin-stats"><div><Users size={18} /><strong>{clients.filter((client) => client.active).length}</strong><span>Active portals</span></div><div><Clock3 size={18} /><strong>{clients.filter((client) => client.active && client.status === 'Your action').length}</strong><span>Waiting on client</span></div><div><CheckCircle2 size={18} /><strong>{clients.filter((client) => client.active && client.status === 'Complete').length}</strong><span>Completed</span></div></div>
    <section className="admin-panel"><div className="admin-toolbar"><label className="admin-search"><Search size={16} /><input aria-label="Search clients" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clients" /></label><div className="admin-filters">{(['All', 'Your action', 'With Ian', 'Complete'] as const).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="admin-client-list">{filtered.map((client) => <div className="admin-client-row" key={client.id}><button className="admin-client-open" onClick={() => onOpen(client.id)}><span className="admin-client-avatar">{client.initials}</span><span className="admin-client-info"><strong>{client.name}</strong><small>{client.company} · {client.project}</small></span><span className="admin-progress"><span><i style={{ width: `${client.progress}%` }} /></span><small>{client.progress}%</small></span><span className={`admin-status ${client.status.toLowerCase().replace(' ', '-')}`}>{client.status}</span><span className="admin-activity"><small>{client.lastActivity}</small><em>Due {client.due}</em></span><ArrowRight size={17} /></button>{!showInactive && <button className="admin-archive" onClick={() => archiveClient(client.id)}>Archive</button>}</div>)}{filtered.length === 0 && <div className="admin-empty">No client portals match your search.</div>}</div></section>
    <TemplateManager clients={clients.filter((client) => client.active)} />
  </AdminShell>
}

function TemplateManager({ clients }: { clients: AdminClient[] }) {
  const [markdown, setMarkdown] = useState(defaultTemplateMarkdown)
  const [selected, setSelected] = useState(defaultTemplates[0]?.id ?? '')
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id ?? '')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const templates = useMemo(() => templatesFromMarkdown(markdown), [markdown])
  const createTemplate = () => { const name = newName.trim(); if (!name) return; const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-'); const nextMarkdown = `${markdown.trim()}\n\n## ${name}\n\n### Business overview\n- question: What should we know about this business?\n- helper: Start with the simple version.\n- type: textarea\n`; setMarkdown(nextMarkdown); setNewName(''); setCreating(false); setSelected(slug) }
  return <section className="template-manager"><div className="template-manager-head"><div><span className="admin-eyebrow">Intake templates</span><h2>Shape the questions for each business.</h2><p>Edit the Markdown template in the editor, then assign a business type to a client.</p></div><div className="template-head-actions"><span className="template-count">{templates.length} templates · {templates.reduce((count, item) => count + item.sections.length, 0)} sections</span><button className="admin-outline" onClick={() => setCreating((value) => !value)}>+ New template</button></div></div>{creating && <div className="template-create"><input aria-label="New template name" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="New business type, e.g. Health practice" /><button className="admin-primary" onClick={createTemplate}>Create template <CheckCircle2 size={15} /></button></div>}<div className="template-manager-grid"><label className="template-editor"><span>Editable Markdown source</span><textarea value={markdown} onChange={(event) => setMarkdown(event.target.value)} spellCheck={false} /></label><div className="template-assign"><span>Existing templates</span><div className="template-buttons">{templates.map((template) => <button key={template.id} className={selected === template.id ? 'active' : ''} onClick={() => setSelected(template.id)}>{template.name}<small>{template.sections.length} questions</small></button>)}</div><span>Assign to client</span><select aria-label="Choose client" value={selectedClient} onChange={(event) => setSelectedClient(event.target.value)}>{clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}</select><span>Business type template</span><select aria-label="Choose intake template" value={selected} onChange={(event) => setSelected(event.target.value)}>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select><button className="admin-primary" onClick={() => assignTemplate(selectedClient, selected, markdown)}>Assign template <CheckCircle2 size={15} /></button><small>Changes are applied to the selected client intake when it is reopened.</small></div></div></section>
}

function AdminDetail({ client, onBack }: { client: AdminClient; onBack: () => void }) {
  return <AdminShell title={client.name} subtitle={`${client.company} · ${client.project}`}>
    <button className="admin-back" onClick={onBack}><ArrowLeft size={15} /> All clients</button>
    <div className="admin-detail-grid"><section className="admin-panel admin-detail-main"><div className="admin-detail-hero"><div className="admin-client-avatar large">{client.initials}</div><div><span className="admin-eyebrow">Portal overview</span><h2>{client.company}</h2><p>{client.name} · target launch {client.due}</p></div><button className="admin-outline" onClick={() => { window.location.hash = '#/home' }}>Open client portal <ArrowRight size={15} /></button></div><div className="admin-detail-progress"><div><span>Project progress</span><strong>{client.progress}%</strong></div><div className="admin-progress large"><span><i style={{ width: `${client.progress}%` }} /></span></div></div><div className="admin-detail-cards"><div><span>Intake</span><strong>{client.intake}</strong><small>{client.intake === 'Complete' ? 'Ready for studio review' : 'Client action required'}</small></div><div><span>Current status</span><strong>{client.status}</strong><small>Last activity {client.lastActivity}</small></div></div></section><aside className="admin-panel admin-side-panel"><span className="admin-eyebrow">Next action</span><h3>{client.status === 'Your action' ? 'Follow up on intake' : client.status === 'Complete' ? 'Prepare handover' : 'Continue the project'}</h3><p>{client.status === 'Your action' ? 'The client has an open action in their portal.' : 'Keep the client moving with a clear next step.'}</p><button className="admin-primary">Message client <ArrowRight size={15} /></button></aside></div>
  </AdminShell>
}
