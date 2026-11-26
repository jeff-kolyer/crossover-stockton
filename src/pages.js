import pathways from './data/pathways.json' with { type: 'json' };
import { homePage } from './home.js';
import { communityAnimalPark } from './article-park.js';

const repo = 'https://github.com/jeff-kolyer/crossover-stockton';
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const external = (url, label) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const intro = (label, title, lead) => `<section class="page-hero"><div class="wrap reading"><p class="eyebrow">${label}</p><h1>${title}</h1><p class="lead">${lead}</p></div></section>`;
const section = (className, title, body) => `<section class="section editorial-section ${className}"><div class="wrap reading"><h2>${title}</h2>${body}</div></section>`;
const onward = (href, label) => `<p class="onward"><a href="${href}">${label} <span aria-hidden="true">→</span></a></p>`;

function crossover() {
  return intro('The Crossover', 'The mind can change what we see.', 'Thinking helps us survive. It can also keep us inside old fears and familiar stories, even when the facts in front of us have changed.') +
    section('', 'A mind built for survival.', '<p>We notice threats, defend our place in a group, and try to secure enough for ourselves and the people close to us. These habits are useful. They can also narrow our attention.</p><p>At the door, the dog may first appear as a problem in an already crowded day. Stopping lets us see the animal itself.</p>') +
    section('soft-band', 'Notice the reaction.', '<p>A frightened dog can recoil from a gentle person because earlier danger taught it to expect harm. People carry learned reactions too. We can notice a reaction without letting it decide what is real.</p><p>That is the crossover this page is about: from being caught in the story in our head to meeting what is actually here.</p>') +
    section('', 'Let the change show in what we do.', `<p>Crossover draws on the Gospels and Eckhart Tolle’s <em>A New Earth</em>. They come from different traditions. Our interest is in the practical invitation to loosen defensiveness, admit mistakes, and care beyond our own identity.</p><p>The test is ordinary: do we look more carefully, correct ourselves, and help more effectively?</p><p class="source-note">${external(`${repo}/blob/main/PHILOSOPHY.md`, 'Read the full philosophy')}</p>${onward('/post-scarcity', 'What greater capacity could make possible')}`);
}

function postScarcity() {
  return intro('Post-Scarcity', 'Capacity gives us a choice.', 'AI, robotics, and automation may let people produce more with less compulsory labor. What we do with that capacity remains a human decision.') +
    section('', 'A need does not arrive with a budget.', '<p>An injured dog may need transport, surgery, recovery, and a stable home. It cannot pay for any of them. More productive capacity could make care less dependent on a person or animal’s purchasing power.</p><p>That future is not here just because a technology exists. The services have to be available, coordinated, and reliable.</p>') +
    section('soft-band', 'Start with useful tools.', '<p>Records can be easier to search. Volunteers can coordinate. Clinics can spend less time on administration. These are nearer uses for AI, provided people remain responsible for decisions and outcomes.</p><p>Robotics may later help with physical work and ecological restoration. Each claim has to be tested where it is used.</p>') +
    section('', 'Power needs direction.', `<p>The same tools can widen surveillance, inequality, and conflict. More capability does not choose its own purpose.</p><p>Crossover’s question is where growing capacity should go first—and how we will know whether it reached the living need.</p>${onward('/stewardship', 'What stewardship asks of us')}`);
}

function stewardship() {
  return intro('Stewardship', 'Care for the whole living system.', 'Helping one animal can affect others. Stewardship means following those effects and changing course when the evidence calls for it.') +
    section('', 'The cat and the rabbit.', '<p>Food can relieve a cat’s hunger. It can also change where cats gather and how they interact with neighbors and wildlife. A feeding restriction may change people’s behavior without providing care for the cats.</p><p>We need to learn what happens in each place before calling either action a solution.</p><p class="onward"><a href="/community-animal-park">Read the proposal: The Community Animal Park →</a></p>') +
    `<section class="section editorial-section soft-band"><div class="wrap"><div class="reading"><h2>Planetary stewardship in miniature</h2></div><div class="video-frame" style="max-width:680px;margin-top:20px"><iframe src="https://www.youtube-nocookie.com/embed/K9VX_vF_rpU" title="Planetary stewardship in miniature" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><p class="caption" style="margin-top:10px">${external('https://www.youtube.com/watch?v=K9VX_vF_rpU', 'Watch on YouTube')}</p></div></section>` +
    `<section class="section editorial-section"><div class="wrap"><figure class="doc-photo"><img src="/assets/stockton.webp" alt="Aerial view of Stockton neighborhoods, trees, and waterways" width="1200" height="630" loading="lazy"><figcaption class="caption">Stockton, California. The image shows shared ground, not a documented animal-care result.</figcaption></figure><div class="reading"><h2>Keep the whole picture in view.</h2><p>Animal welfare, public health, neighbors, habitat, and biodiversity can pull in different directions. We can observe outcomes, test approaches, and revise them. We also have to be honest about the values involved.</p></div></div></section>` +
    section('soft-band', 'Begin where we can check the results.', `<p>The same discipline applies to larger systems—water, soil, climate, and the life that depends on them. In Stockton we can start with specific animals and the actual routes available to care for them.</p>${onward('/work', 'See the Stockton work')}`);
}

