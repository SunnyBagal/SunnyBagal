// Builds README.md so every <picture> block has the same structure.
import fs from 'node:fs';
const pic = (name, alt, href) => {
  const p = `<picture>
    <source media="(max-width: 600px)" srcset="assets/${name}-narrow.svg">
    <img alt="${alt}" src="assets/${name}.svg" width="100%">
  </picture>`;
  return href ? `<a href="${href}">\n  ${p}\n</a>` : p;
};
const gh = (r, p = '') => `https://github.com/SunnyBagal/${r}${p}`;
const project = ({ id, name, repo, about, links, report, alt }) => `${pic(`${id}-title`, name, gh(repo))}

${about}

${links}

${pic(id, alt, report)}
`;
const P = [
  {
    id: 'linea', name: 'Linea', repo: 'Linea', report: gh('Linea', '/blob/main/LOADTEST.md'),
    about: 'A multiplayer whiteboard in the spirit of Excalidraw. Every stroke, move and undo is an operation in one append-only log, so live sync, per-user undo and time-travel replay all come from the same source. I load-tested it with 20 concurrent clients and a chaos harness that checks the database for gaps, duplicates and out-of-order ops.',
    links: `[Code](${gh('Linea')}) · [Live](https://linea.sunnybagal.com) · [Load-test report](${gh('Linea', '/blob/main/LOADTEST.md')})`,
    alt: 'Linea: 10k-op replay 188 ms to 0.59 ms; acked ops/s with 20 clients 30 to 894; p95 ack latency 726 ms to 27 ms.',
  },
  {
    id: 'recall', name: 'Recall', repo: 'Recall', report: gh('Recall', '/blob/main/recall-backend/eval/RESULTS.md'),
    about: 'Save a link and it becomes a rich card (a YouTube player, a tweet, a GitHub repo, an article summary) that you can search by meaning as well as keywords. Search fuses pgvector and Postgres full-text results, and you can ask questions about your saved links and get cited answers. Ingestion runs on BullMQ workers with retries, and search quality is measured on the public BEIR SciFact benchmark.',
    links: `[Code](${gh('Recall')}) · [Live](https://recall.sunnybagal.com) · [Eval results](${gh('Recall', '/blob/main/recall-backend/eval/RESULTS.md')})`,
    alt: 'Recall: nDCG@10 0.72 on BEIR SciFact vs published BM25 0.665; small-tenant top-10 recall 14% to 100%; 5,183 documents ingested, 0 failed.',
  },
  {
    id: 'tracehound', name: 'TraceHound', repo: 'TraceHound', report: gh('TraceHound', '/blob/main/docs/bench/ts-heldout.md'),
    about: 'A GitHub Action that reviews TypeScript pull requests on an open model. One reviewer reads only the diff, a second also reads the code that references what changed, and a verifier keeps or drops each finding before one review is posted. I benchmarked it blind against CodeRabbit and Greptile on 29 real-bug PRs: it caught fewer bugs but left far less noise, at about $0.06 a review.',
    links: `[Code](${gh('TraceHound')}) · [Live](https://tracehound-tau.vercel.app) · [Full result](${gh('TraceHound', '/blob/main/docs/bench/ts-heldout.md')})`,
    alt: 'TraceHound on 29 real PRs: caught 4 of 20 bugs vs CodeRabbit 10 and Greptile 12; 2 comments on 9 clean PRs vs 15 and 13; about $0.06 per PR.',
  },
];
const md = `${pic('header', 'Sunny Bagal — backend engineer working in TypeScript and Postgres.', 'https://www.sunnybagal.com')}

I build backend systems in TypeScript and Postgres, load-test them, and publish the numbers.

**Open to backend / SDE-1 roles** · [sunnybagal.com](https://www.sunnybagal.com) · [LinkedIn](https://www.linkedin.com/in/sunnybagal) · [X](https://x.com/sunny_b11) · [Email](mailto:sunnybagal.1110@gmail.com)

## Projects

${P.map(project).join('\n')}
## Stack

${pic('stack', 'Languages: TypeScript, JavaScript, Python, SQL. Backend: Node.js, Express, Bun, REST, WebSockets, SSE, OAuth 2.0. Data: PostgreSQL, pgvector, Redis, BullMQ, MongoDB, Drizzle, Prisma. Cloud: AWS, Docker, GitHub Actions, Linux, Git, Railway, Render, DigitalOcean, Vercel. Testing: Vitest, Supertest, React Testing Library, load testing. AI: Claude API, OpenAI API, RAG, embeddings, hybrid retrieval. Frontend: React, Next.js, Tailwind.')}

## Experience & Achievements

${pic('experience', 'Experience: Software Engineering Intern at InteleCorp Software India, Jan to Apr 2026; led four interns building GeoGrid, a lead-generation platform; Redis cell cache served repeat searches in 1 to 3 ms. Achievement: HackerRank Orchestrate, Oct 2026, a 24-hour solo AI-agent hackathon; rank 238 of 4,094, top 6%.')}
`;
fs.writeFileSync(process.argv[2], md);
