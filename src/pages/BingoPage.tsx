import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BingoCard } from '../components/BingoCard'
import { PresetSelector } from '../components/PresetSelector'
import { ShareButton } from '../components/ShareButton'
import {
  generateConferenceCard,
  generateNumberCard,
  generateRandomSeed,
  saveCheckedState,
  loadCheckedState,
  clearCheckedState,
  type BingoMode,
} from '../bingo/engine'
import { exportPNG, exportPDF } from '../bingo/export'

export function BingoPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [mode, setMode] = useState<BingoMode>('conference')
  const [preset, setPreset] = useState('generic')
  const [seed, setSeed] = useState('')
  const [seedInput, setSeedInput] = useState('')
  const [items, setItems] = useState<(string | number)[]>([])
  const [checkedCells, setCheckedCells] = useState<Set<number>>(new Set())
  const [cardVisible, setCardVisible] = useState(false)
  const [customItems, setCustomItems] = useState<string[] | null>(null)
  const [customText, setCustomText] = useState('')
  const [customStatus, setCustomStatus] = useState<{ type: 'warning' | 'info'; message: string } | null>(null)
  const [customOpen, setCustomOpen] = useState(false)
  const [pngExporting, setPngExporting] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  // Load from URL on mount
  useEffect(() => {
    const urlSeed = searchParams.get('seed')
    const urlMode = searchParams.get('mode') as BingoMode | null
    const urlPreset = searchParams.get('preset')

    const resolvedMode: BingoMode = urlMode === 'number' ? 'number' : 'conference'
    const resolvedPreset = urlPreset ?? 'generic'

    setMode(resolvedMode)
    setPreset(resolvedPreset)

    if (urlSeed) {
      setSeedInput(urlSeed)
      generateCard(urlSeed, resolvedMode, resolvedPreset, null, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function generateCard(
    rawSeed: string,
    cardMode: BingoMode,
    cardPreset: string,
    custom: string[] | null,
    fresh: boolean,
  ) {
    const resolvedSeed = rawSeed.trim().toUpperCase() || generateRandomSeed()
    setSeedInput(resolvedSeed)
    setSeed(resolvedSeed)

    let newItems: (string | number)[] | null
    if (cardMode === 'conference') {
      newItems = generateConferenceCard(resolvedSeed, cardPreset, custom ?? undefined)
      if (!newItems) {
        setCustomStatus({ type: 'warning', message: 'Need at least 24 items.' })
        return
      }
    } else {
      newItems = generateNumberCard(resolvedSeed)
    }

    const newChecked = fresh
      ? new Set<number>()
      : loadCheckedState(cardMode, cardPreset, resolvedSeed)

    if (fresh) {
      clearCheckedState(cardMode, cardPreset, resolvedSeed)
    }

    setItems(newItems)
    setCheckedCells(newChecked)
    setCardVisible(true)

    // Update URL
    const params: Record<string, string> = { seed: resolvedSeed, mode: cardMode }
    if (cardMode === 'conference' && cardPreset !== 'generic') {
      params['preset'] = cardPreset
    }
    setSearchParams(params, { replace: true })
  }

  function handleToggleCell(index: number) {
    setCheckedCells((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      saveCheckedState(mode, preset, seed, next)
      return next
    })
  }

  function handleGenerate() {
    generateCard(seedInput, mode, preset, customItems, false)
  }

  function handleRandom() {
    const newSeed = generateRandomSeed()
    setSeedInput(newSeed)
    generateCard(newSeed, mode, preset, customItems, true)
  }

  function handleModeChange(newMode: BingoMode) {
    setMode(newMode)
    setCardVisible(false)
  }

  function handlePresetChange(newPreset: string) {
    setPreset(newPreset)
    setCustomItems(null)
    setCustomText('')
    setCustomStatus(null)
    setCardVisible(false)
  }

  function handleUseCustom() {
    const lines = customText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
    if (lines.length < 24) {
      setCustomStatus({ type: 'warning', message: `Need at least 24 items. Found ${lines.length}.` })
      return
    }
    setCustomItems(lines)
    setCustomStatus({ type: 'info', message: `Loaded ${lines.length} custom items. Generate a card to use them.` })
  }

  function handleResetCustom() {
    setCustomItems(null)
    setCustomText('')
    setCustomStatus(null)
  }

  function handleFileUpload(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCustomText(text)
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
      if (lines.length < 24) {
        setCustomStatus({ type: 'warning', message: `Need at least 24 items. Found ${lines.length}.` })
        return
      }
      setCustomItems(lines)
      setCustomStatus({ type: 'info', message: `Loaded ${lines.length} custom items. Generate a card to use them.` })
    }
    reader.readAsText(file)
  }

  function handleReset() {
    const cleared = new Set<number>()
    setCheckedCells(cleared)
    saveCheckedState(mode, preset, seed, cleared)
  }

  function handleNewCard() {
    const newSeed = generateRandomSeed()
    setSeedInput(newSeed)
    generateCard(newSeed, mode, preset, customItems, true)
  }

  async function handleExportPNG() {
    if (!cardRef.current) return
    setPngExporting(true)
    try {
      await exportPNG(cardRef.current, seed, mode, preset)
    } finally {
      setPngExporting(false)
    }
  }

  async function handleExportPDF() {
    await exportPDF(items, checkedCells, seed, mode, preset)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files[0])
  }

  return (
    <div className="bingo-page">
      {/* Hero */}
      <div className="hero-compact">
        <h1>
          Conference <span className="gx-accent">Bingo</span>
        </h1>
        <p>
          Generate shareable bingo cards for your next conference. Click squares to mark them,
          detect winning lines, and export to PDF.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="mode-tabs" role="tablist">
        {(['conference', 'number'] as BingoMode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={`mode-tab${mode === m ? ' active' : ''}`}
            onClick={() => handleModeChange(m)}
          >
            {m === 'conference' ? 'Conference Bingo' : 'Number Bingo'}
          </button>
        ))}
      </div>

      {/* Settings Panel */}
      <div className="settings-panel">
        <div className="seed-row">
          <input
            type="text"
            className="gx-input"
            placeholder="Enter seed code or leave blank for random"
            maxLength={20}
            autoComplete="off"
            spellCheck={false}
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate() }}
            aria-label="Seed code"
          />
          <button className="gx-btn gx-btn-primary" onClick={handleGenerate}>
            Generate
          </button>
          <button className="gx-btn gx-btn-secondary" onClick={handleRandom}>
            Random
          </button>
        </div>

        {/* Conference-only options */}
        {mode === 'conference' && (
          <div className="custom-section">
            <PresetSelector value={preset} onChange={handlePresetChange} />

            <button
              className={`custom-toggle-btn${customOpen ? ' open' : ''}`}
              onClick={() => setCustomOpen((o) => !o)}
              aria-expanded={customOpen}
            >
              <span className="arrow">{customOpen ? '▼' : '▶'}</span> Custom Items
            </button>

            {customOpen && (
              <div className="custom-body open">
                <div
                  className="file-drop"
                  role="button"
                  tabIndex={0}
                  aria-label="Drop a text file or click to upload"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('custom-file-input')?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      document.getElementById('custom-file-input')?.click()
                    }
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div>Drop a .txt file here or click to upload</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.7 }}>
                    One item per line, at least 24 items
                  </div>
                </div>
                <input
                  type="file"
                  id="custom-file-input"
                  accept=".txt"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.length) handleFileUpload(e.target.files[0])
                  }}
                />
                <textarea
                  className="custom-textarea"
                  placeholder="Or paste your items here, one per line..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  aria-label="Custom bingo items"
                />
                <div className="custom-btn-row">
                  <button className="gx-btn gx-btn-primary gx-btn-sm" onClick={handleUseCustom}>
                    Use Custom Items
                  </button>
                  <button className="gx-btn gx-btn-secondary gx-btn-sm" onClick={handleResetCustom}>
                    Reset to Defaults
                  </button>
                </div>
                {customStatus && (
                  <div className={`alert alert-${customStatus.type}`} role="status">
                    <span>{customStatus.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bingo Card */}
      {cardVisible && items.length > 0 && (
        <div className="card-section">
          <div ref={cardRef} className="card-ref">
            <BingoCard
              items={items}
              checkedCells={checkedCells}
              mode={mode}
              onToggleCell={handleToggleCell}
            />
          </div>

          {/* Status bar */}
          <div className="status-bar">
            <div
              className="seed-display"
              title="Click to copy seed"
              role="button"
              tabIndex={0}
              aria-label={`Seed: ${seed}. Click to copy.`}
              onClick={() => {
                navigator.clipboard.writeText(seed)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigator.clipboard.writeText(seed)
              }}
            >
              <span className="seed-label">Seed:</span>
              <span className="seed-code">{seed}</span>
            </div>
            <ShareButton seed={seed} mode={mode} preset={preset} />
          </div>

          {/* Action buttons */}
          <div className="action-row">
            <div className="action-group">
              <button className="gx-btn gx-btn-primary" onClick={handleExportPDF}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: '-2px' }} aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export PDF
              </button>
              <button
                className="gx-btn gx-btn-primary"
                onClick={handleExportPNG}
                disabled={pngExporting}
                aria-busy={pngExporting}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: '-2px' }} aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                {pngExporting ? 'Exporting...' : 'Export PNG'}
              </button>
            </div>
            <div className="action-group">
              <button className="gx-btn gx-btn-secondary" onClick={handleReset}>
                Reset Card
              </button>
              <button className="gx-btn gx-btn-secondary" onClick={handleNewCard}>
                New Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
