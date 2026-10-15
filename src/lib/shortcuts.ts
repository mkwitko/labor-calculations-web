const STORAGE_KEY = 'LexLaboral:keyboard-shortcuts'

export type ShortcutAction =
  | 'go-home'
  | 'go-cases'
  | 'go-agenda'
  | 'go-calculations'
  | 'go-workflow'
  | 'go-clients'
  | 'go-profile'
  | 'go-billing'
  | 'go-settings'
  | 'new-calculation'
  | 'new-client'
  | 'focus-search'

export type ShortcutDef = {
  action: ShortcutAction
  label: string
  description: string
  defaultKey: string
  category: 'navigation' | 'action'
}

export const SHORTCUT_DEFS: ShortcutDef[] = [
  {
    action: 'go-home',
    label: 'Ir para Painel',
    description: 'Navega para a página inicial',
    defaultKey: 'Alt+1',
    category: 'navigation',
  },
  {
    action: 'go-cases',
    label: 'Ir para Casos',
    description: 'Navega para a lista de cálculos',
    defaultKey: 'Alt+2',
    category: 'navigation',
  },
  {
    action: 'go-agenda',
    label: 'Ir para Agenda',
    description: 'Navega para a Agenda',
    defaultKey: 'Alt+3',
    category: 'navigation',
  },
  {
    action: 'go-calculations',
    label: 'Ir para Cálculos',
    description: 'Navega para a lista de cálculos',
    defaultKey: 'Alt+4',
    category: 'navigation',
  },
  {
    action: 'go-workflow',
    label: 'Ir para Workflow',
    description: 'Navega para o kanban de processos',
    defaultKey: 'Alt+5',
    category: 'navigation',
  },
  {
    action: 'go-clients',
    label: 'Ir para Clientes',
    description: 'Navega para a lista de clientes',
    defaultKey: 'Alt+6',
    category: 'navigation',
  },
  {
    action: 'go-profile',
    label: 'Ir para Perfil',
    description: 'Navega para as configurações de perfil',
    defaultKey: 'Alt+7',
    category: 'navigation',
  },
  {
    action: 'go-billing',
    label: 'Ir para Assinatura',
    description: 'Navega para a página de assinatura',
    defaultKey: 'Alt+8',
    category: 'navigation',
  },
  {
    action: 'go-settings',
    label: 'Ir para Configurações',
    description: 'Navega para a página de atalhos',
    defaultKey: 'Alt+9',
    category: 'navigation',
  },
  {
    action: 'new-calculation',
    label: 'Novo Cálculo',
    description: 'Abre o formulário de novo cálculo',
    defaultKey: 'Alt+N',
    category: 'action',
  },
  {
    action: 'new-client',
    label: 'Novo Cliente',
    description: 'Abre o formulário de novo cliente',
    defaultKey: 'Alt+C',
    category: 'action',
  },
  {
    action: 'focus-search',
    label: 'Focar busca',
    description: 'Foca o campo de busca na página atual',
    defaultKey: '/',
    category: 'action',
  },
]

export type ShortcutMap = Record<ShortcutAction, string>

function loadFromStorage(): Partial<ShortcutMap> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function getShortcutMap(): ShortcutMap {
  const overrides = loadFromStorage()
  return Object.fromEntries(
    SHORTCUT_DEFS.map((def) => [def.action, overrides[def.action] ?? def.defaultKey]),
  ) as ShortcutMap
}

export function saveShortcutOverride(action: ShortcutAction, key: string): void {
  const overrides = loadFromStorage()
  overrides[action] = key
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

export function resetShortcuts(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function formatKeyCombo(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.ctrlKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')
  if (e.metaKey) parts.push('Meta')
  const key = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
    parts.push(key)
  }
  return parts.join('+')
}

export function matchesKeyCombo(e: KeyboardEvent, combo: string): boolean {
  return formatKeyCombo(e) === combo
}
