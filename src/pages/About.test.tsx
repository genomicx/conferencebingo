import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { About } from './About'

describe('About page', () => {
  it('renders the About Conference Bingo heading', () => {
    render(<About />)
    expect(screen.getByText('About Conference Bingo')).toBeInTheDocument()
  })

  it('renders the author name', () => {
    render(<About />)
    expect(screen.getByText('Nabil-Fareed Alikhan')).toBeInTheDocument()
  })

  it('renders a link to happykhan.com', () => {
    render(<About />)
    const link = screen.getByRole('link', { name: 'happykhan.com' })
    expect(link).toHaveAttribute('href', 'https://www.happykhan.com')
  })
})
