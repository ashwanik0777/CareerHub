# Experiment Design

## Comparative Evaluation of Semantic Field Mapping Strategies

---

### 1. Research Question

**RQ:** Does the proposed hybrid semantic mapping engine (combining rule-based, keyword, and TF-IDF strategies through weighted fusion) achieve significantly higher field mapping accuracy than any individual strategy alone?

---

### 2. Experimental Setup

#### 2.1 Environment

| Parameter | Value |
|-----------|-------|
| Platform | Node.js 20+ runtime |
| Language | TypeScript (compiled to ES2020) |
| Package | `@platform/semantic-engine` |
| Dataset | Built-in `TEST_DATASET` (50 entries) |
| Ontology | Professional Profile Ontology (70+ attributes) |
| Hardware | Standardized across all runs (same machine) |

#### 2.2 Strategy Configurations

| Strategy | Implementation | Weight |
|----------|---------------|--------|
| Rule Engine | Regex pattern matching against field metadata | 0.35 |
| Keyword Matcher | Jaccard similarity with ontology aliases | 0.20 |
| Semantic Matcher | TF-IDF vectorization + cosine similarity | 0.15 |
| Hybrid Mapper | Weighted fusion of all strategies | — |

---

### 3. Experiments

#### Experiment E1: Rule Engine Baseline

**Objective:** Establish the baseline performance of deterministic regex-based field mapping.

**Procedure:**
1. Initialize `RuleEngine` strategy with weight 1.0
2. Run `BenchmarkRunner.evaluate(ruleEngine, TEST_DATASET)`
3. Record accuracy, precision, recall, F1, inference time

**Expected Outcome:** High precision on known patterns but low recall on non-standard field naming.

---

#### Experiment E2: Keyword Matcher Standalone

**Objective:** Evaluate the effectiveness of ontology-alias-based keyword matching.

**Procedure:**
1. Initialize `KeywordMatcher` strategy with weight 1.0
2. Run `BenchmarkRunner.evaluate(keywordMatcher, TEST_DATASET)`
3. Record all metrics

**Expected Outcome:** Moderate precision and recall, with better generalization than rules on novel labels.

---

#### Experiment E3: Semantic Matcher Standalone

**Objective:** Evaluate TF-IDF + cosine similarity for semantic field understanding.

**Procedure:**
1. Initialize `SemanticMatcher` strategy with weight 1.0
2. Run `BenchmarkRunner.evaluate(semanticMatcher, TEST_DATASET)`
3. Record all metrics

**Expected Outcome:** Best generalization to unseen field names but potentially lower precision on well-known patterns.

---

#### Experiment E4: Hybrid Mapper (All Strategies Combined)

**Objective:** Evaluate the weighted fusion of all three strategies through the `HybridMapper`.

**Procedure:**
1. Initialize `SemanticFieldEngine` with all three strategies at default weights
2. Run `BenchmarkRunner.evaluate(hybridEngine, TEST_DATASET)`
3. Record all metrics

**Expected Outcome:** Highest F1-score, combining the precision of rules with the recall of semantic matching.

---

#### Experiment E5: Ablation Study

**Objective:** Determine the marginal contribution of each strategy to the hybrid performance.

**Procedure:**
1. **E5a:** Hybrid without Rule Engine (Keyword + Semantic only)
2. **E5b:** Hybrid without Keyword Matcher (Rule + Semantic only)
3. **E5c:** Hybrid without Semantic Matcher (Rule + Keyword only)
4. Compare each ablated variant against E4 (full hybrid)

**Expected Outcome:** Removing any single strategy reduces overall F1, confirming that each strategy contributes unique value.

---

#### Experiment E6: Confidence Threshold Sensitivity

**Objective:** Analyze how varying the HIGH/MEDIUM/LOW confidence thresholds affects autofill accuracy and coverage.

**Procedure:**
1. Fix strategy as Hybrid Mapper (E4 configuration)
2. Vary HIGH threshold: 0.70, 0.75, 0.80, 0.85, 0.90, 0.95
3. Vary MEDIUM threshold: 0.40, 0.50, 0.55, 0.60, 0.65, 0.70
4. For each threshold pair, compute:
   - Coverage (% of fields that would be auto-filled)
   - Accuracy of auto-filled fields
   - Error rate (incorrect auto-fills)

**Expected Outcome:** Higher thresholds reduce errors but also reduce coverage. The optimal tradeoff balances user convenience with accuracy.

---

### 4. Metrics

| Metric | Formula | Description |
|--------|---------|-------------|
| Accuracy | TP / Total | Percentage of correctly mapped fields |
| Precision | TP / (TP + FP) | Correctness of positive predictions |
| Recall | TP / (TP + FN) | Completeness of positive predictions |
| F1-Score | 2 × (P × R) / (P + R) | Harmonic mean of precision and recall |
| Avg Inference Time | Σ time / n | Mean analysis time per field (ms) |

Where:
- **TP** = Predicted attribute matches expected attribute
- **FP** = Prediction made but incorrect
- **FN** = No prediction made (or wrong prediction) when expected

---

### 5. Expected Results

| Experiment | Expected Accuracy | Expected F1 | Expected Avg Time |
|------------|------------------|-------------|-------------------|
| E1: Rule Engine | 75-85% | 0.75-0.85 | < 1ms |
| E2: Keyword Matcher | 60-75% | 0.60-0.75 | 1-3ms |
| E3: Semantic Matcher | 55-70% | 0.55-0.70 | 3-8ms |
| E4: Hybrid Mapper | **85-95%** | **0.85-0.95** | 5-12ms |

---

### 6. Statistical Analysis

- **Significance Testing:** McNemar's test for pairwise strategy comparison
- **Confidence Intervals:** 95% CI for all reported metrics
- **Effect Size:** Cohen's kappa for agreement between strategies
- **Visualization:** Confusion matrices, precision-recall curves, threshold sensitivity plots

---

### 7. Reproducibility

All experiments are reproducible through:

```bash
# Build the semantic engine package
pnpm --filter @platform/semantic-engine build

# Run all benchmarks
pnpm --filter @platform/semantic-engine test
```

The `BenchmarkRunner` outputs a formatted comparison table to stdout with all metrics.
