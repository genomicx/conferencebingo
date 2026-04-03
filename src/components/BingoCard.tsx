import type { BingoMode } from '../bingo/engine'
import { checkBingo } from '../bingo/engine'

interface BingoCardProps {
  items: (string | number)[]
  checkedCells: Set<number>
  mode: BingoMode
  onToggleCell: (index: number) => void
}

export function BingoCard({ items, checkedCells, mode, onToggleCell }: BingoCardProps) {
  const winLine = checkBingo(checkedCells)
  const winSet = new Set(winLine ?? [])
  const hasBingo = winLine !== null

  return (
    <div className="bingo-card-wrapper">
      {hasBingo && (
        <div className="bingo-banner" role="alert" aria-live="polite">
          BINGO!
        </div>
      )}

      <div className="bingo-card" data-testid="bingo-card">
        {mode === 'number' && (
          <div className="bingo-headers" aria-hidden="true">
            {'BINGO'.split('').map((letter) => (
              <div key={letter} className="bingo-header-cell">
                {letter}
              </div>
            ))}
          </div>
        )}

        {mode === 'conference' && (
          <div className="bingo-card-title">B I N G O</div>
        )}

        <div className="bingo-grid" role="grid" aria-label="Bingo card">
          {items.map((item, i) => {
            const isFree = i === 12
            const isChecked = isFree || checkedCells.has(i)
            const isWinning = winSet.has(i)

            return (
              <div
                key={i}
                role={isFree ? 'gridcell' : 'button'}
                aria-pressed={!isFree ? isChecked : undefined}
                aria-label={isFree ? 'Free space' : String(item)}
                className={[
                  'bingo-cell',
                  mode === 'number' && !isFree ? 'number-mode' : '',
                  isFree ? 'free-space checked' : '',
                  !isFree && isChecked ? 'checked' : '',
                  isWinning ? 'winning' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={isFree ? undefined : () => onToggleCell(i)}
                tabIndex={isFree ? -1 : 0}
                onKeyDown={
                  isFree
                    ? undefined
                    : (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onToggleCell(i)
                        }
                      }
                }
              >
                {isFree ? 'FREE SPACE' : String(item)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
