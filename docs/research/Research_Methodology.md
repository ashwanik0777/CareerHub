# Research Methodology

## AI-Powered Universal Professional Identity Platform

---

### 1. Research Approach

This research adopts a **mixed-methods approach** combining **Design Science Research (DSR)** for artifact creation with **quantitative experimental evaluation** for validation. This combination is appropriate because the work produces both novel software artifacts (the semantic engine, ontology, dataset) and empirical evidence of their effectiveness (benchmark experiments, metrics).

---

### 2. Design Science Research Framework

Following the DSR methodology [Hevner et al., 2004], the research proceeds through iterative cycles of:

1. **Problem Identification** — Analyzing the limitations of existing autofill systems in recruitment contexts
2. **Objective Definition** — Specifying measurable success criteria for the semantic mapping system
3. **Design & Development** — Creating the ontology, engine, and evaluation artifacts
4. **Demonstration** — Deploying the system as a browser extension and web platform
5. **Evaluation** — Benchmarking performance against defined metrics
6. **Communication** — Documenting findings in research documentation and code

#### Artifact Types Produced

| Artifact | Type | Description |
|----------|------|-------------|
| Professional Profile Ontology | Model | Formal attribute representation with 70+ concepts |
| Semantic Field Understanding Engine | Method | Hybrid mapping algorithm with weighted fusion |
| Recruitment Form Dataset | Data | Annotated field-to-attribute mapping dataset |
| Benchmarking Framework | Tool | Automated evaluation and comparison system |
| Browser Extension | System | Production deployment of the research artifacts |

---

### 3. System Architecture Design

The system follows a **modular plugin architecture** that enables independent development, testing, and replacement of mapping strategies:

```
┌─────────────────────────────────────────────────────┐
│                  Semantic Field Engine               │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────┐  │
│  │ Rule Engine   │ │Keyword Matcher│ │  Semantic   │  │
│  │ (w=0.35)     │ │  (w=0.20)     │ │ Matcher    │  │
│  │ Regex rules  │ │ Jaccard sim.  │ │ (w=0.15)   │  │
│  │ Site overrides│ │ Ontology alias│ │ TF-IDF     │  │
│  └──────┬───────┘ └──────┬────────┘ └─────┬──────┘  │
│         └───────────┬────┘               │          │
│                     ▼                    │          │
│            ┌────────────────┐            │          │
│            │  Hybrid Mapper │◄───────────┘          │
│            │ Weighted Fusion│                        │
│            └───────┬────────┘                        │
│                    ▼                                 │
│        ┌─────────────────────┐                       │
│        │ Confidence Classifier│                       │
│        │ HIGH | MEDIUM | LOW │                       │
│        └─────────────────────┘                       │
└─────────────────────────────────────────────────────┘
```

Each strategy implements the `MappingStrategy` interface:
```typescript
interface MappingStrategy {
  name: string;
  weight: number;
  analyze(descriptor: FieldDescriptor): FieldPrediction[];
}
```

---

### 4. Implementation Technology

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Language | TypeScript | Type safety, shared code between browser and server |
| Build System | Turborepo + pnpm | Monorepo management with workspace dependencies |
| Web Application | Next.js 16.2.9 | Server components, API routes, middleware |
| Browser Extension | Vite + React (MV3) | Fast builds, modern tooling |
| Database | PostgreSQL (Neon) | Serverless, relational data model |
| ORM | Prisma 5.x | Type-safe database queries, schema management |
| NLP | Custom TF-IDF | No external dependency, browser-compatible |
| Testing | Custom BenchmarkRunner | Domain-specific evaluation framework |

---

### 5. Data Collection Methodology

#### 5.1 Form Field Dataset

**Collection Process:**
1. **Platform Selection:** Identify top 5 ATS platforms by market share
2. **Form Crawling:** Manually navigate application forms and capture DOM structure
3. **Field Extraction:** Extract 17 metadata attributes per field (label, name, id, placeholder, type, inputType, ariaLabel, nearbyHeading, parentSection, domHierarchy, validationRules, etc.)
4. **Ground Truth Annotation:** Map each field to the corresponding ontology attribute ID
5. **Verification:** Independent verification by a second annotator
6. **Database Storage:** Store in `FormDatasetEntry` PostgreSQL table via Prisma

**Quality Assurance:**
- Human verification (`isVerified` flag)
- Semantic category consistency checks
- Cross-platform coverage validation

#### 5.2 Autofill Telemetry

**Collection Process:**
1. Extension captures per-field autofill results during real usage
2. PII is stripped before transmission (URL sanitized, no field values stored)
3. Structured telemetry stored in `AutofillSession` database table
4. Telemetry includes: platform, field count, fill rate, confidence distribution, execution time

---

### 6. Experimental Methodology

#### 6.1 Independent Variable
- **Mapping Strategy:** Rule Engine, Keyword Matcher, Semantic Matcher, Hybrid Mapper, Ablation variants

#### 6.2 Dependent Variables
- Accuracy, Precision, Recall, F1-Score, Average Inference Time (ms)

#### 6.3 Control Variables
- Test dataset (fixed 50+ entries)
- Confidence thresholds (HIGH ≥ 0.85, MEDIUM ≥ 0.60)
- Hardware environment (consistent across all runs)

#### 6.4 Experimental Procedure
1. Initialize strategy with the Professional Profile Ontology
2. Run strategy against each test case in the dataset
3. Record predicted attribute ID, confidence score, and inference time
4. Compare predicted vs. expected attribute ID for correctness
5. Compute aggregate metrics using the `BenchmarkRunner`
6. Repeat for each strategy configuration

---

### 7. Evaluation Criteria

The system is evaluated on dual criteria:

**Engineering Criteria:**
- Build success (zero compilation errors)
- Runtime stability (no crashes during autofill)
- Execution speed (< 100ms per field analysis)
- Cross-platform compatibility (works on 5 target ATS)

**Research Criteria:**
- Mapping accuracy (≥ 85% F1 target)
- Confidence calibration (HIGH predictions ≥ 95% accurate)
- Strategy comparison validity (statistical significance)
- Dataset quality (inter-annotator agreement)

---

### 8. Ethical Considerations

- **Privacy:** User profile data never leaves the local environment without explicit consent. Telemetry is PII-stripped.
- **Transparency:** Confidence scores communicate system uncertainty to users, enabling informed decisions.
- **Consent:** Users explicitly trigger autofill; no automatic data injection without user action.
- **Data Minimization:** Only structural metadata (labels, attributes) stored in the research dataset, not actual user data.
