import { useState, useEffect, useRef } from 'react'
import { KeyboardIcon, RotateCcwIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import {
  SHORTCUT_DEFS,
  getShortcutMap,
  saveShortcutOverride,
  resetShortcuts,
  formatKeyCombo,
  type ShortcutAction,
  type ShortcutMap,
} from '@/lib/shortcuts'

function KeyBadge({ combo }: { combo: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {combo.split('+').map((part) => (
        <kbd
          key={part}
          className="px-1.5 py-0.5 text-xs font-mono rounded border border-border bg-muted text-foreground shadow-sm"
        >
          {part}
        </kbd>
      ))}
    </span>
  )
}

export default function Shortcuts() {
  const [map, setMap] = useState<ShortcutMap>(getShortcutMap)
  const [recording, setRecording] = useState<ShortcutAction | null>(null)
  const recordingRef = useRef<ShortcutAction | null>(null)

  useEffect(() => {
    recordingRef.current = recording
  }, [recording])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!recordingRef.current) return
      e.preventDefault()
      e.stopPropagation()
      const combo = formatKeyCombo(e)
      if (combo === 'Escape') {
        setRecording(null)
        return
      }
      const hasNonModifier = !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)
      if (!hasNonModifier) return
      const action = recordingRef.current
      saveShortcutOverride(action, combo)
      setMap(getShortcutMap())
      setRecording(null)
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [])

  function handleReset() {
    resetShortcuts()
    setMap(getShortcutMap())
  }

  const navigation = SHORTCUT_DEFS.filter((d) => d.category === 'navigation')
  const actions = SHORTCUT_DEFS.filter((d) => d.category === 'action')

  return (
    <div className="p-4 md:p-6 w-full space-y-6">
      <PageHeader
        title="Atalhos de teclado"
        subtitle="Personalize as teclas de navegação e ações rápidas"
      />

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyboardIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Atalhos de Teclado</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcwIcon className="w-3.5 h-3.5" />
            Restaurar padrões
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Clique em um atalho para gravá-lo. Pressione <KeyBadge combo="Escape" /> para cancelar.
        </p>

        <ShortcutGroup
          title="Navegação"
          defs={navigation}
          map={map}
          recording={recording}
          onStartRecord={setRecording}
        />
        <ShortcutGroup
          title="Ações"
          defs={actions}
          map={map}
          recording={recording}
          onStartRecord={setRecording}
        />
      </div>
    </div>
  )
}

function ShortcutGroup({
  title,
  defs,
  map,
  recording,
  onStartRecord,
}: {
  title: string
  defs: typeof SHORTCUT_DEFS
  map: ShortcutMap
  recording: ShortcutAction | null
  onStartRecord: (action: ShortcutAction) => void
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {defs.map((def) => {
          const isRecording = recording === def.action
          return (
            <div key={def.action} className="flex items-center justify-between px-4 py-3 bg-background">
              <div>
                <p className="text-sm font-medium text-foreground">{def.label}</p>
                <p className="text-xs text-muted-foreground">{def.description}</p>
              </div>
              <button
                type="button"
                onClick={() => onStartRecord(def.action)}
                className={[
                  'ml-4 px-3 py-1.5 rounded-md border text-xs font-mono transition-colors',
                  isRecording
                    ? 'border-primary bg-primary/10 text-primary animate-pulse'
                    : 'border-border bg-muted hover:bg-muted/80 text-foreground',
                ].join(' ')}
              >
                {isRecording ? 'Aguardando tecla...' : <KeyBadge combo={map[def.action]} />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
