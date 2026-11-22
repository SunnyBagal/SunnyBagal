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
const md = `${pic('header', 'Sunny Bagal — backend engineer working in TypeScript and Postgres.', 'https://www.sunnybagal.com')}

I build backend systems in TypeScript and Postgres, load-test them, and publish the numbers.

**Open to backend / SDE-1 roles** · [sunnybagal.com](https://www.sunnybagal.com) · [LinkedIn](https://www.linkedin.com/in/sunnybagal) · [X](https://x.com/sunny_b11) · [Email](mailto:sunnybagal.1110@gmail.com)

### Projects

**[Linea](${gh('Linea')})**: a collaborative whiteboard on an event-sourced sync engine · [live](https://linea.sunnybagal.com) · [load test](${gh('Linea', '/blob/main/LOADTEST.md')})

${pic('linea', 'Linea: 10k-op replay 188 ms to 0.59 ms; acked ops/s with 20 clients 30 to 894; p95 ack latency 726 ms to 27 ms.', gh('Linea', '/blob/main/LOADTEST.md'))}

**[Recall](${gh('Recall')})**: a RAG link organizer with hybrid search on pgvector · [live](https://recall.sunnybagal.com) · [eval](${gh('Recall', '/blob/main/recall-backend/eval/RESULTS.md')})

${pic('recall', 'Recall: nDCG@10 0.72 on BEIR SciFact vs published BM25 0.665; small-tenant top-10 recall 14% to 100%; 5,183 documents ingested, 0 failed.', gh('Recall', '/blob/main/recall-backend/eval/RESULTS.md'))}

**[TraceHound](${gh('TraceHound')})**: an AI PR reviewer, blind-tested vs CodeRabbit and Greptile · [live](https://tracehound-tau.vercel.app) · [result](${gh('TraceHound', '/blob/main/docs/bench/ts-heldout.md')})

${pic('tracehound', 'TraceHound on 29 real PRs: caught 4 of 20 bugs vs CodeRabbit 10 and Greptile 12; 2 comments on 9 clean PRs vs 15 and 13; about $0.06 per PR.', gh('TraceHound', '/blob/main/docs/bench/ts-heldout.md'))}

### Stack

${pic('stack', 'Languages: TypeScript, JavaScript, Python, SQL. Backend: Node.js, Express, Bun, REST, WebSockets, SSE, OAuth 2.0. Data: PostgreSQL, pgvector, Redis, BullMQ, MongoDB, Drizzle, Prisma. Cloud: AWS, Docker, GitHub Actions, Linux, Git, Railway, Render, DigitalOcean, Vercel. Testing: Vitest, Supertest, React Testing Library, load testing. AI: Claude API, OpenAI API, RAG, embeddings, hybrid retrieval. Frontend: React, Next.js, Tailwind.')}

<sub>Previously led a four-intern team building GeoGrid at InteleCorp · HackerRank Orchestrate: rank 238 of 4,094</sub>
`;
fs.writeFileSync(process.argv[2], md);
