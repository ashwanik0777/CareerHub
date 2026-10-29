# Research Gap Analysis

## AI-Powered Universal Professional Identity Platform

---

### 1. Introduction

Despite advances in web form understanding, semantic matching, and recruitment automation, a systematic analysis of the existing literature and commercial landscape reveals five critical research gaps that the proposed platform addresses.

---

### 2. Identified Research Gaps

#### Gap 1: No Unified Semantic-Ontology System for Recruitment Form Automation

**Observation:** Existing browser autofill mechanisms (Chrome Autofill, Firefox Autofill) and password managers (LastPass, 1Password) implement generic form filling for personal data (name, address, payment) but lack domain-specific professional profile understanding. Meanwhile, ontology engineering research has produced sophisticated knowledge representation frameworks, but these have not been applied to the recruitment form domain.

**Gap:** No existing system combines a formal professional profile ontology with semantic field understanding specifically designed for heterogeneous recruitment form automation. The intersection of ontology-based attribute representation and intelligent form field mapping remains unexplored.

**Significance:** A unified approach would enable accurate automated mapping of form fields to standardized professional attributes across diverse ATS platforms, significantly reducing candidate effort during job applications.

---

#### Gap 2: Unresolved Heterogeneity in ATS Field Naming Conventions

**Observation:** Major ATS platforms (Greenhouse, Lever, Workday, Taleo, LinkedIn, Indeed) each use distinct HTML structures, field naming conventions, and input types for semantically identical information. Current autofill tools rely on rigid pattern matching that fails when encountering unseen form layouts.

**Gap:** No published research systematically catalogs and analyzes the structural heterogeneity of recruitment form fields across ATS platforms. Without such analysis, it is impossible to develop robust mapping strategies that generalize beyond known platforms.

**Significance:** Understanding and addressing this heterogeneity is essential for building autofill systems that work reliably across the fragmented ATS ecosystem, rather than breaking on each new platform.

---

#### Gap 3: Absence of a Public Benchmark Dataset for Recruitment Form Field Mapping

**Observation:** Machine learning and NLP benchmarks exist for general-purpose tasks (GLUE, SQuAD, CoNLL) and for form understanding (FUNSD for scanned forms). However, no publicly available dataset captures the diversity of recruitment web form fields with ground-truth ontology mappings.

**Gap:** The research community lacks a standardized evaluation dataset for comparing and benchmarking recruitment form field detection and semantic mapping approaches. Without such a dataset, reproducible evaluation and comparison of competing approaches is not possible.

**Significance:** A curated benchmark dataset would accelerate research in recruitment form automation by enabling fair comparison of different mapping strategies (rule-based, ML-based, LLM-based) using consistent evaluation metrics.

---

#### Gap 4: Rigid Rule-Based Autofill Fails on Unseen Form Layouts

**Observation:** Browser-native autofill and most extension-based autofill tools use static regex pattern matching against field attributes (name, id, placeholder, label). These systems achieve reasonable accuracy on well-known form templates but degrade significantly on novel or non-standard layouts.

**Gap:** No existing system implements a progressive, multi-strategy mapping architecture that gracefully degrades from deterministic rules through statistical matching to semantic understanding. The concept of "confidence-scored" field mapping — where the system communicates its uncertainty to the user — is absent from current commercial tools.

**Significance:** A hybrid approach combining deterministic, statistical, and semantic strategies provides both the reliability of rules on known forms and the generalization capability of semantic understanding on novel forms, with confidence scores enabling informed human oversight.

---

#### Gap 5: Privacy-Preserving Selective Profile Sharing Unexplored in Recruitment

**Observation:** Self-Sovereign Identity (SSI) and Verifiable Credentials research has established principles for user-controlled data sharing. However, these concepts have not been applied to the specific context of recruitment, where candidates need to selectively share professional attributes with different employers based on role relevance and personal privacy preferences.

**Gap:** No system provides scope-based, category-level control over which professional profile attributes are shared during the autofill process. Current tools apply an all-or-nothing approach: either fill everything or nothing.

**Significance:** Privacy-preserving selective sharing would enable candidates to control their professional data disclosure, sharing comprehensive technical details for engineering roles while withholding irrelevant information, aligning with emerging data protection regulations (GDPR, CCPA).

---

### 3. Summary

| Gap | Domain | Status |
|-----|--------|--------|
| Semantic + Ontology for recruitment forms | Ontology Engineering × Form Automation | **Unaddressed** |
| ATS field heterogeneity analysis | Web Form Understanding | **Under-researched** |
| Benchmark dataset for field mapping | Evaluation Methodology | **Non-existent** |
| Multi-strategy confidence-scored mapping | NLP × Human-AI Interaction | **Novel** |
| Privacy-preserving selective sharing | Digital Identity × Recruitment | **Unexplored** |

These five gaps collectively motivate the design and implementation of the proposed AI-Powered Universal Professional Identity Platform.
