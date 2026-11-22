// Builds README.md from a template so every <picture> block is identical in structure.
import fs from 'node:fs';
const pic = (name, alt, href) => {
  const p = `<picture>
    <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="assets/${name}-dark-narrow.svg">
    <source media="(max-width: 600px)" srcset="assets/${name}-light-narrow.svg">
    <source media="(prefers-color-scheme: dark)" srcset="assets/${name}-dark.svg">
    <img alt="${alt}" src="assets/${name}-light.svg" width="100%">
  </picture>`;
  return href ? `<a href="${href}">\n  ${p}\n</a>` : p;
};
const gh = (r, p = '') => `https://github.com/SunnyBagal/${r}${p}`;
const md = `${pic('header', 'Sunny Bagal — backend engineer working in Node.js, TypeScript and PostgreSQL. Build it, measure it, publish the numbers.', 'https://www.sunnybagal.com')}

I build backend systems in TypeScript and PostgreSQL, then load-test them until the numbers hold up. Each project below links to the report its numbers come from.

**Open to backend / SDE-1 roles** · Navi Mumbai, open to Bengaluru, Pune or remote<br>
[sunnybagal.com](https://www.sunnybagal.com) · [LinkedIn](https://www.linkedin.com/in/sunnybagal) · [X](https://x.com/sunny_b11) · [Email](mailto:sunnybagal.1110@gmail.com)

## Selected work

### [Linea](${gh('Linea')})

**Collaborative whiteboard on an event-sourced sync engine.** An append-only op log drives live sync, replay and undo, and a chaos harness checks for gaps, duplicates and ordering against the database.

<sub>TypeScript · Node.js · raw ws · PostgreSQL · Prisma · Next.js · Turborepo</sub><br>
[Code](${gh('Linea')}) · [Live](https://linea.sunnybagal.com) · [Load-test report](${gh('Linea', '/blob/main/LOADTEST.md')})

${pic('linea', 'Linea benchmarks: 10k-op replay 188 ms to 0.59 ms; acked ops/s with 20 clients 30 to 894; p95 ack latency 726 ms to 27 ms.', gh('Linea', '/blob/main/LOADTEST.md'))}

### [Recall](${gh('Recall')})

**RAG link organizer with hybrid retrieval.** pgvector HNSW and Postgres full-text search fused with RRF, evaluated on BEIR SciFact, with 219 tests running against real Postgres and BullMQ.

<sub>TypeScript · Bun · Express · PostgreSQL/pgvector · Drizzle · Redis · BullMQ · Claude API · React</sub><br>
[Code](${gh('Recall')}) · [Live](https://recall.sunnybagal.com) · [Eval results](${gh('Recall', '/blob/main/recall-backend/eval/RESULTS.md')})

${pic('recall', 'Recall results: nDCG@10 0.72 on BEIR SciFact vs published BM25 0.665; filtered top-10 recall for a 68-row user 14% to 100%; 5,183 of 5,183 documents ingested with 0 failed jobs.', gh('Recall', '/blob/main/recall-backend/eval/RESULTS.md'))}

### [TraceHound](${gh('TraceHound')})

**AI pull-request reviewer, benchmarked against CodeRabbit and Greptile.** Built with coding agents on an open model. I pre-registered a blind, hand-graded benchmark on 29 real-bug PRs and published the full result, including where it lost.

<sub>TypeScript · Node.js · TypeScript Compiler API · GitHub Actions · Nemotron (Nebius) · Next.js</sub><br>
[Code](${gh('TraceHound')}) · [Live](https://tracehound-tau.vercel.app) · [Full result](${gh('TraceHound', '/blob/main/docs/bench/ts-heldout.md')})

${pic('tracehound', 'TraceHound held-out benchmark on 29 real PRs: caught 4 of 20 bugs vs CodeRabbit 10 and Greptile 12; left 2 comments on 9 clean PRs vs 15 and 13; about $0.06 per PR.', gh('TraceHound', '/blob/main/docs/bench/ts-heldout.md'))}

## Stack

${pic('stack', 'Languages: TypeScript, JavaScript, Python, SQL. Backend: Node.js, Express, Bun, REST, WebSockets, SSE, OAuth 2.0. Data and queues: PostgreSQL, pgvector, Redis, BullMQ, MongoDB, Drizzle, Prisma, indexing, full-text search. Cloud and DevOps: AWS (EC2, S3), Docker, GitHub Actions, Linux, Git, Railway, Render, DigitalOcean, Vercel. Testing: Vitest, Supertest, React Testing Library, integration and load testing. AI: Claude API, OpenAI API, RAG, embeddings, hybrid retrieval. Frontend: React, Next.js, Tailwind.')}

## Also

- **InteleCorp Software India** (Jan–Apr 2026): led a four-intern team building GeoGrid, a lead-generation platform. Designed a Redis cell cache that serves repeat searches in 1–3 ms.
- **HackerRank Orchestrate** (Oct 2026, 24-hour solo AI-agent hackathon): rank 238 of 4,094, top 6%.

<p align="center"><samp>Build something. Understand it. Make it better.</samp></p>
`;
fs.writeFileSync(process.argv[2], md);
