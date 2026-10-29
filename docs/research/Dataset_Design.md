# Dataset Design

## Recruitment Form Field Research Dataset

---

### 1. Purpose

The Recruitment Form Field Dataset is a curated, annotated collection of web form field metadata from major Applicant Tracking System (ATS) platforms. Each entry captures the structural and textual characteristics of a single form field along with its ground-truth mapping to the Professional Profile Ontology. The dataset serves as the primary evaluation resource for benchmarking semantic field mapping strategies.

---

### 2. Schema Definition

Each dataset entry is stored in the `FormDatasetEntry` PostgreSQL model with the following attributes:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `platform` | String | ATS platform name (e.g., "Greenhouse", "Lever") |
| `pageUrl` | String | Source URL (anonymized) |
| `pageType` | String | Page type: "application", "profile", "registration" |
| `fieldName` | String | HTML `name` attribute |
| `fieldId` | String? | HTML `id` attribute |
| `fieldLabel` | String? | Extracted label text |
| `fieldPlaceholder` | String? | Placeholder attribute |
| `fieldType` | String | HTML element type (INPUT, TEXTAREA, SELECT) |
| `inputType` | String? | Input type (text, email, tel, file, url, etc.) |
| `ariaLabel` | String? | aria-label attribute |
| `nearbyHeading` | String? | Nearest section heading |
| `parentSection` | String? | Parent fieldset/section context |
| `domHierarchy` | String? | Simplified DOM path |
| `validationRules` | String? | HTML pattern or validation attributes |
| `semanticCategory` | String? | Ontology category (PERSONAL, CONTACT, etc.) |
| `ontologyAttributeId` | String? | Ground-truth ontology attribute ID |
| `isVerified` | Boolean | Human verification flag |
| `createdAt` | DateTime | Record creation timestamp |
| `updatedAt` | DateTime | Last modification timestamp |

---

### 3. Collection Methodology

#### 3.1 Semi-Automated DOM Crawling

1. Navigate to target platform application forms using a browser
2. Execute the `analyzePageFields()` function from the semantic analyzer to extract all field descriptors
3. Export descriptors as JSON for manual annotation
4. Alternatively, collect field metadata through manual DOM inspection using browser DevTools

#### 3.2 Manual Annotation Pipeline

1. **Extraction:** For each field, record all 17 metadata attributes
2. **Classification:** Assign the appropriate `semanticCategory` from the 14 predefined categories
3. **Mapping:** Assign the ground-truth `ontologyAttributeId` from the Professional Profile Ontology
4. **Verification:** A second annotator independently verifies the mapping
5. **Resolution:** Disagreements resolved through discussion; final mapping marked as `isVerified = true`

#### 3.3 Quality Assurance

- **Coverage Check:** Ensure all 14 semantic categories are represented
- **Platform Balance:** Maintain approximately equal representation across target platforms
- **Difficulty Distribution:** Include both easy (clear labels) and hard (ambiguous/generic labels) fields
- **Edge Cases:** Include fields with no label, dynamically generated IDs, and non-standard patterns

---

### 4. Target Platforms and Coverage

| Platform | Target Fields | Form Type | Priority |
|----------|--------------|-----------|----------|
| Greenhouse | 10-15 | Application form (`#application_form`) | HIGH |
| Lever | 8-12 | Application form (`#application-form`) | HIGH |
| Workday | 10-15 | Multi-step application wizard | HIGH |
| LinkedIn Easy Apply | 8-10 | Modal multi-step application | MEDIUM |
| Indeed | 8-10 | Application + profile form | MEDIUM |
| Generic Forms | 5-10 | Various HTML forms | LOW |

**Total Target:** 50-72 entries in initial seed dataset

---

### 5. Initial Seed Dataset Composition

The initial seed dataset includes 50 manually curated entries distributed as follows:

| Category | Count | Example Fields |
|----------|-------|----------------|
| PERSONAL | 8 | First Name, Last Name, Full Name, Headline, Bio, Location, Gender |
| CONTACT | 4 | Email, Phone |
| SOCIAL | 6 | LinkedIn URL, GitHub URL, Website URL, Twitter URL |
| EMPLOYMENT | 8 | Company, Position, Start Date, End Date, Description |
| EDUCATION | 6 | Institution, Degree, Field of Study, GPA |
| PROJECT | 4 | Project Title, Description, Technologies |
| SKILL | 3 | Skill Name, Proficiency Level |
| CERTIFICATION | 3 | Certification Name, Issuer |
| PORTFOLIO | 3 | Resume/CV File Upload, Portfolio URL |
| PREFERENCE | 5 | Salary, Work Authorization, Remote Preference, Years of Experience |

---

### 6. Database Indexes

For efficient querying during benchmarking:
- `@@index([platform])` — Filter by ATS platform
- `@@index([semanticCategory])` — Filter by ontology category
- `@@index([isVerified])` — Filter verified entries only

---

### 7. Dataset Access API

The dataset is accessible through the `/api/dataset` REST endpoint:

- **GET** `/api/dataset` — List entries with optional filters (`platform`, `semanticCategory`, `isVerified`)
- **POST** `/api/dataset` — Create new entry (admin-only)

The `BenchmarkRunner` in `@platform/semantic-engine` uses a built-in `TEST_DATASET` constant containing 50 hardcoded test cases for offline evaluation without database access.

---

### 8. Future Dataset Expansion

- **Crowdsourced Annotation:** Enable community contributions with verification pipeline
- **Automated Collection:** Browser extension reports encountered fields (with user consent) for dataset expansion
- **Cross-Lingual Extension:** Include non-English form fields for multilingual evaluation
- **Temporal Tracking:** Version the dataset to track how ATS platforms change form structures over time
