import { useState } from 'react'
import type { BingoMode } from '../bingo/engine'

interface ShareButtonProps {
  seed: string
  mode: BingoMode
  preset: string
}

export function ShareButton({ seed, mode, preset }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const url = new URL(window.location.href)
    url.searchParams.set('seed', seed)
    url.searchParams.set('mode', mode)
    if (mode === 'conference' && preset !== 'generic') {
      url.searchParams.set('preset', preset)
    } else {
      url.searchParams.delete('preset')
    }
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      className="gx-btn gx-btn-secondary gx-btn-sm"
      onClick={handleShare}
      aria-label="Copy share link to clipboard"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginRight: '4px', verticalAlign: '-2px' }}
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
