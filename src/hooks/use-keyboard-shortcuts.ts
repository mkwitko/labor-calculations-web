import {
  getShortcutMap,
  matchesKeyCombo,
  type ShortcutAction,
  SHORTCUT_DEFS,
} from '@/lib/shortcuts'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const SHORTCUT_LABELS = Object.fromEntries(
  SHORTCUT_DEFS.map((d) => [d.action, d.label]),
) as Record<ShortcutAction, string>

/** Toast informing which key combo triggered which action. */
function announceShortcut(action: ShortcutAction, map: Record<ShortcutAction, string>) {
  toast(SHORTCUT_LABELS[action], {
    description: `Atalho ${map[action]}`,
    duration: 1500,
  })
}

const SHORTCUT_ROUTES: Partial<Record<ShortcutAction, string>> = {
  'go-home': '/home',
  "go-cases": "/cases",
  "go-agenda": "/agenda",
  'go-calculations': '/calculations',
  'go-workflow': '/workflow',
  'go-clients': '/clients',
  'go-profile': '/profile',
  'go-billing': '/billing',
  'go-settings': '/settings',
  'new-calculation': '/calculations/new',
  'new-client': '/clients/new',
}

function isEditableTarget(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement).tagName
  const isContentEditable = (e.target as HTMLElement).isContentEditable
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || isContentEditable
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const map = getShortcutMap()

      function matches(action: ShortcutAction): boolean {
        return matchesKeyCombo(e, map[action])
      }

      for (const [action, path] of Object.entries(SHORTCUT_ROUTES)) {
        if (matches(action as ShortcutAction)) {
          e.preventDefault()
          announceShortcut(action as ShortcutAction, map)
          navigate(path!)
          return
        }
      }

      const hasModifier = e.ctrlKey || e.altKey || e.metaKey

      if (isEditableTarget(e) && !hasModifier) return

      if (matches('focus-search')) {
        e.preventDefault()
        announceShortcut('focus-search', map)
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[data-search], input[type="search"]',
        )
        searchInput?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
}
