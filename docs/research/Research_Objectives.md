# Research Objectives

## AI-Powered Universal Professional Identity Platform

---

### Primary Research Objective

To design, implement, and evaluate an AI-powered browser-based system that leverages semantic understanding to automatically map heterogeneous recruitment form fields to a standardized professional profile ontology with measurable accuracy and confidence scoring.

---

### Specific Objectives

#### Objective 1: Design a Professional Profile Ontology

**Description:** Design and implement a comprehensive Professional Profile Ontology that formalizes 70+ professional attributes across 14 semantic categories (Personal, Contact, Social, Employment, Education, Project, Skill, Certification, Award, Language, Publication, Research, Preference, Portfolio).

**Deliverable:** A machine-readable ontology definition (`ontology.ts`) with each attribute characterized by: unique identifier, human-readable label, semantic description, data type, aliases (alternative naming conventions), profile data path, example values, and inter-attribute relationships.

**Success Criteria:** The ontology covers ≥90% of fields encountered across the five target ATS platforms (Greenhouse, Lever, Workday, LinkedIn Easy Apply, Indeed).

---

#### Objective 2: Develop a Hybrid Semantic Field Understanding Engine

**Description:** Develop a modular, extensible Semantic Field Understanding Engine that combines three independent mapping strategies through weighted fusion to map form fields to ontology attributes.

**Strategies:**
1. **Rule Engine** (weight: 0.35) — Deterministic regex pattern matching against field metadata
2. **Keyword Matcher** (weight: 0.20) — Jaccard similarity between tokenized field text and ontology aliases
3. **Semantic Matcher** (weight: 0.15) — TF-IDF vectorization with cosine similarity for semantic comparison

**Deliverable:** The `@platform/semantic-engine` package implementing all three strategies, a hybrid fusion mapper, and a plugin interface for future strategy additions.

**Success Criteria:** The hybrid engine achieves ≥85% F1-score on the evaluation dataset.

---

#### Objective 3: Create a Recruitment Form Research Dataset

**Description:** Create a curated, annotated dataset of recruitment form fields from major ATS platforms, with ground-truth ontology attribute mappings for research evaluation.

**Deliverable:** A database-backed dataset (`FormDatasetEntry` model) with 50+ manually curated and verified entries from 5+ platforms.

**Success Criteria:** The dataset covers all 14 semantic categories and includes realistic field metadata (labels, names, IDs, placeholders, ARIA attributes, DOM context).

---

#### Objective 4: Implement Confidence-Scored Autofill

**Description:** Implement a three-tier confidence classification system (HIGH ≥ 0.85, MEDIUM ≥ 0.60, LOW < 0.60) that gates autofill behavior based on prediction certainty.

**Deliverable:** Enhanced autofill pipeline with:
- HIGH confidence: Automatic fill with green visual indicator
- MEDIUM confidence: Automatic fill with amber visual indicator (flagged for review)
- LOW confidence: No fill, red visual indicator (manual entry required)

**Success Criteria:** Zero incorrect fills for HIGH confidence predictions; <5% incorrect fills for MEDIUM confidence predictions.

---

#### Objective 5: Establish Evaluation Metrics and Benchmarking Framework

**Description:** Define standardized evaluation metrics and implement an automated benchmarking framework for reproducible strategy comparison.

**Metrics:**
1. Field Detection Accuracy
2. Semantic Mapping Accuracy
3. Autofill Precision
4. Autofill Recall
5. F1-Score
6. Average Inference Time (ms per field)

**Deliverable:** `BenchmarkRunner` class that evaluates strategies against the test dataset and generates comparison reports.

**Success Criteria:** The framework produces reproducible results and enables fair comparison of current and future mapping strategies.

---

#### Objective 6: Validate Through Comparative Experiments

**Description:** Design and execute controlled experiments comparing individual strategies and the hybrid approach across the evaluation dataset.

**Experiments:**
- E1: Rule Engine baseline
- E2: Keyword Matcher standalone
- E3: Semantic Matcher standalone
- E4: Hybrid Mapper (all strategies)
- E5: Ablation study (removing each strategy)
- E6: Confidence threshold sensitivity analysis

**Deliverable:** Experimental results with statistical analysis demonstrating the effectiveness of the hybrid approach.

**Success Criteria:** The hybrid approach (E4) demonstrably outperforms any individual strategy (E1–E3) in F1-score.

---

### Alignment with Research Gaps

| Objective | Addresses Gap |
|-----------|--------------|
| Obj. 1: Profile Ontology | Gap 1: No semantic+ontology system |
| Obj. 2: Hybrid Engine | Gap 2: ATS heterogeneity; Gap 4: Rigid rules |
| Obj. 3: Research Dataset | Gap 3: No benchmark dataset |
| Obj. 4: Confidence Scoring | Gap 4: Rigid rules fail |
| Obj. 5: Benchmarking | Gap 3: No benchmark dataset |
| Obj. 6: Experiments | Gap 1, 2, 3, 4: Validation |
