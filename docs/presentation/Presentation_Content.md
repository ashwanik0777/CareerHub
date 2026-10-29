# CareerHub — Presentation Content (13 slides, canonical)

This file matches the deck (`CareerHub_Research_Presentation_Light.pptx`) and the fallback map inside `Claude_Design_Prompt.md`. If you change slide text, change it in all three places.

Format per slide: **on-slide text** (exact), then *Say* — what to speak, not slide text. Full speaker notes (timing, expected questions, answers) are embedded in the PPTX notes.

---

## 1 · Cover

**Kicker:** RESEARCH PROPOSAL
**Title:** An Intelligent Semantic Professional Identity Framework for Cross-Platform Recruitment Form Understanding and Browser-Assisted Autofill
**Subtitle:** NIT Summer Research Internship · CareerHub
**Footer:** Presenter — Ashwani Kushwaha · Guide — Dr. Gunjan · Department — CSE · Date — 13 July 2026
**Visual:** browser form + identity card + AI node illustration, subtle network dots

*Say:* One line only — students keep one professional profile, and a browser extension that understands recruitment forms fills every application from it. A working prototype already exists; this proposal formalizes the research behind it.

---

## 2 · Why Does This Research Matter?

**Left flow:** Student → LinkedIn → Internshala → Naukri → Wellfound → Google Careers → University Portal → Hackathon Portal → Company Portal
**Caption:** Students repeatedly create identical professional profiles across multiple recruitment platforms — wasting time and effort.
**Right stat card — The Cost of Repetition:**
- 80+ · Repeated form fields · asked on every single portal
- 10+ · Platforms per student · each with its own form
- 20 hrs · Lost every season · re-typing the same data
- High · Manual error rate · typos and stale information

*Say:* This came from my own placement season — the numbers are estimates from counting fields on real portals; the dataset phase will measure them properly. The problem is not one form, it is the same form everywhere, forever.

---

## 3 · Problem Statement

**Left — Current Workflow:** Student → Open Portal → Create Profile → Upload Resume → Fill 80 Fields → Repeat Again → Repeat Again → Repeat Again → Submit
**Right — Pain Points:** Time Consuming · Repeated Effort · Data Inconsistency · Manual Errors · No Profile Reuse · No Semantic Understanding
**Quote:** Current recruitment platforms optimize recruiter workflows rather than applicant experience.

*Say:* The three "Repeat Again" steps are the whole problem. The deepest pain point is the last one — no tool understands what a form field is actually asking.

---

## 4 · Literature Landscape & Research Gap

**Left cluster:** Browser Autofill · Resume Parsing · Sentence Embeddings · Digital Identity · Recruitment AI · Browser Extensions · HTML Forms · Semantic Search — all isolated around a red circle: **NO UNIFIED FRAMEWORK**
Caption: Isolated domains — none interoperate
**Transition:** OUR RESEARCH →
**Right cluster:** the same eight domains connected to an indigo circle: **Unified Semantic Professional Identity Framework**
Caption: One framework connects them all

*Say:* Every surrounding domain is mature on its own; none of them talk to each other for recruitment. Five documented gaps back this up — no unified ontology system, unresolved ATS field heterogeneity, no public benchmark dataset, rule-based autofill breaking on unseen layouts, and no selective profile sharing.

---

## 5 · Proposed Solution

**Pipeline:**
01 One Professional Profile — single source of truth
02 CareerHub AI — identity intelligence layer
03 **Semantic Understanding Engine** — ontology of 70+ attributes *(hero)*
04 Browser Extension — Manifest V3 companion
05 Semantic Field Mapping — hybrid rules + embeddings
06 Cross-Platform Recruitment Portals — any ATS · any form
07 Automatic Intelligent Autofill — confidence-gated filling
**Right — Supported Platforms:** LinkedIn · Internshala · Naukri · Wellfound · Greenhouse · Lever · Ashby · Google Careers · Microsoft Careers · Custom Company Portals
**Strip:** Any ATS · Any form structure · One identity

