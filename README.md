<a href="https://www.sunnybagal.com">
  <picture>
    <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="assets/header-dark-narrow.svg">
    <source media="(max-width: 600px)" srcset="assets/header-light-narrow.svg">
    <source media="(prefers-color-scheme: dark)" srcset="assets/header-dark.svg">
    <img alt="Sunny Bagal — backend engineer working in Node.js, TypeScript and PostgreSQL. Build it, measure it, publish the numbers." src="assets/header-light.svg" width="100%">
  </picture>
</a>

I build backend systems in TypeScript and PostgreSQL, then load-test them until the numbers hold up. Each project below links to the report its numbers come from.

**Open to backend / SDE-1 roles** · Navi Mumbai, open to Bengaluru, Pune or remote<br>
[sunnybagal.com](https://www.sunnybagal.com) · [LinkedIn](https://www.linkedin.com/in/sunnybagal) · [X](https://x.com/sunny_b11) · [Email](mailto:sunnybagal.1110@gmail.com)

## Selected work

### [Linea](https://github.com/SunnyBagal/Linea)

**Collaborative whiteboard on an event-sourced sync engine.** An append-only op log drives live sync, replay and undo, and a chaos harness checks for gaps, duplicates and ordering against the database.

<sub>TypeScript · Node.js · raw ws · PostgreSQL · Prisma · Next.js · Turborepo</sub><br>
[Code](https://github.com/SunnyBagal/Linea) · [Live](https://linea.sunnybagal.com) · [Load-test report](https://github.com/SunnyBagal/Linea/blob/main/LOADTEST.md)

<a href="https://github.com/SunnyBagal/Linea/blob/main/LOADTEST.md">
  <picture>
    <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="assets/linea-dark-narrow.svg">
    <source media="(max-width: 600px)" srcset="assets/linea-light-narrow.svg">
    <source media="(prefers-color-scheme: dark)" srcset="assets/linea-dark.svg">
    <img alt="Linea benchmarks: 10k-op replay 188 ms to 0.59 ms; acked ops/s with 20 clients 30 to 894; p95 ack latency 726 ms to 27 ms." src="assets/linea-light.svg" width="100%">
  </picture>
</a>

### [Recall](https://github.com/SunnyBagal/Recall)

**RAG link organizer with hybrid retrieval.** pgvector HNSW and Postgres full-text search fused with RRF, evaluated on BEIR SciFact, with 219 tests running against real Postgres and BullMQ.

<sub>TypeScript · Bun · Express · PostgreSQL/pgvector · Drizzle · Redis · BullMQ · Claude API · React</sub><br>
[Code](https://github.com/SunnyBagal/Recall) · [Live](https://recall.sunnybagal.com) · [Eval results](https://github.com/SunnyBagal/Recall/blob/main/recall-backend/eval/RESULTS.md)

<a href="https://github.com/SunnyBagal/Recall/blob/main/recall-backend/eval/RESULTS.md">
  <picture>
    <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="assets/recall-dark-narrow.svg">
    <source media="(max-width: 600px)" srcset="assets/recall-light-narrow.svg">
    <source media="(prefers-color-scheme: dark)" srcset="assets/recall-dark.svg">
    <img alt="Recall results: nDCG@10 0.72 on BEIR SciFact vs published BM25 0.665; filtered top-10 recall for a 68-row user 14% to 100%; 5,183 of 5,183 documents ingested with 0 failed jobs." src="assets/recall-light.svg" width="100%">
  </picture>
</a>

### [TraceHound](https://github.com/SunnyBagal/TraceHound)

**AI pull-request reviewer, benchmarked against CodeRabbit and Greptile.** Built with coding agents on an open model. I pre-registered a blind, hand-graded benchmark on 29 real-bug PRs and published the full result, including where it lost.

<sub>TypeScript · Node.js · TypeScript Compiler API · GitHub Actions · Nemotron (Nebius) · Next.js</sub><br>
[Code](https://github.com/SunnyBagal/TraceHound) · [Live](https://tracehound-tau.vercel.app) · [Full result](https://github.com/SunnyBagal/TraceHound/blob/main/docs/bench/ts-heldout.md)

<a href="https://github.com/SunnyBagal/TraceHound/blob/main/docs/bench/ts-heldout.md">
  <picture>
    <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="assets/tracehound-dark-narrow.svg">
    <source media="(max-width: 600px)" srcset="assets/tracehound-light-narrow.svg">
    <source media="(prefers-color-scheme: dark)" srcset="assets/tracehound-dark.svg">
    <img alt="TraceHound held-out benchmark on 29 real PRs: caught 4 of 20 bugs vs CodeRabbit 10 and Greptile 12; left 2 comments on 9 clean PRs vs 15 and 13; about $0.06 per PR." src="assets/tracehound-light.svg" width="100%">
  </picture>
</a>

## Stack

<picture>
    <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="assets/stack-dark-narrow.svg">
    <source media="(max-width: 600px)" srcset="assets/stack-light-narrow.svg">
    <source media="(prefers-color-scheme: dark)" srcset="assets/stack-dark.svg">
    <img alt="Languages: TypeScript, JavaScript, Python, SQL. Backend: Node.js, Express, Bun, REST, WebSockets, SSE, OAuth 2.0. Data and queues: PostgreSQL, pgvector, Redis, BullMQ, MongoDB, Drizzle, Prisma, indexing, full-text search. Cloud and DevOps: AWS (EC2, S3), Docker, GitHub Actions, Linux, Git, Railway, Render, DigitalOcean, Vercel. Testing: Vitest, Supertest, React Testing Library, integration and load testing. AI: Claude API, OpenAI API, RAG, embeddings, hybrid retrieval. Frontend: React, Next.js, Tailwind." src="assets/stack-light.svg" width="100%">
  </picture>

## Also

- **InteleCorp Software India** (Jan–Apr 2026): led a four-intern team building GeoGrid, a lead-generation platform. Designed a Redis cell cache that serves repeat searches in 1–3 ms.
- **HackerRank Orchestrate** (Oct 2026, 24-hour solo AI-agent hackathon): rank 238 of 4,094, top 6%.

<p align="center"><samp>Build something. Understand it. Make it better.</samp></p>
