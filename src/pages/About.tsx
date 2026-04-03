export function About() {
  return (
    <div className="about-page">
      <section>
        <h2>About Conference Bingo</h2>
        <p>
          Conference Bingo is a fun tool for making conferences more interactive. Generate a
          randomised 5&times;5 bingo card loaded with conference buzzwords and clichés, then
          mark off squares as you hear them in talks and discussions. Cards are seed-based, so
          you can share the same card with colleagues or generate unique ones for everyone.
        </p>
        <p>
          Cards can be exported as PNG or PDF for printing. All processing happens in your
          browser — no data is sent anywhere.
        </p>
      </section>

      <section>
        <h2>How to play</h2>
        <p>
          Choose a conference preset (or enter your own list of buzzwords), hit Generate, and
          share the URL with your fellow attendees. As you sit through talks, click squares
          when you hear the phrase. Complete a row, column, or diagonal to get BINGO!
        </p>
        <p>
          The seed in the URL lets anyone regenerate the exact same card. You can also type in
          your own seed — useful for giving everyone at a session the same card, or for
          creating a unique card per person.
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
          <a href="https://www.happykhan.com" target="_blank" rel="noopener noreferrer">
            happykhan.com
          </a>
          <a
            href="https://orcid.org/0000-0002-1243-0767"
            target="_blank"
            rel="noopener noreferrer"
          >
            ORCID: 0000-0002-1243-0767
          </a>
          <a href="mailto:nabil@happykhan.com">nabil@happykhan.com</a>
          <a
            href="https://twitter.com/happy_khan"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter: @happy_khan
          </a>
          <a
            href="https://mstdn.science/@happykhan"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mastodon: @happykhan@mstdn.science
          </a>
        </div>
      </section>
    </div>
  )
}