*Say:* Stage 03 is the research core — a formal ontology of 70+ professional attributes with synonyms and relationships. The system generalizes because it understands fields semantically instead of memorizing per-site templates.

---

## 6 · System Architecture

**Flow:** User → CareerHub Professional Identity → Browser Extension → DOM Extraction Engine → Metadata Extraction → Semantic Embedding → Field Classification → Confidence Ranking → User Confirmation → Autofill → Form Submission
**Legend:** user touchpoint (green) · browser pipeline (gray) · AI engine (indigo)
**Model cards:**
- all-MiniLM-L6-v2 — Sentence Embedding — Purpose: field–attribute similarity · Input: field label + metadata · Output: 384-d vector, cosine score
- DeBERTa-v3 — Form Understanding — Purpose: field intent classification · Input: DOM context tokens · Output: ontology attribute class
- LayoutLMv3 — Resume Parser — Purpose: resume to structured profile · Input: resume PDF, text + layout · Output: profile entities as JSON
- LightGBM — Confidence — Purpose: fill / confirm / defer gating · Input: strategy score vector · Output: calibrated confidence 0–1
**Bottom:** Hybrid AI architecture combining semantic understanding with browser-assisted automation.

*Say:* Above the confidence threshold the field fills automatically, in the uncertain band the user confirms, below it the system defers — automation never removes oversight. If asked: the current prototype runs rules + keyword + TF-IDF matching; the transformer models are the proposed upgrades to benchmark against that baseline.

---

## 7 · AI Architecture & ML Pipeline

**Pipeline:** Recruitment Website → Browser Extension → DOM Extraction → Metadata Extraction → Sentence Embedding → Semantic Field Classification → Confidence Ranking → Professional Profile Mapping → User Confirmation → Autofill
**Cards:**
- all-MiniLM-L6-v2 — semantic similarity between HTML fields and profile attributes
- DeBERTa-v3-base — context-aware HTML field understanding
- LayoutLMv3 — extract structured information from resumes — **FUTURE**
- LightGBM — select the best semantic mapping
**Badges:** Fast · Lightweight · Semantic AI · Production Ready · Research Driven
**Bottom:** Hybrid AI pipeline combining semantic embeddings, transformer classification, and confidence ranking.

*Say:* Three phases — browser (gray), AI (indigo), human (green). MiniLM because 22M parameters run client-side in milliseconds; an LLM adds cost and privacy risk for a similarity task. LayoutLMv3 is deliberately future work — HTML dataset first.

---

## 8 · Building the First Semantic Recruitment HTML Dataset

**Flow:** Recruitment Websites → Browser Extension → DOM Analyzer → HTML Metadata Extraction → Annotation Platform → Semantic Dataset → AI Training Dataset
**Card 01 — Raw HTML Dataset:** HTML · Labels · Placeholder · XPath · CSS Selector · ARIA · Nearby Text · DOM Context
**Card 02 — Semantic Annotation Dataset:** Ground Truth Labels (100+ classes) · Category (8 groups) · Reviewer (dual review) · Confidence (0–1 score) · Version (v1.0, tracked)
**Card 03 — Portal Knowledge Graph:** Portal (50+ sites) · Framework (React · custom) · Field Dictionary (per-portal map) · Semantic Relationships (ontology edges)
**Research target:** 50+ recruitment websites · 20K+ HTML fields · 100+ semantic categories

*Say:* This is the main research deliverable — no public dataset of live recruitment form fields exists; FUNSD and CommonForms cover documents and generic forms. We collect only public form structure, never user data. Dual review and versioning keep annotation quality honest.

---

## 9 · Google Autofill vs CareerHub AI

