<a href="https://www.sunnybagal.com">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/header-narrow.svg">
    <img alt="Sunny Bagal — backend engineer working in TypeScript and Postgres." src="assets/header.svg" width="100%">
  </picture>
</a>

I build backend systems in TypeScript and Postgres, load-test them, and publish the numbers.

**Open to backend / SDE-1 roles** · [sunnybagal.com](https://www.sunnybagal.com) · [LinkedIn](https://www.linkedin.com/in/sunnybagal) · [X](https://x.com/sunny_b11) · [Email](mailto:sunnybagal.1110@gmail.com)

## Projects

<a href="https://github.com/SunnyBagal/Linea">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/linea-title-narrow.svg">
    <img alt="Linea" src="assets/linea-title.svg" width="100%">
  </picture>
</a>

A multiplayer whiteboard in the spirit of Excalidraw. Every stroke, move and undo is an operation in one append-only log, so live sync, per-user undo and time-travel replay all come from the same source. I load-tested it with 20 concurrent clients and a chaos harness that checks the database for gaps, duplicates and out-of-order ops.

[Code](https://github.com/SunnyBagal/Linea) · [Live](https://linea.sunnybagal.com) · [Load-test report](https://github.com/SunnyBagal/Linea/blob/main/LOADTEST.md)

<a href="https://github.com/SunnyBagal/Linea/blob/main/LOADTEST.md">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/linea-narrow.svg">
    <img alt="Linea: 10k-op replay 188 ms to 0.59 ms; acked ops/s with 20 clients 30 to 894; p95 ack latency 726 ms to 27 ms." src="assets/linea.svg" width="100%">
  </picture>
</a>

<a href="https://github.com/SunnyBagal/Recall">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/recall-title-narrow.svg">
    <img alt="Recall" src="assets/recall-title.svg" width="100%">
  </picture>
</a>

Save a link and it becomes a rich card (a YouTube player, a tweet, a GitHub repo, an article summary) that you can search by meaning as well as keywords. Search fuses pgvector and Postgres full-text results, and you can ask questions about your saved links and get cited answers. Ingestion runs on BullMQ workers with retries, and search quality is measured on the public BEIR SciFact benchmark.

[Code](https://github.com/SunnyBagal/Recall) · [Live](https://recall.sunnybagal.com) · [Eval results](https://github.com/SunnyBagal/Recall/blob/main/recall-backend/eval/RESULTS.md)

<a href="https://github.com/SunnyBagal/Recall/blob/main/recall-backend/eval/RESULTS.md">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/recall-narrow.svg">
    <img alt="Recall: nDCG@10 0.72 on BEIR SciFact vs published BM25 0.665; small-tenant top-10 recall 14% to 100%; 5,183 documents ingested, 0 failed." src="assets/recall.svg" width="100%">
  </picture>
</a>

<a href="https://github.com/SunnyBagal/TraceHound">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/tracehound-title-narrow.svg">
    <img alt="TraceHound" src="assets/tracehound-title.svg" width="100%">
  </picture>
</a>

A GitHub Action that reviews TypeScript pull requests on an open model. One reviewer reads only the diff, a second also reads the code that references what changed, and a verifier keeps or drops each finding before one review is posted. I benchmarked it blind against CodeRabbit and Greptile on 29 real-bug PRs: it caught fewer bugs but left far less noise, at about $0.06 a review.

[Code](https://github.com/SunnyBagal/TraceHound) · [Live](https://tracehound-tau.vercel.app) · [Full result](https://github.com/SunnyBagal/TraceHound/blob/main/docs/bench/ts-heldout.md)

<a href="https://github.com/SunnyBagal/TraceHound/blob/main/docs/bench/ts-heldout.md">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/tracehound-narrow.svg">
    <img alt="TraceHound on 29 real PRs: caught 4 of 20 bugs vs CodeRabbit 10 and Greptile 12; 2 comments on 9 clean PRs vs 15 and 13; about $0.06 per PR." src="assets/tracehound.svg" width="100%">
  </picture>
</a>

## Stack

<picture>
    <source media="(max-width: 600px)" srcset="assets/stack-narrow.svg">
    <img alt="Languages: TypeScript, JavaScript, Python, SQL. Backend: Node.js, Express, Bun, REST, WebSockets, SSE, OAuth 2.0. Data: PostgreSQL, pgvector, Redis, BullMQ, MongoDB, Drizzle, Prisma. Cloud: AWS, Docker, GitHub Actions, Linux, Git, Railway, Render, DigitalOcean, Vercel. Testing: Vitest, Supertest, React Testing Library, load testing. AI: Claude API, OpenAI API, RAG, embeddings, hybrid retrieval. Frontend: React, Next.js, Tailwind." src="assets/stack.svg" width="100%">
  </picture>

## Experience & Achievements

<picture>
    <source media="(max-width: 600px)" srcset="assets/experience-narrow.svg">
    <img alt="Experience: Software Engineering Intern at InteleCorp Software India, Jan to Apr 2026; led four interns building GeoGrid, a lead-generation platform; Redis cell cache served repeat searches in 1 to 3 ms. Achievement: HackerRank Orchestrate, Oct 2026, a 24-hour solo AI-agent hackathon; rank 238 of 4,094, top 6%." src="assets/experience.svg" width="100%">
  </picture>
