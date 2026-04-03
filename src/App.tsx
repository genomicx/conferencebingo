import { Routes, Route } from 'react-router-dom'
import { NavBar, AppFooter } from '@genomicx/ui'
import { useEffect } from 'react'
import { BingoPage } from './pages/BingoPage'
import { About } from './pages/About'
import './App.css'

export default function App() {
  useEffect(() => {
    const saved = (localStorage.getItem('gx-theme') as 'light' | 'dark') || 'dark'
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  return (
    <div className="app">
      <NavBar appName="Conference Bingo" appSubtitle="for your next conference" version="0.1.0" icon={
        <svg className="gx-nav-logo-icon" viewBox="0 0 24 24" fill="none" stroke="var(--gx-accent)" strokeWidth="1.5">
          {/* 3x3 bingo-style grid */}
          <rect x="3" y="3" width="5" height="5" />
          <rect x="10" y="3" width="5" height="5" />
          <rect x="17" y="3" width="5" height="5" />
          <rect x="3" y="10" width="5" height="5" fill="var(--gx-accent)" />
          <rect x="10" y="10" width="5" height="5" />
          <rect x="17" y="10" width="5" height="5" />
          <rect x="3" y="17" width="5" height="5" />
          <rect x="10" y="17" width="5" height="5" />
          <rect x="17" y="17" width="5" height="5" fill="var(--gx-accent)" />
        </svg>
      } />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<BingoPage />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <AppFooter appName="Conference Bingo" bugReportUrl="https://github.com/genomicx/conferencebingo/issues" />
    </div>
  )
}
