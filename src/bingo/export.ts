import type { BingoMode } from './engine'

export async function exportPNG(
  cardElement: HTMLElement,
  seed: string,
  mode: BingoMode,
  preset: string,
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(cardElement, {
    scale: 2,
    backgroundColor: null,
    useCORS: true,
  })
  const link = document.createElement('a')
  const prefix = mode === 'conference'
    ? (preset !== 'generic' ? preset : 'conference')
    : 'number'
  link.download = `bingo-${prefix}-${seed}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function exportPDF(
  items: (string | number)[],
  checkedCells: Set<number>,
  seed: string,
  mode: BingoMode,
  preset: string,
): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const gridW = pageW - margin * 2
  const cellW = gridW / 5
  const cellH = mode === 'conference' ? 28 : 24
  let startY = 50

  // Title
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  const title = mode === 'conference' ? 'Conference Bingo' : 'Number Bingo'
  doc.text(title, pageW / 2, 25, { align: 'center' })

  // Seed
  doc.setFontSize(10)
  doc.setFont('courier', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('Seed: ' + seed, pageW / 2, 35, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // B-I-N-G-O headers for number mode
  if (mode === 'number') {
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    'BINGO'.split('').forEach((letter, col) => {
      const x = margin + col * cellW
      doc.setFillColor(13, 148, 136)
      doc.rect(x, startY, cellW, 12, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text(letter, x + cellW / 2, startY + 9, { align: 'center' })
    })
    startY += 14
    doc.setTextColor(0, 0, 0)
  }

  // Draw cells
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const i = row * 5 + col
      const x = margin + col * cellW
      const y = startY + row * cellH

      if (i === 12) {
        doc.setFillColor(13, 148, 136)
        doc.rect(x, y, cellW, cellH, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text('FREE', x + cellW / 2, y + cellH / 2 - 1, { align: 'center' })
        doc.text('SPACE', x + cellW / 2, y + cellH / 2 + 4, { align: 'center' })
      } else if (checkedCells.has(i)) {
        doc.setFillColor(209, 250, 229)
        doc.rect(x, y, cellW, cellH, 'FD')
        doc.setTextColor(13, 148, 136)
      } else {
        doc.setFillColor(255, 255, 255)
        doc.rect(x, y, cellW, cellH, 'FD')
        doc.setTextColor(51, 65, 85)
      }

      if (i !== 12) {
        const text = String(items[i])
        if (mode === 'number') {
          doc.setFontSize(16)
          doc.setFont('helvetica', 'bold')
          doc.text(text, x + cellW / 2, y + cellH / 2 + 2, { align: 'center' })
        } else {
          doc.setFontSize(7)
          doc.setFont('helvetica', 'normal')
          const lines = doc.splitTextToSize(text, cellW - 4)
          const lineH = 3.2
          const totalH = (lines as string[]).length * lineH
          const textY = y + (cellH - totalH) / 2 + lineH
          ;(lines as string[]).forEach((line, li) => {
            doc.text(line, x + cellW / 2, textY + li * lineH, { align: 'center' })
          })
        }
      }

      doc.setDrawColor(200, 200, 200)
      doc.rect(x, y, cellW, cellH)
      doc.setTextColor(0, 0, 0)
    }
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(170, 170, 170)
  doc.text('conferencebingo.vercel.app', pageW / 2, pageH - 10, { align: 'center' })

  const prefix = mode === 'conference'
    ? (preset !== 'generic' ? preset : 'conference')
    : 'number'
  doc.save(`bingo-${prefix}-${seed}.pdf`)
}
