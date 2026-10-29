# Evaluation Metrics

## Standardized Metrics for Semantic Field Mapping Assessment

---

### 1. Overview

This document defines the standardized evaluation metrics used to assess the performance of the semantic field mapping system. Metrics are organized into three categories: core information retrieval metrics, system performance metrics, and user experience metrics.

---

### 2. Core Information Retrieval Metrics

#### Metric 1: Field Detection Accuracy

**Definition:** The percentage of actual form fields on a page that the system correctly identifies and attempts to analyze.

**Formula:**  
$$\text{Detection Accuracy} = \frac{\text{Fields Detected}}{\text{Total Fields on Page}} \times 100$$

**Target:** ≥ 95% (the system should detect nearly all visible form inputs)

**Rationale:** Before semantic mapping can occur, the system must first detect form fields. Missing fields entirely is a worse failure than misclassifying them.

---

#### Metric 2: Semantic Mapping Accuracy

**Definition:** The percentage of detected fields that are correctly mapped to the expected ontology attribute.

**Formula:**  
$$\text{Mapping Accuracy} = \frac{\text{Correctly Mapped Fields}}{\text{Total Detected Fields}} \times 100$$

**Target:** ≥ 85% for the hybrid engine

---

#### Metric 3: Autofill Precision

**Definition:** Among all fields that the system auto-filled, the percentage that were filled correctly.

**Formula:**  
$$\text{Precision} = \frac{TP}{TP + FP}$$

Where TP = correctly filled, FP = incorrectly filled.

**Target:** ≥ 90% (critical — incorrect fills damage user trust)

---

#### Metric 4: Autofill Recall

**Definition:** Among all fields that should have been filled, the percentage that were actually filled correctly.

**Formula:**  
$$\text{Recall} = \frac{TP}{TP + FN}$$

Where FN = fields that should have been filled but were not (or filled incorrectly).

**Target:** ≥ 80%

---

#### Metric 5: F1-Score

**Definition:** The harmonic mean of precision and recall, providing a balanced measure of overall mapping quality.

**Formula:**  
$$F_1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

**Target:** ≥ 0.85

**Rationale:** F1 balances the tradeoff between not making mistakes (precision) and not missing opportunities (recall). A system that is too conservative (high precision, low recall) or too aggressive (high recall, low precision) both receive lower F1 scores.

---

### 3. System Performance Metrics

#### Metric 6: Average Inference Time

**Definition:** The mean time taken to analyze a single form field and produce a prediction, measured in milliseconds.

**Formula:**  
$$\text{Avg Inference Time} = \frac{\sum_{i=1}^{n} t_i}{n} \text{ ms}$$

**Target:** < 50ms per field (for responsive user experience)

**Measurement:** Captured via `performance.now()` before and after each field analysis.

---

#### Metric 7: Total Pipeline Execution Time

**Definition:** The wall-clock time from pipeline start to completion for all fields on a page.

**Formula:**  
$$\text{Pipeline Time} = t_{end} - t_{start} \text{ ms}$$

**Target:** < 500ms for a typical form (10-15 fields)

---

### 4. User Experience Metrics

#### Metric 8: Profile Completion Time Reduction

**Definition:** The percentage reduction in time required to complete a recruitment form compared to manual entry.

**Formula:**  
$$\text{Time Reduction} = \frac{T_{manual} - T_{assisted}}{T_{manual}} \times 100\%$$

**Target:** ≥ 70% time savings

**Measurement:** Comparative user study (future work) timing manual vs. assisted form completion.

---

#### Metric 9: Manual Typing Reduction

**Definition:** The percentage of keystrokes saved through automated field filling.

**Formula:**  
$$\text{Typing Reduction} = \frac{K_{manual} - K_{assisted}}{K_{manual}} \times 100\%$$

**Target:** ≥ 80% keystroke reduction

**Measurement:** Character count comparison between manually entered and auto-filled content.

---

#### Metric 10: User Correction Rate

**Definition:** The percentage of auto-filled fields that the user manually corrects after autofill.

**Formula:**  
$$\text{Correction Rate} = \frac{\text{Fields Corrected by User}}{\text{Fields Auto-Filled}} \times 100\%$$

**Target:** < 10% (most fills should be accurate)

**Measurement:** Telemetry system tracks `userCorrected` flag per field.

---

### 5. Confidence Calibration Metrics

#### Metric 11: Confidence Tier Accuracy

**Definition:** The actual accuracy of predictions within each confidence tier.

| Tier | Threshold | Expected Accuracy |
|------|-----------|-------------------|
| HIGH | ≥ 0.85 | ≥ 95% |
| MEDIUM | 0.60 – 0.84 | ≥ 70% |
| LOW | < 0.60 | Not auto-filled |

A well-calibrated system should achieve accuracy proportional to confidence.

---

### 6. Metric Implementation

All core IR metrics (accuracy, precision, recall, F1, inference time) are implemented in the `@platform/semantic-engine/src/benchmarking/metrics.ts` module and computed automatically by the `BenchmarkRunner`.

User experience metrics (8, 9, 10) are computed from telemetry data stored in the `AutofillSession` database table and accessible via the `/api/extension/telemetry` API endpoint.
