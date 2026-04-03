# Conference Bingo

> Interactive bingo cards for conferences — shareable via URL seed.

Conference Bingo generates randomised 5x5 bingo cards loaded with buzzwords and clichés from your field. Mark off squares as you hear them in talks. Cards are seed-based, so you can share the same card with colleagues or give everyone a unique one. All processing happens in your browser — no data is sent anywhere.

## Features

- Randomised 5x5 bingo cards from preset word lists
- Shareable cards via seed-based URL — same seed = same card
- Custom word lists — add your own conference's jargon
- Interactive play — click squares as you hear phrases
- PNG and PDF export for printing or sharing
- Reset card or generate a new one at any time

## Tech Stack

- **html2canvas** — card-to-image rendering for PNG export
- **jsPDF** — PDF generation
- **React + Vite** — frontend framework
- **Cloudflare Pages** — global CDN hosting

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Running Tests

```bash
npm test           # unit tests
npm run test:e2e   # end-to-end tests (requires build first)
```

## Contributing

Contributions welcome. Please open an issue first to discuss changes.

## License

MIT — see [LICENSE](LICENSE)
