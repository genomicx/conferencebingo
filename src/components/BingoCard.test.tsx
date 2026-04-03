import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BingoCard } from './BingoCard'

function makeItems(): (string | number)[] {
  return Array.from({ length: 25 }, (_, i) => (i === 12 ? 'FREE' : `Item ${i + 1}`))
}

describe('BingoCard', () => {
  it('renders a 5x5 grid of 25 cells', () => {
    render(
      <BingoCard
        items={makeItems()}
        checkedCells={new Set()}
        mode="conference"
        onToggleCell={vi.fn()}
      />,
    )
    // The grid itself
    const grid = screen.getByRole('grid')
    expect(grid).toBeInTheDocument()
    // 24 buttons + 1 free-space gridcell
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(24)
    const gridCells = screen.getAllByRole('gridcell')
    expect(gridCells).toHaveLength(1) // FREE space
  })

  it('marks a cell as pressed when clicked', () => {
    const onToggleCell = vi.fn()
    render(
      <BingoCard
        items={makeItems()}
        checkedCells={new Set()}
        mode="conference"
        onToggleCell={onToggleCell}
      />,
    )
    const firstButton = screen.getAllByRole('button')[0]
    fireEvent.click(firstButton)
    expect(onToggleCell).toHaveBeenCalledWith(0)
  })

  it('shows checked state for cells in checkedCells', () => {
    render(
      <BingoCard
        items={makeItems()}
        checkedCells={new Set([0])}
        mode="conference"
        onToggleCell={vi.fn()}
      />,
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'true')
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows BINGO banner when a winning line is completed', () => {
    // Row 0: cells 0-4
    render(
      <BingoCard
        items={makeItems()}
        checkedCells={new Set([0, 1, 2, 3, 4])}
        mode="conference"
        onToggleCell={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('BINGO!')
  })

  it('does not show BINGO banner when no winning line', () => {
    render(
      <BingoCard
        items={makeItems()}
        checkedCells={new Set([0, 1, 2])}
        mode="conference"
        onToggleCell={vi.fn()}
      />,
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
