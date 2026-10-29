# Problem Statement

## AI-Powered Universal Professional Identity Platform

---

### 1. Context

The modern job application process requires professionals to repeatedly enter identical information across dozens of recruitment platforms, each implementing unique form structures and field naming conventions. Despite the existence of browser autofill and password manager technologies, these tools fail to address the domain-specific vocabulary and structural heterogeneity of recruitment forms, resulting in a tedious, error-prone, and time-consuming application experience.

---

### 2. Problem Definition

**How can an intelligent browser-based system leverage semantic understanding to automatically and accurately map heterogeneous recruitment web form fields to a standardized professional profile ontology, while providing confidence-scored predictions that enable informed human oversight and supporting reproducible research evaluation?**

---

### 3. Sub-Problems

The central problem decomposes into the following sub-problems:

#### SP1: Professional Knowledge Representation
How should professional identity attributes be formally represented to capture the semantic richness, relationships, and variations required for accurate form field mapping across diverse platforms?

#### SP2: Semantic Field Understanding
Given a web form field characterized by its label, name, ID, placeholder, ARIA attributes, and DOM context, how can the system determine which professional attribute the field expects, and how confident is that determination?

#### SP3: Multi-Strategy Mapping Fusion
How should predictions from multiple independent mapping strategies (deterministic rules, keyword matching, statistical similarity) be combined to produce a single, optimized prediction with a meaningful confidence score?

#### SP4: Confidence-Gated Automation
At what confidence thresholds should the system autonomously fill form fields, seek user confirmation, or defer entirely to manual input, in order to maximize both automation rate and accuracy?

#### SP5: Evaluation and Benchmarking
How can the accuracy, precision, and efficiency of different field mapping strategies be systematically evaluated and compared using a standardized test dataset and metrics?

#### SP6: Privacy-Preserving Sharing
How can the system enable selective, scope-based professional attribute sharing that respects user privacy preferences while maximizing autofill utility?

---

### 4. Scope

This research addresses the problem within the following boundaries:

- **Platform Scope:** Five major ATS platforms (Greenhouse, Lever, Workday, LinkedIn Easy Apply, Indeed) plus generic HTML forms
- **Language Scope:** English-language form fields (cross-lingual support identified as future work)
- **Technology Scope:** Browser extension (Chrome MV3) with web application backend (Next.js)
- **AI Scope:** Statistical NLP methods (TF-IDF, cosine similarity, Jaccard similarity); transformer-based and LLM approaches identified as future work
- **Attribute Scope:** 70+ professional attributes across 14 semantic categories

---

### 5. Expected Contributions

1. A formal **Professional Profile Ontology** with 70+ semantically defined attributes
2. A **Hybrid Semantic Field Understanding Engine** combining rule-based, keyword, and embedding-based strategies
3. A **Recruitment Form Research Dataset** for benchmarking field mapping accuracy
4. A **Confidence-Scored Autofill Pipeline** with THREE-tier (HIGH/MEDIUM/LOW) classification
5. An **Evaluation Framework** with standardized metrics for reproducible comparison