function work() {
  const rows = pathways.map(pathway => `<a class="investigation-row" href="/workspace.html#pathways/p/${encodeURIComponent(pathway.id)}"><span class="status">${esc(pathway.stage)}</span><strong>${esc(pathway.title)}</strong><span class="investigation-org">${esc(pathway.org)}</span><span class="investigation-open">Open pathway <span aria-hidden="true">→</span></span></a>`).join('');
  return intro('The Work · Stockton', 'Follow what happens after we decide to help.', 'Crossover is checking which routes to care exist for stray dogs and community cats in Stockton, where those routes stop, and what would make them dependable.') +
    `<section class="section editorial-section soft-band"><div class="wrap"><div class="reading"><h2>Pathways in progress.</h2><p>These records describe what is being checked. A contact attempt is not confirmed access to care.</p></div><div class="investigation-list">${rows}</div></div></section>` +
    `<section class="section editorial-section"><div class="wrap reading"><h2>Look behind a claim.</h2><p>Follow pathways, tasks, and evidence side by side—seeing what has been done, what remains open, and how a conclusion was reached.</p><div class="work-deep-links"><a href="/workspace.html#pathways">Pathways <span aria-hidden="true">→</span></a><a href="/workspace.html#tasks">Tasks <span aria-hidden="true">→</span></a><a href="/workspace.html#evidence">Evidence <span aria-hidden="true">→</span></a></div></div></section>`;
}

function about() {
  return intro('About', 'How Crossover works in Stockton.', 'Crossover explores the shift from scarcity to stewardship, grounded in practical local work. Every pathway, task, and evidence record is kept separate so we never mistake an outreach attempt for care delivered.') +
    section('', 'How pathways work', '<p>A pathway is a specific, practical way someone could make a difference in Stockton. Each pathway carries one of four stages:</p>' +
      '<p><strong>Exploring</strong> — We are checking whether the contribution is needed, practical, and appropriate.</p>' +
      '<p><strong>Blocked</strong> — A verified bottleneck stands in the way of an otherwise promising route.</p>' +
      '<p><strong>Enabling</strong> — Preparatory work—such as reviewing 7,183 public field-call records—that helps clarify what is happening before direct action.</p>' +
      '<p><strong>Established</strong> — Confirmed steps that have been verified firsthand or directly with the organization involved.</p>') +
    section('soft-band', 'Tasks and evidence', '<p>Tasks track the concrete calls, visits, and record reviews still needed. Evidence holds the public documents, local reporting, and firsthand observations behind each claim—along with their limits.</p>' +
      `<p class="source-note">${external(repo, 'Browse the source repository')}</p>`) +
    section('', 'Contact on LinkedIn', `<p>Follow field updates, read notes from Stockton, or get in touch directly on LinkedIn.</p><p class="onward">${external('https://www.linkedin.com/in/jeff-kolyer', 'Connect with Jeff Kolyer on LinkedIn →')}</p>`);
}

export const pages = {
  '/': {
    title: 'Home',
    description: 'Where should we spend our time? A down-to-earth exploration of consciousness, post-scarcity technology, and conscious stewardship, grounded in Stockton.',
    render: homePage
  },
  '/crossover': {
    title: 'The Crossover',
    description: 'Thinking helps us survive. It can also keep us inside old fears and familiar stories, even when the facts in front of us have changed.',
    render: crossover
  },
  '/post-scarcity': {
    title: 'Post-Scarcity',
    description: 'AI, robotics, and automation may let people produce more with less compulsory labor. What we do with that capacity remains a human decision.',
    render: postScarcity
  },
  '/stewardship': {
    title: 'Stewardship',
    description: 'Helping one animal can affect others. Stewardship means following those effects and changing course when the evidence calls for it.',
    render: stewardship
  },
  '/community-animal-park': {
    title: 'The Community Animal Park',
    description: 'A post-scarcity engineering proposal for turning stray-animal response into shared community stewardship.',
    render: communityAnimalPark
  },
  '/work': {
    title: 'The Work',
    description: 'Crossover is checking which routes to care exist for stray dogs and community cats in Stockton, where those routes stop, and what would make them dependable.',
    render: work
  },
  '/about': {
    title: 'About',
    description: 'How Crossover works in Stockton: pathways, tasks, evidence, and how to get in touch.',
    render: about
  }
};
