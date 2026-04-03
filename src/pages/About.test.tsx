import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { About } from './About'

function renderAbout() {
  return render(<MemoryRouter><About /></MemoryRouter>)
}

describe('About page', () => {
  it('renders the About Conference Bingo heading', () => {
    renderAbout()
    expect(screen.getByText('About Conference Bingo')).toBeInTheDocument()
  })

  it('renders the author name', () => {
    renderAbout()
    expect(screen.getByText('Nabil-Fareed Alikhan')).toBeInTheDocument()
  })

  it('renders a link to happykhan.com', () => {
    renderAbout()
    const link = screen.getByRole('link', { name: 'happykhan.com' })
    expect(link).toHaveAttribute('href', 'https://www.happykhan.com')
  })
})
