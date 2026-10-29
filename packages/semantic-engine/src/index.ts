// ────────────────────────────────────────────────────────────────────────────
// @platform/semantic-engine — Package Entry Point
// ────────────────────────────────────────────────────────────────────────────
// Re-exports all public APIs from the Semantic Field Understanding Engine.
// ────────────────────────────────────────────────────────────────────────────

// Core interfaces and types
export {
  FieldDescriptor,
  MappingStrategy,
  FieldAnalysisResult,
  EngineConfig,
  FieldPrediction,
  ConfidenceLevel,
  MappingSource,
} from './interfaces';

// Main engine
export { SemanticFieldEngine } from './engine';

// Ontology registry
export {
  getAttributeById,
  getAttributesByCat,
  getAllAliasMap,
  getSearchableText,
  getAllAttributes,
} from './ontology-registry';

// Strategies
export { RuleEngineStrategy } from './strategies/rule-engine';
export { KeywordMatcherStrategy } from './strategies/keyword-matcher';
export { SemanticMatcherStrategy } from './strategies/semantic-matcher';

// Hybrid mapper
export { fuseStrategies } from './hybrid-mapper';

// Similarity utilities
export { cosineSimilarity } from './similarity';

// TF-IDF vectorizer
export { TfIdfVectorizer, tokenize, STOP_WORDS } from './vectorizers/tfidf';

// Knowledge base
export {
  SiteFieldMapping,
  SiteMappingConfig,
  SITE_MAPPINGS,
  detectPlatform,
  findSiteMapping,
} from './knowledge-base/index';

// Benchmarking
export { BenchmarkRunner, TestCaseResult } from './benchmarking/index';
export { TestCase, TEST_DATASET } from './benchmarking/test-dataset';
export { accuracy, precision, recall, f1Score } from './benchmarking/metrics';
