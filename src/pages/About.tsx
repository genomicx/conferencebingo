import { Link } from 'react-router-dom'

export function About() {
  return (
    <div className="about-page">
      <section>
        <h2>About Conference Bingo</h2>
        <p>
          Conference Bingo makes conferences more interactive and fun. Generate a randomised
          5×5 bingo card loaded with buzzwords and clichés from your field, then mark off
          squares as you hear them in talks. Cards are seed-based, so you can share the same
          card with colleagues or give everyone a unique one.
        </p>
        <p>
          Cards can be exported as PNG or PDF for printing. All processing happens in your
          browser — no data is sent anywhere.
        </p>
      </section>

      <section>
        <h2>Features</h2>
        <ul>
          <li>Randomised 5×5 bingo cards from preset word lists</li>
          <li>Shareable cards via seed-based URL — same seed = same card</li>
          <li>Custom word lists — add your own conference's jargon</li>
          <li>Interactive play — click squares as you hear phrases</li>
          <li>PNG and PDF export for printing or sharing</li>
          <li>Reset card or generate a new one at any time</li>
        </ul>
      </section>

      <section>
        <h2>How to play</h2>
        <p>
          Choose a preset (or enter your own buzzwords), hit Generate, and share the URL with
          your fellow attendees. As you sit through talks, click squares when you hear the
          phrase. Complete a row, column, or diagonal to get BINGO!
        </p>
        <p>
          The seed in the URL lets anyone regenerate the exact same card. Type in a custom
          seed to give everyone at a session the same card, or leave it random for unique
          cards per person.
        </p>
      </section>

      <section>
        <h2>Technology</h2>
        <ul>
          <li><strong>html2canvas</strong> — card-to-image rendering for PNG export</li>
          <li><strong>jsPDF</strong> — PDF generation</li>
          <li><strong>React + Vite</strong> — frontend framework</li>
          <li><strong>Cloudflare Pages</strong> — global CDN hosting</li>
        </ul>
      </section>

      <section>
        <h2>Source Code</h2>
        <p>
          Conference Bingo is open-source software. Contributions and issues welcome on{' '}
          <a href="https://github.com/genomicx/conferencebingo" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>.
        </p>
      </section>

      <section>
        <h2>About the Author</h2>
        <h3>Nabil-Fareed Alikhan</h3>
        <p className="about-role">
          Senior Bioinformatician, Centre for Genomic Pathogen Surveillance, University of Oxford
        </p>
        <p>
          Bioinformatics researcher and software developer specialising in microbial genomics.
          Builder of widely used open-source tools, peer-reviewed researcher, and co-host of
          the MicroBinfie podcast.
        </p>
        <div className="about-links">
          <a href="https://www.happykhan.com" target="_blank" rel="noopener noreferrer">happykhan.com</a>
          <a href="https://orcid.org/0000-0002-1243-0767" target="_blank" rel="noopener noreferrer">ORCID: 0000-0002-1243-0767</a>
          <a href="mailto:nabil@happykhan.com">nabil@happykhan.com</a>
          <a href="https://twitter.com/happy_khan" target="_blank" rel="noopener noreferrer">@happy_khan</a>
          <a href="https://mstdn.science/@happykhan" target="_blank" rel="noopener noreferrer">@happykhan@mstdn.science</a>
        </div>
      </section>

      <div style={{ marginTop: '1rem' }}>
        <Link to="/" style={{ color: 'var(--gx-accent)', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to Application
        </Link>
      </div>
    </div>
  )
}
