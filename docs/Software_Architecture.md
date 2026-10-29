# Software Architecture Document

## 1. System Topology
The platform uses a monorepo topology powered by Turborepo and pnpm workspaces. The architecture isolates the presentation layer (Next.js web and admin applications, Chrome Extension MV3) from shared packages containing databases, Zod validation logic, type definitions, and core utility classes.

```
                  +-------------------+-------------------+
                  |     apps/web      |    apps/admin     |
                  | (Next.js Portal)  |  (Next.js Admin)  |
                  +---------+---------+---------+---------+
                            |                   |
                            +---------+---------+
                                      |
                                      v
                              +---------------+
                              |   packages/   |
                              |  db, types,   |
                              |  validation,  |
                              |  utils, ui    |
                              +---------------+
                                      ^
                                      |
                            +---------+---------+
                            |  apps/extension   |
                            | (Chrome Popup)    |
                            +-------------------+
```

## 2. Shared Packages Description
- **`@platform/db`**: Encapsulates the Prisma Client instance, migration configurations, and the central PostgreSQL model schema.
- **`@platform/validation`**: Exports shared Zod validation schemas to unify front-end form validation with back-end API payload checks.
- **`@platform/types`**: Declares shared TypeScript types and data models.
- **`@platform/ui`**: Consolidates design system primitives built with Tailwind CSS.
- **`@platform/utils`**: Standardizes shared mechanisms, including the global branding module, security logger, and formatting helpers.
- **`@platform/api-client`**: Implements a fetch API client wrapper equipped with query retry limits and exponential backoff parameters.

## 3. Extension Sandboxing and Sync Lifecycle
The browser extension popup interfaces with the web application via cookie-based session verification:
1. **Background Script**: Inspects localhost application cookies using the `chrome.cookies` API to retrieve active JWT session keys.
2. **Tab Communication**: Content scripts inspect target DOM trees for candidate inputs. Telemetry data is returned to the background script, which dispatches payload requests to backend API handlers.
3. **Execution Sandboxing**: Content scripts run inside isolated environments to prevent cross-site scripting (XSS) leaks.

## 4. Research Architecture — Dual-System Design

The platform operates as two complementary systems sharing a unified codebase:

### System 1: Production SaaS Platform
User-facing web application and browser extension for professional profile management, AI resume generation, and intelligent form autofill.

### System 2: Experimental AI Research Framework
Ontology engineering, semantic field understanding engine, recruitment form dataset, benchmarking framework, and experiment tracking for academic research evaluation.

### Updated System Topology

```
                  +-------------------+-------------------+
                  |     apps/web      |    apps/admin     |
                  | (Next.js Portal)  |  (Next.js Admin)  |
                  | + Intelligence    | + Experiment APIs |
                  | + Telemetry APIs  | + Dataset APIs    |
                  +---------+---------+---------+---------+
                            |                   |
                            +---------+---------+
                                      |
                                      v
             +------------------------------------------------+
             |              packages/ (shared)                 |
             |  +----------------+  +---------------------+   |
             |  | @platform/db   |  | @platform/types     |   |
             |  | + 4 Research   |  | + Ontology (70+)    |   |
             |  |   Models       |  | + Semantic Types    |   |
             |  +----------------+  +---------------------+   |
             |  +---------------------+  +----------------+   |
             |  | @platform/semantic  |  | @platform/     |   |
             |  |   -engine [NEW]     |  | validation,    |   |
             |  | + Rule Engine       |  | utils, ui,     |   |
             |  | + Keyword Matcher   |  | api-client     |   |
             |  | + Semantic Matcher  |  +----------------+   |
             |  | + Hybrid Mapper     |                        |
             |  | + TF-IDF Vectorizer |                        |
             |  | + Knowledge Base    |                        |
             |  | + Benchmarking      |                        |
             |  +---------------------+                        |
             +------------------------------------------------+
                                      ^
                                      |
                            +---------+---------+
                            |  apps/extension   |
                            | + Semantic        |
                            |   Analyzer [NEW]  |
                            | + Confidence-Gated|
                            |   Autofill        |
                            | + Structured      |
                            |   Telemetry       |
                            +-------------------+
```

## 5. Semantic Engine Data Flow

```
Form Field (DOM)
     │
     ▼
┌─────────────────┐
│ Semantic Analyzer│  Extract 14 contextual signals
│ (Content Script) │  (label, aria, nearby text, DOM path...)
└────────┬────────┘
         │ FieldDescriptor
         ▼
┌─────────────────────────────────────────────┐
│           Semantic Field Engine             │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │   Rule   │ │ Keyword  │ │  Semantic  │  │
│  │  Engine  │ │ Matcher  │ │  Matcher   │  │
│  │ (regex)  │ │(Jaccard) │ │(TF-IDF+cos)│ │
│  └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│       └──────┬──────┘             │          │
│              ▼                    │          │
│      ┌───────────────┐           │          │
│      │ Hybrid Mapper │◄──────────┘          │
│      │ (Weighted     │                      │
│      │  Fusion)      │                      │
│      └───────┬───────┘                      │
│              ▼                              │
│    ┌──────────────────┐                     │
│    │ Confidence Gate  │                     │
│    │ HIGH|MEDIUM|LOW  │                     │
│    └──────────────────┘                     │
└─────────────────────────────────────────────┘
         │ FieldPrediction
         ▼
┌─────────────────┐
│ Autofill Pipeline│  Fill HIGH+MEDIUM, skip LOW
│ (Content Script) │  Apply visual indicators
└────────┬────────┘
         │ AutofillReport
         ▼
┌─────────────────┐
│  Background SW  │  Strip PII, send telemetry
│  (Service Worker)│  POST /api/extension/telemetry
└─────────────────┘
```

## 6. Database Research Models

Four new models extend the existing Prisma schema for research infrastructure:

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `FormDatasetEntry` | Annotated form field dataset | platform, fieldLabel, ontologyAttributeId, isVerified |
| `AutofillSession` | Structured autofill telemetry | platform, highConfidence, mediumConfidence, lowConfidence, avgConfidence |
| `ExperimentRun` | Benchmark experiment results | strategy, accuracy, precision, recall, f1Score |
| `ProfileVariant` | Scenario-based resume variants | userId, targetRole, scenario, structure |

