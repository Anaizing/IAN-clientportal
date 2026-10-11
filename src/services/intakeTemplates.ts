import templateMarkdown from '../content/intake-templates.md?raw'
import type { IntakeQuestion } from './mockPortal'

export type IntakeTemplate = { id: string; name: string; sections: IntakeQuestion[] }

function field(block: string, key: string) {
  return block.match(new RegExp(`^- ${key}: (.+)$`, 'm'))?.[1]?.trim() ?? ''
}

function parseMarkdown(markdown: string): IntakeTemplate[] {
  return markdown.split(/^## /m).slice(1).map((section) => {
    const [name, ...body] = section.split('\n')
    const blocks = body.join('\n').split(/^### /m).slice(1)
    return { id: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: name.trim(), sections: blocks.map((block) => ({ label: field(block, 'question'), helper: field(block, 'helper'), value: '', ...(field(block, 'type') === 'options' ? { options: field(block, 'options').split(',').map((item) => item.trim()).filter(Boolean) } : {}) })) }
  })
}

export const defaultTemplateMarkdown = templateMarkdown
export const defaultTemplates = parseMarkdown(templateMarkdown)

export function getTemplates() {
  return parseMarkdown(localStorage.getItem('ian-intake-templates-md') ?? templateMarkdown)
}

export function templatesFromMarkdown(markdown: string): IntakeTemplate[] {
  return parseMarkdown(markdown)
}

export function getAssignedTemplateId(clientId = 'northstar') {
  return localStorage.getItem(`ian-assigned-template:${clientId}`) ?? defaultTemplates[0]?.id ?? ''
}

export function getAssignedTemplate(clientId = 'northstar') {
  const id = getAssignedTemplateId(clientId)
  const templates = getTemplates()
  return templates.find((template) => template.id === id) ?? templates[0]
}

export function assignTemplate(clientId: string, templateId: string, markdown?: string) {
  if (markdown) localStorage.setItem('ian-intake-templates-md', markdown)
  localStorage.setItem(`ian-assigned-template:${clientId}`, templateId)
}
