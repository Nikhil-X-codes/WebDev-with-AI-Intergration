# 🤖 AI Content & Utility Suite

---
## Project Summary
Unified PERN + Vite/React toolkit bundling generation, analysis, and classification utilities. The backend exposes JSON endpoints for each workflow, persists activity for analytics, and keeps the model roster intentionally lean. The frontend delivers lightweight feature cards/pages so teams can draft copy, triage tickets, audit resumes, or detect AI content without juggling multiple tools.

---
## Models Used
- `meta-llama/Llama-3.2-1B-Instruct` for every semantic task: drafting, rewriting, structured reasoning, and zero-shot style classification via prompt scoring.
- `openai-community/roberta-base-openai-detector` dedicated to AI-vs-human probability scoring.

---
## Features
- Article drafting with structured briefs.
- Blog/SEO headline ideation and inspirational quotes.
- Tone-aware rewriting for clarity and consistency.
- Support ticket routing: category, urgency, department, sentiment, SLA hint.
- Resume deep-dive scoring with strengths, gaps, and ATS heuristics.
- Sentiment plus text complexity breakdowns.
- AI vs human content detection leveraging RoBERTa outputs.
- Unified assistant router with context-specific prompts and Postgres activity logging.

---
## Architecture
- **Backend (Node/Express + Neon Postgres):** modular routes for generation, detection, classification, and assistant orchestration. Controllers encapsulate prompt construction, Hugging Face Inference SDK calls, JSON parsing, and logging into `ai_logs`.
- **Frontend (Vite + React):** feature-specific pages built on shared `Layout` and `ToolCard` components, simple local state plus fetch for API calls, no heavy global store required.

---
## Model Strategy
- Prefer a single small instruction model (Llama‑3.2‑1B) for all generative and structured outputs to minimize context switching and cost.
- Use prompt-engineered scoring templates to emulate zero-shot classification and yield JSON-ready responses.
- Isolate AI-detection to the RoBERTa classifier so detection improvements do not impact generative workloads.

---
## Tech & Tools Stack
- Runtime: Node.js (Express, ESM) and React (Vite).
- Database: Postgres (Neon serverless) via lightweight SQL tagged templates.
- AI Integration: Hugging Face Inference API (`@huggingface/inference`).
- Auth Hook: Clerk placeholder (currently anonymous sessions).
- Tooling: Postman, VS Code REST Client, curl, dotenv for env orchestration.

---
## Quick Setup
- **Backend**
  1. `cd backend && npm install`
  2. Create `.env` with `DB_URL`, `HUGGINGFACE_API_KEY`, and `PORT=5000`
  3. `npm start` to expose `http://localhost:5000`
- **Frontend**
  1. `cd frontend && npm install`
  2. `npm run dev` and point env to the backend base URL

---
## Future Improvements
- Embedding similarity search for semantic retrieval and plagiarism checks.
- Calibrated confidence scoring for classification outputs.
- User-level API keys and rate limiting.
- Observability dashboard (latency, usage, model health).
- Prompt versioning with automated regression checks.