**Rows (Google / CareerHub):** Purpose: generic form filling / recruitment-focused identity · Profile Type: browser data store / professional identity graph · Supported Information: name, address, payment / 80+ professional attributes · Semantic AI: NO / YES · DOM Understanding: static heuristics / deep DOM context · Context Understanding: NO / YES · Profile Synchronization: NO / cloud-synced, versioned · Resume Support: NO / parsing + generation · Cross Platform: single browser / any portal, any ATS · Recruitment Optimization: NO / YES · Browser Extension: built-in, closed / MV3, user-controlled · Confidence Score: NO / calibrated 0–1 · Learning Capability: static rules / improves with data · Future AI: — / transformer roadmap
**Bottom:** Google Autofill stores browser data. CareerHub understands professional identity.

*Say:* Don't read the rows — walk Purpose, Supported Information, and Confidence Score, then point at the pattern of NO pills. The bottom sentence is the slide.

---

## 10 · Literature Review Timeline

- 2017 — Auto-Filling Framework — rule-based web form autofill / breaks on unseen layouts
- 2020 — Digital Identity (SSI) — user-controlled credentials / not applied to recruitment
- 2020 — Autofill Security — attack-surface analysis / generic fields only
- 2024 — Sentence Embeddings — cheap semantic similarity / not used on form fields
- 2024 — Resume Parsing — structured CV extraction / one-way, no form mapping
- 2026 — PageGuide — LLM page understanding / no profile ontology
- 2026 — CommonForms — large-scale form corpus / not recruitment-specific
- 2026+ — **Our Research** — unifies all eight domains / recruitment-native ontology
**Bottom:** No existing research integrates all of these technologies into a unified recruitment-focused intelligent professional identity framework.

*Say:* One sentence per node — green dot is the contribution, red dot the limitation. Keep the full bibliography ready as an appendix; if asked whether integration alone is a contribution: integration plus the benchmark dataset plus confidence-gated mapping, each addressing a documented gap.

---

## 11 · Expected Outcomes & Evaluation

**ML metrics:** Accuracy ≥ 95% · Precision ≥ 93% · Recall ≥ 90% · F1 ≥ 0.92 · Semantic Matching Accuracy ≥ 95%
**Product metrics:** Time Saved ≥ 80% · Autofill Success Rate ≥ 90% · Manual Corrections ≤ 2/form · Cross-Platform Coverage 50+ portals · User Satisfaction ≥ 4.5/5 · Collection Coverage 20K+ fields
**KPI tiles:** 95%+ Semantic Mapping Accuracy · 20K+ Dataset Records · 50+ Websites · 100+ Semantic Categories

*Say:* Two lenses — model quality on the benchmark, and product outcomes from instrumented user studies. Say explicitly these are targets, not promises; the test that matters is accuracy on portals held out of training, and we will report the full coverage-accuracy curve.

---

## 12 · Research Contributions & Future Roadmap

**Contributions:** C1 Universal Professional Identity · C2 Semantic HTML Understanding · C3 Browser Extension · C4 AI Field Mapping · C5 Cross-Platform Autofill
**Roadmap:** Phase 1 Dataset Collection (Jun–Jul 2026, active) → Phase 2 Annotation (Aug 2026) → Phase 3 Model Training (Sep–Oct 2026) → Phase 4 AI Browser Autofill (Nov 2026) → Phase 5 Publication (Dec 2026) → Phase 6 Startup Product (2027 →)
**Future:** V2 Browser Expansion — Firefox · Edge · Safari; V3 Intelligence Expansion — Resume Parser · AI Resume Builder · Job Recommendation · ATS Optimization · Professional Identity Cloud

*Say:* Phases 1–2 are this internship's scope — be clear about that. Six months is realistic because the engineering substrate (monorepo, extension, hybrid engine) already runs; the research sits on working infrastructure.

---

## 13 · Conclusion

**Statement:** One Professional Profile. Unlimited Recruitment Platforms.
**Chain:** Professional Identity → AI → Browser → Recruitment → Future
**Close:** Thank You. · Questions & Discussion · institute logo · research title footer

*Say:* Deliver the statement slowly, thank the guide and panel by name, stop talking. Never introduce new content on a closing slide.
