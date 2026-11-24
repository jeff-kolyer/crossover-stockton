const source = (url, label) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;

export function homePage() {
  return `
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">From thinking to being · From scarcity to stewardship</p>
          <h1>Where should we spend our time?</h1>
          <p class="lead">As AI and robotics take over more of the work required to keep society running, humanity faces a real question: if we don’t have to spend most of our lives just securing survival, what should we live for?</p>
          <p>Crossover explores that shift—from an existence organized mainly around ourselves toward conscious stewardship of the living world. And it begins with something ordinary.</p>
          <div class="actions">
            <a class="btn primary" href="/work">See the work in Stockton</a>
            <a class="btn" href="/crossover">Read the philosophy</a>
          </div>
        </div>
        <figure>
          <img src="/assets/animal-outside-door.png" alt="Illustration of a dog standing outside an open front door" width="1024" height="1536" fetchpriority="high">
          <figcaption class="caption">An ordinary moment: a stray animal appears outside your door. (Illustrative image, not a documented Crossover field encounter.)</figcaption>
        </figure>
      </div>
    </section>

    <section class="section soft-band">
      <div class="wrap reading">
        <p class="eyebrow">1 · The Animal Outside the Door</p>
        <h2>Wanting to help is simpler than knowing how.</h2>
        <p>Most of the time, we’re absorbed in our own lives—our responsibilities, security, possessions, relationships, and plans. An animal outside the door may barely register.</p>
        <p>Crossover calls this <em>unconsciousness</em>: living largely through evolutionary conditioning, experiencing the world mainly in relation to ourselves. That isn’t a judgment about good or bad people. It’s a condition we can all recognize.</p>
        <p>Then something shifts. You notice another living creature, recognize that its life matters on its own terms, and want to help. Immediately, real-world complexity opens up:</p>
        <div class="question-box">
          <p><strong>What actually happens next?</strong></p>
          <ul class="question-list">
            <li>Should you feed the animal, or does it belong to a neighbor?</li>
            <li>Is it already receiving care? Will feeding attract more animals?</li>
            <li>What about neighbors, reproduction, disease, and native wildlife?</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="reading">
          <p class="eyebrow">The scale of the problem</p>
          <h2>One doorstep connects to millions of lives.</h2>
          <p>Across the United States, millions of dogs and cats live in the gap between human goodwill and functioning care systems.</p>
        </div>
        <div class="scale-grid">
          <div class="scale-card">
            <strong>30–40M</strong>
            <span>Estimated community cats living outdoors in the United States.</span>
          </div>
          <div class="scale-card">
            <strong>5.8M</strong>
            <span>Approximate U.S. dog and cat shelter and rescue admissions in 2025.</span>
          </div>
        </div>
        <p class="sources">Previously identified national estimates; definitions and primary sources should be reverified before publication. Context from ${source('https://humanepro.org/page/managing-community-cats', 'HumanePro')} and ${source('https://www.shelteranimalscount.org/2025-report', 'Shelter Animals Count 2025 report')}.</p>
      </div>
    </section>

    <section class="section soft-band">
      <div class="wrap">
        <div class="reading">
          <p class="eyebrow">Planetary stewardship in miniature</p>
          <h2>The Ripon dilemma</h2>
          <p>In nearby Ripon, California, the City Council voted in November 2026 to restrict feeding stray and feral cats on public property without written authorization.</p>
        </div>
        <div class="video-layout">
          <div>
            <div class="video-frame">
              <iframe src="https://www.youtube-nocookie.com/embed/x7_BDjM662k" title="CBS News Sacramento report on Ripon cat-feeding restrictions" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </div>
            <p class="caption">CBS News Sacramento report on the Ripon vote (Nov 2026). ${source('https://www.youtube.com/watch?v=x7_BDjM662k', 'Watch on YouTube')} · ${source('https://www.cityofripon.org/392/Meeting-Agendas-Minutes', 'City of Ripon meeting records')}.</p>
          </div>
          <div class="two-col" style="grid-template-columns:1fr;gap:16px">
            <div class="info-card">
              <h3>Why residents feed</h3>
              <p>People see hungry animals in front of them and want to prevent suffering. Leaving an animal to starve feels wrong when food is right in the kitchen.</p>
            </div>
            <div class="info-card">
              <h3>Why others worry</h3>
              <p>Unplanned feeding can concentrate unsterilized cats, increase sanitation and neighborhood friction, spread disease, and put pressure on local wildlife.</p>
            </div>
            <div class="info-card">
              <h3>What Crossover asks instead</h3>
              <p>We don’t ask you to pick a side. We ask: <strong>what is actually happening, and what system would best care for the cats, the wildlife, and the community?</strong></p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="reading">
          <p class="eyebrow">The crossover, from me to us</p>
          <h2>Three hopes as machines take on routine work</h2>
          <p>Technology alone doesn’t decide what we live for. As AI and robotics replace more human labor, Crossover is built around three simple hopes:</p>
        </div>
        <div class="hopes-grid">
          <div class="hope-card">
            <span class="hope-num">1</span>
            <p>More people will become conscious—less trapped in fear, status, and self-centered stories.</p>
          </div>
          <div class="hope-card">
            <span class="hope-num">2</span>
            <p>They will have more time to care about reality and the living world around them.</p>
          </div>
          <div class="hope-card">
            <span class="hope-num">3</span>
            <p>Technology will be able to help them actually deliver that care.</p>
          </div>
        </div>
        <div class="reading">
          <p>That is the crossover: from <em>me</em> to <em>us</em>. From happiness as disconnection from reality and suffering into private wealth, to happiness as connection to reality and stewardship.</p>
        </div>

        <div class="time-return">
          <p class="eyebrow">Returning to the central question</p>
          <h3>Where should we spend our time?</h3>
          <p>Not because recreation, beauty, or personal freedom lack value—they are part of life. But because post-scarcity gives us the chance to ask what actually needs doing in the world, starting right where we live.</p>
        </div>

        <div class="nav-cards">
          <a class="nav-card" href="/crossover">
            <strong>2. The Crossover →</strong>
            <span>From thinking to being: consciousness, conditioning, and participating in reality directly.</span>
          </a>
          <a class="nav-card" href="/post-scarcity">
            <strong>3. Post-Scarcity →</strong>
            <span>What is our time for when machines can do more of the work? Possibilities and real dangers.</span>
          </a>
          <a class="nav-card" href="/stewardship">
            <strong>4. Stewardship →</strong>
            <span>Caring for the living Earth: cats, rabbits, neighbors, and systems that work together.</span>
          </a>
          <a class="nav-card" href="/work">
            <strong>5. The Work in Stockton →</strong>
            <span>Where philosophy meets reality: field investigations, public records, and the Stockton tracker.</span>
          </a>
        </div>
      </div>
    </section>
  `;
}
