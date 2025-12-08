# ICD-10 vs ICD-11: APIs, Data Structures, Crosswalks, and Web Integration Blueprint

## Executive Summary

The World Health Organization’s International Classification of Diseases (ICD) is the global standard for health information. The eleventh revision (ICD-11) is a digital-first, ontology-informed redesign that replaces ICD-10 for morbidity and mortality use cases. Its programmatic interfaces, content model, and tooling are designed to interoperate with modern health software and standards, including HL7 Fast Healthcare Interoperability Resources (FHIR). In contrast, ICD-10 and its national extensions such as ICD-10-CM remain text-based, pre-coordinated code sets with limited semantic structure and no official REST API from WHO. The result is a fundamentally different implementation posture for application teams: whereas ICD-11 can be consumed as a live, evolving knowledge graph via WHO’s APIs, ICD-10 is typically accessed as static files and derived search services.

WHO’s official programmatic entry point is the ICD-API, an HTTP-based REST interface that exposes both ICD-10 and ICD-11 content. Access is governed by OAuth 2.0 client credentials, with a documented token service. ICD-11 content is accessible across two complementary components: the Foundation (a scientific ontology of health concepts) and the Linearization for Mortality and Morbidity Statistics (MMS), the statistical classification used for reporting. WHO’s API also includes pre-release guidance for FHIR-based access patterns and supports a local deployment option for organizations requiring on-prem operation and offline resilience. For search-heavy workloads that do not require full ICD-11 semantics, the U.S. National Library of Medicine (NLM) provides a convenient ICD-11 table service, while the CDC continues to distribute ICD-10-CM files and NLM offers an ICD-10-CM search API.

Architecturally, ICD-11 introduces post-coordination with extension codes and clusters (multiple codes combined to express a single clinical statement), as well as a richer content model that supports indexing, synonyms, and hierarchical navigation. While these features deliver improved expressivity and precision, they complicate one-to-one mapping to ICD-10. WHO explicitly positions crosswalks between ICD-10 and ICD-11 as aids for comparison, not as fully reliable translation tools for production data. Implementers should therefore design for dual-coding, data quality analysis, and clinical review for any mapping workflows.

For web integration, teams typically choose between direct API consumption, Embedded Coding/Browser tooling for guided coding, and FHIR-based access in pilot mode. Front-end implementations are frequently accelerated with official JavaScript samples across Angular, React, and Vue, while backend services centralize authentication, rate limiting, and caching. A pragmatic migration strategy adopts phased rollout with parallel runs and retrospective mapping, coupled with governance to manage change across clinical, administrative, and research workflows.

To frame implementation decisions, Table 1 summarizes the core differences between ICD-10 and ICD-11 that materially affect system design.

To orient the reader, the following image captures WHO’s ICD-11 Implementation FAQ—a definitive source on the transition scope, mapping caveats, and official resources that underpin the recommendations throughout this report.

![WHO ICD-11 Implementation FAQ (reference anchor for transition guidance)](browser/screenshots/who_icd11_faq_page.png)

Table 1: ICD-10 vs ICD-11 at a glance—implications for system design

| Dimension | ICD-10 | ICD-11 | Implementation Implication |
|---|---|---|---|
| Code structure | Pre-coordinated codes (letter + digits) | Pre-coordinated with post-coordination via clusters/extension codes | ICD-11 supports greater clinical specificity; data models must support multi-code clusters |
| Content model | Text-centric, limited semantics | Foundation-based ontology with explicit properties | Richer retrieval and inference; align data stores to entity-attribute structures |
| Programmatic access | No official WHO REST API; static files and third-party search APIs | WHO ICD-API (REST), FHIR (pre-release), local deployment option | Use WHO API for ICD-11; plan auth, caching, and resilience; use NLM/CDC for ICD-10 |
| Mapping fidelity | GEMs for ICD-9↔10; mapping to ICD-10 variants is local policy | Official crosswalks for comparison, not deterministic conversion | Treat crosswalks as analytical aids; implement dual-coding and clinical review |
| Tooling | Third-party search, coding UIs | Embedded Coding Tool (ECT) and Browser; JavaScript samples | Faster time-to-value with ECT; retain API for search/detail and validation |
| Governance | National modify and extend; multiple variants | Centralized WHO governance with annual updates and MMS | Expect change management and update pipelines regardless of jurisdiction |


## Official WHO APIs and Data Sources

WHO’s ICD-API is the canonical programmatic interface for ICD-10 and ICD-11. The API is documented as a modern REST interface, with clear guidance on authentication, usage, and content scope. The key to reliable integration is to align your use case with the correct content component (ICD-10, ICD-11 Foundation, or ICD-11 MMS) and to implement appropriate authentication, caching, and resiliency patterns.

Before diving into implementation patterns, it is useful to see the entry point that developers use to discover and configure ICD-API access.

![ICD-API documentation homepage: primary entry point for API details](browser/screenshots/who-icd-api-docs-homepage.png)

Table 2 distills the official sources and how teams typically employ them in production.

Table 2: Official sources overview—scope and typical usage

| Source | Scope | Typical Usage | Notes |
|---|---|---|---|
| ICD-API (WHO) | ICD-10 and ICD-11 (Foundation, MMS) via REST | Primary programmatic access for coding, search, and details | Auth via OAuth 2.0 client credentials; see token endpoint in [^5] |
| ICD-11 API v2 docs | API reference and examples for ICD-11 | Endpoint catalog and request patterns | Use for MMS vs Foundation navigation and search [^2] |
| ICD-11 API v1 docs | Legacy URIs and service design context | Background on URI stability and services | Useful for migration and historical links [^3] |
| FHIR support (pre-release) | FHIR access patterns for ICD content | Pilot interoperability with FHIR-based apps | Pre-release; validate in your environment [^4] |
| ICD-10-CM files (CDC) | Official U.S. diagnosis code files | Baseline for ICD-10-CM ingestion and local mapping | Annual updates; national scope [^7] |
| ICD-10-CM API (NLM) | Search and retrieval for ICD-10-CM | Typeahead, autocomplete, keyword search | Practical complement to static files [^8] |
| NIH Clinical Tables: ICD-11 | ICD-11 table search (NLM) | Search across ICD-11 without deep ontology needs | Convenient for read-only lookup [^9] |
| ICD-10 API (GEM-based) | Validation utilities based on GEMs | Ancillary validation/conversion workflows | Not a WHO source; scope differs [^10] |
| ICD Browser (Aperitto) | Downloadable ICD Browser | Human-in-the-loop exploration and training | Not a programmatic API [^12] |
| ICD-API GitHub org | Official code samples (incl. JS) | Reference implementations and ECT integration | Starter kits across stacks [^13] |
| DHIS2 ICD-11 CoD app | Population health app embedding ICD-11 tool | CRVS/mortality use case reference | Illustrates embedded workflows [^14] |

### ICD-API: Scope, Authentication, and Environments

WHO’s ICD-API exposes ICD-10 and ICD-11 content via REST. Authentication is standardized using OAuth 2.0 client credentials. Implementers register, obtain client credentials, and exchange them for access tokens using the documented token endpoint. Tokens are short-lived, and services should implement automated refresh and defensive handling of expiry.

The API primarily targets two ICD-11 content streams: the Foundation, a scientific ontology of health concepts, and the MMS linearization, the tabular classification used for mortality and morbidity statistics. ICD-10 access is also provided, though national modifications (e.g., ICD-10-CM) are governed by national agencies and distributed outside WHO. While WHO publishes documentation for the current API series (v2) and maintains legacy guidance for v1 URIs, teams should primarily build against v2 for new integrations and review the v1 docs for URI migration or compatibility needs. WHO also documents a pre-release FHIR access layer for implementers who need FHIR-native retrieval patterns. [^1] [^2] [^3] [^4] [^5]

Table 3: Authentication essentials

| Aspect | Detail |
|---|---|
| Grant type | OAuth 2.0 client credentials |
| Token endpoint | WHO ICD Access Management (see [^5]) |
| Client registration | Via WHO ICD-API registration portal (see [^1]) |
| Token lifetime | Short-lived; implement refresh |
| Scopes and usage | Align to intended content (Foundation, MMS, ICD-10) as per docs |

### ICD-10 Data Sources: CDC and NLM

For ICD-10-CM, the Centers for Disease Control and Prevention (CDC) publishes official diagnosis code files. These are the authoritative baselines for U.S. implementations and often serve as the foundation for local validation and mapping. For search-heavy user experiences such as typeahead search and keyword queries, the National Library of Medicine’s Clinical Tables API provides a convenient ICD-10-CM endpoint that returns code suggestions from these official files. In practice, teams ingest CDC files for validation and NLM search for UX, then layer any local policies or conversions on top. [^7] [^8]

### WHO ICD-11 API (Foundation and MMS)

ICD-11’s Foundation is a graph of health concepts designed for digital use and rich semantics, while the MMS linearization is the statistical classification optimized for reporting. The API offers endpoints for browsing hierarchy, retrieving concept details, searching by terms and properties, and discovering related concepts. Practically, many implementers use MMS for coding and reporting workflows that mirror ICD-10 patterns, while leveraging the Foundation for semantic navigation and advanced queries. The ICD-11 API v2 documentation provides concrete endpoints and parameters for these operations; teams should confirm base paths and parameters in the live docs during development. [^2]

### FHIR Support (Pre-release) and Local Deployment

A pre-release FHIR access layer is documented for teams that need FHIR-native retrieval or integration with FHIR-based applications. Given its pre-release status, production use should be piloted with caution, accompanied by explicit testing of query semantics, performance, and error handling. For organizations with strict data locality or offline requirements, WHO offers a local deployment option of the ICD-API that packages the ICD-11 Coding Tool and ICD-11 Browser for on-prem use. This approach can reduce latency and support privacy mandates while preserving a consistent developer experience. [^4] [^6]


## ICD-10 vs ICD-11: Data Structures, Code Formats, and Features

ICD-11 is not a mere update of ICD-10; it is a reconceptualization for the digital era. Where ICD-10 presents primarily pre-coordinated, text-centric codes, ICD-11 exposes a formal ontology and a multi-component coding model that can combine a stem code with extension codes to more precisely capture clinical nuance. This richer structure enables more accurate capture of conditions, sequelae, and related qualifiers, but also requires applications to accommodate multi-code clusters rather than single code fields.

The MMS linearization is the statistical backbone of ICD-11, closely aligned with ICD-10’s role but with more consistent conventions and improved alignment to modern software patterns. The Foundation serves as the scientific substrate from which MMS is derived, enabling fine-grained retrieval and navigation and undergirding the API’s search and browse capabilities. [^15] [^18] [^22]

Table 4: Structural comparison—ICD-10 vs ICD-11

| Structural Aspect | ICD-10 | ICD-11 (Foundation/MMS) |
|---|---|---|
| Core code format | Alphanumeric, pre-coordinated | Pre-coordinated; supports post-coordination via clusters |
| Extension codes | Not part of the model | Standardized mechanism to add granularity |
| Content basis | Text-oriented taxonomy | Ontology-informed Foundation with explicit properties |
| Reporting | MMS (ICD-10) successor | MMS as statistical linearization derived from Foundation |
| Example concept | Single code | Stem code plus optional extension codes forming a cluster |
| Browser affordances | Hierarchical browsing | Hierarchical browsing plus semantic links and search facets |

### Code Syntax and Validation

ICD-10 codes follow a familiar pattern of a letter followed by two or more digits, optionally extended with a decimal and additional characters in national modifications. Validation for ICD-10 tends to be syntactic (pattern matching) and list-based (checking against published files). ICD-11 introduces additional possibilities due to post-coordination. A single clinical statement may be expressed as a cluster: a stem code plus one or more extension codes. This improves clinical fidelity but requires applications to handle one-to-many structures in storage, validation, and exchange. [^18]

Table 5: Conceptual syntax examples—ICD-10 vs ICD-11

| Scenario | ICD-10 (hypothetical example) | ICD-11 (conceptual) |
|---|---|---|
| Simple condition | A single code representing the condition | Stem code with optional extension codes for severity/manifestation |
| Condition with qualifier | Requires a separate code or local extension | Cluster combining stem with extension code(s) |
| Post-coordination | Not available | Standardized approach using extension codes |

### Content Model and Tooling

ICD-11’s Foundation enables features like better synonym handling, richer indexing, and semantic navigation that improve search and categorization. The ICD-11 Coding Tool and Browser streamline coding accuracy, while WHO’s embedded options (discussed below) offer production-ready UI components that can be dropped into web applications. As a result, teams can deliver high-quality coding experiences without building search and browse from scratch. [^17] [^22]


## Cross-Mapping Between ICD-10 and ICD-11: Capabilities, Quality, and Approaches

WHO publishes mapping tables (crosswalks) to support comparison between ICD-10 and ICD-11. These crosswalks are explicitly positioned for comparison, not as a reliable means to convert production data wholesale. The reasons are structural: ICD-11’s post-coordination, refinements in definitions, and regroupings mean that many ICD-10 statements do not have a single, equivalent ICD-11 code. Attempts to force one-to-one mapping risk losing clinical fidelity. [^15]

This caution is corroborated by independent analyses. Studies applying ICD-10→ICD-11 mapping tools report high coverage but also observe gaps and ambiguities, including cases where no mapping is possible at a single stem code level. Comparative analyses between ICD-10-CM and ICD-11 have documented conflicts arising from differences in granularity and default coding assumptions, reinforcing the need for clinical review and fallbacks. [^19] [^20] [^21]

Table 6: Mapping methods and recommended usage

| Method | Description | Recommended Use Cases |
|---|---|---|
| WHO crosswalks | Official tables from ICD-10↔ICD-11 browser Info tools | Comparative analyses, retrospective alignment, research |
| GEM-based tools (for ICD-9↔10) | General Equivalency Mappings for U.S. ICD-9↔10 | Legacy conversions; not applicable to ICD-11 |
| Rule-based mapping | Deterministic rules plus lexical heuristics | Preliminary suggestions; must be clinician-reviewed |
| Manual review | Human coding against ICD-11 MMS with dual capture | Production-grade mapping; small-scale or high-stakes cohorts |

Table 7: Mapping outcomes—reported findings

| Outcome Type | Illustrative Notes |
|---|---|
| 1:1 match | A single ICD-10 code maps cleanly to a single ICD-11 code |
| 1:many options | ICD-11 offers multiple plausible options; human choice required |
| Broader/narrower | ICD-11 code is broader or narrower than the ICD-10 input |
| No match | No mapping possible at single stem code level (documented in analyses) |

The practical implication is clear: treat mapping as a decision-support function, not an automated conversion. Implement dual-coding where feasible, collect analytics on disagreements, and escalate ambiguous cases for clinical review. [^15] [^19] [^21]

### Using WHO Crosswalks Effectively

Use crosswalks to understand trends, perform retrospective comparisons, and calibrate mapping rules. Keep crosswalks separate from transactional coding flows and avoid programmatic “auto-upgrade” of legacy data without validation. Where mapping outcomes are ambiguous, expose them to clinical coders with context and suggested ICD-11 clusters rather than forcing a choice. [^15] [^21]


## Programmatic Access and Endpoints

For ICD-11, WHO’s API v2 documentation provides the canonical endpoint catalog for retrieving details, searching content, and navigating hierarchies. While this report does not enumerate specific URLs, implementers should expect to discover concept properties, synonyms, parent-child relationships, and search results with pagination and filtering. For ICD-10-CM, CDC files provide the definitive code set for validation, and the NLM Clinical Tables API offers search endpoints suitable for dynamic user interfaces. For ICD-10 validation and related utilities in the U.S., third-party tools exist that reference the CMS GEMs, but they are not WHO sources and should be used with care relative to your governance needs. [^2] [^8] [^7] [^10]

Table 8: Search endpoints summary—capabilities and typical parameters

| Source | Capability | Typical Parameters |
|---|---|---|
| WHO ICD-API (ICD-11) | Term search, browse, concept details | Query terms, pagination, filters as per v2 docs |
| NLM Clinical Tables (ICD-10-CM) | Keyword search, autocomplete | Text search, code filters, list size |
| NLM Clinical Tables (ICD-11) | Read-only table search | Term search, code browsing |

Table 9: CDC ICD-10-CM file types and usage

| Asset | Content | Typical Usage |
|---|---|---|
| Code list files | Enumerated diagnosis codes and titles | Validation dictionaries, code suggestion lists |
| Update files | Deltas between releases | Incremental ingestion and reconciliation |

### WHO ICD-API: Practical Query Patterns

Two patterns recur in production:

- Retrieval by identifier. Given an ICD identifier, retrieve the concept’s properties, definitions, hierarchy, and related terms. This is used for rendering code details, validating clusters, and pre-filling coder prompts. Confirm request/response fields and parameters in the v2 API reference during implementation. [^2]

- Search with pagination. Accept user input, perform a keyword or faceted search across MMS and Foundation, and return a paginated list. Back-end services should aggregate, cache, and rate-limit to protect user experience and API quotas. [^2]

### NLM Clinical Tables: ICD-11 and ICD-10-CM

NLM’s Clinical Tables are often used to complement official WHO APIs. For ICD-10-CM, the API supports search workflows that require low-latency suggestions (e.g., autocomplete). For ICD-11, the NLM table service offers a read-only search experience that is lighter-weight than operating against the full Foundation ontology. When building public-facing search UX, teams commonly combine cached suggestions with progressive refinement via the full WHO API for authoritative details. [^9] [^8]


## JavaScript/Node.js Libraries and Tools

The ICD-API GitHub organization publishes official code samples and starter kits that cover the most common integration tasks, including pure JavaScript, Angular, React, and Vue samples for the Embedded Coding Tool (ECT) and ICD-API consumption. These repositories are invaluable for bootstrapping front-end integrations and for understanding expected event flows, callbacks, and multilingual configuration. [^13]

![ICD-API GitHub org: official samples including ECT in Angular, React, and Vue](browser/screenshots/icd_api_github_homepage.png)

At the package level, the npm registry includes WHO-endorsed tools (e.g., an ECT wrapper) and community packages for ICD-10. Selection criteria should prioritize maintenance recency, weekly downloads, TypeScript types, and alignment with WHO’s official tooling. As an example, the ECT wrapper indicates broad adoption among implementers and a roadmap tied to WHO releases; in contrast, many ICD-10 packages show limited maintenance over several years and should be approached cautiously for production. Teams should perform their own due diligence before adopting any package. [^23]

Table 10: NPM packages (indicative)—capabilities and considerations

| Package | Purpose | Indicative Popularity | Notes |
|---|---|---|---|
| @whoicd/icd11ect | Embed WHO ICD-11 Coding Tool in web apps | High (per registry) | WHO-endorsed; check changelog and framework compatibility |
| @lowlysre/icd-10-cm | ICD-10-CM code dataset and lookups | Moderate | Data package; ensure currency with CDC updates |
| react-use-icd10 | React hook for ICD-10 searches | Low to moderate | Community package; verify maintenance |

### Official JavaScript Samples (Angular, React, Vue)

These samples demonstrate integration of the Embedded Coding Tool and Browser, including callback patterns to propagate selections back to host applications, locale switching, and popup/container embedding. They also illustrate interoperation with the ICD-API for retrieving hierarchical context and code details. In production, teams often adapt these samples to their design systems and routing architecture while retaining the event contracts and configuration idiom. [^24]

### Selecting NPM Packages

- Evaluate maintenance recency, weekly downloads, and issue activity.
- Confirm TypeScript definitions and tree-shaking support.
- Prefer packages that align with WHO’s ECT/API lifecycle and avoid those that embed stale code lists.
- Conduct a legal and security review consistent with your organization’s policies.

Table 11: Package evaluation checklist

| Criterion | What to Look For |
|---|---|
| Security | Active maintenance, dependency hygiene, reported vulnerabilities |
| Performance | Bundle size, lazy loading, runtime throttling |
| Maintainer responsiveness | Issue turnaround, release cadence |
| Compatibility | Support for your framework and TypeScript version |


## Search and Categorization Capabilities

Search and categorization are central to clinician and coder experience. ICD-11’s Foundation enables term search with synonyms and related concepts, while MMS supports hierarchical navigation suitable for tabular reporting workflows. On the API side, implementers typically combine three strategies: programmatic search via WHO’s ICD-API for authoritative results, ECT for guided browsing with embedded UI, and NLM Clinical Tables for fast, lightweight typeahead suggestions that do not require full ontology semantics. [^2] [^17] [^9]

Table 12: Search feature matrix

| Source | Capabilities | Strengths | Considerations |
|---|---|---|---|
| WHO ICD-API | Term search, hierarchy, details, synonyms | Authoritative, ICD-11-native semantics | Requires auth and caching strategy |
| NLM Clinical Tables | Keyword search, code lists | Low-latency autocomplete | Read-only; not a substitute for full API |
| ECT/Browser | Guided search and coding | Proven UX, multilingual | Requires embedding and event handling |

### Designing a Robust Search UX

Start with typeahead suggestions using cached dictionaries or NLM’s search service. On selection, resolve to WHO ICD-API to fetch authoritative details, including MMS context and any extension code guidance. Use debounced queries to limit API traffic and apply request coalescing to deduplicate concurrent searches for the same term. Localize synonyms where available and ensure the UI clarifies when a selection represents a cluster (stem plus extension codes) rather than a single code. [^2]


## Integration Patterns for Web Applications

Three integration patterns recur in production systems.

- Direct API integration. Implement a backend-for-frontend (BFF) that handles OAuth 2.0 token acquisition, request consolidation, caching, and rate limiting. Expose a simplified API to the front-end, centralizing resilience policies and observability. This pattern provides maximum control over performance, security, and data transformation. [^1] [^2] [^5]

- Embedded Coding Tool (ECT) and Browser. Use WHO’s embedded components to deliver a mature coding experience quickly. The ECT can run inline or as a popup, supports multilingual content, and communicates selections back to the host via callbacks. This pattern reduces development time but requires attention to integration concerns such as focus management, responsive layout, and cross-origin communication. [^17] [^24]

- FHIR-based access (pre-release). For organizations standardizing on FHIR, leverage WHO’s pre-release FHIR support for pilot integrations. Validate behaviors and performance, and be prepared to fall back to direct REST calls if FHIR endpoints do not yet meet your use case. [^4]

![Official ICD-11 Implementation FAQ anchor for governance and tooling references](browser/screenshots/who_icd11_faq_page.png)

Table 13: Pattern comparison—pros, cons, and use cases

| Pattern | Pros | Cons | When to Use |
|---|---|---|---|
| Direct API + BFF | Control, performance, cache, observability | More engineering effort | Core coding/search at scale; strict governance |
| ECT/Browser | Rapid time-to-value, WHO-maintained UX | Embedding complexity, event handling | Greenfield apps; resource-constrained teams |
| FHIR (pre-release) | Standards alignment, reuse FHIR tooling | Pre-release risk; limited coverage | Pilot projects; FHIR-first organizations |

### Direct API Integration (Server-to-Server)

- Authenticate using OAuth 2.0 client credentials and manage token refresh automatically. [^5]
- Implement caching at multiple layers: in-memory for hot queries, CDN for static assets, and persistent stores for popular concept details. 
- Apply rate limiting and exponential backoff to shield the API and your users from transient errors. 
- Structure logs for correlation IDs and include endpoint and parameters for traceability. [^2]

### Embedded Coding Tool (ECT) in the Front-end

- Render ECT inline or in a popup, depending on your application’s navigation and workflow.
- Configure callbacks to capture selections and propagate them to form state and downstream systems.
- For multi-language deployments, test content localization and ensure correct handling of right-to-left scripts where applicable.
- Access code samples for Angular, React, and Vue from WHO’s official repositories to accelerate integration. [^24]


## Implementation Recommendations and Migration Strategy

Treat the transition from ICD-10 to ICD-11 as a multi-year program, not a patch. Establish a program charter with clinical, administrative, and technical stakeholders; adopt a phased rollout; and embed rigorous validation at each stage. WHO’s transition guide and implementation FAQ offer the canonical framework for planning. [^16] [^15]

Table 14: Migration phases and success metrics

| Phase | Activities | Success Metrics | Dependencies |
|---|---|---|---|
| Discovery | Stakeholder alignment, baseline assessment | Signed scope, risk register | Executive sponsorship |
| Design | Data model updates, API/BFF design, ECT selection | Design sign-off, security review | Architecture authority |
| Pilot | Dual-code in select clinics, train coders, measure | Accuracy, coder satisfaction, latency | Training materials |
| Scale-out | Expand cohorts, integrate analytics, refine UX | Mapping disagreement rate, throughput | Helpdesk readiness |
| Stabilization | Harden ops, automate updates, governance | SLA adherence, incident rate | Operational tooling |
| Retirement (ICD-10) | Sunset legacy flows, archive mappings | Compliance clearance | Legal/regulatory approval |

Table 15: Risk register—mitigation strategies

| Risk | Description | Mitigation |
|---|---|---|
| Mapping ambiguity | One ICD-10 maps to multiple ICD-11 options | Dual-coding, clinician review queues |
| Data loss | Overly aggressive legacy conversion | Prohibit auto-upgrade; use crosswalks for analysis |
| Performance | Latency on search and retrieve | Cache, coalesce, and rate-limit |
| Security | Token leakage or misuse | Short-lived tokens, secret management, audits |
| Change fatigue | Coder burnout from dual workflows | Training, targeted tooling, phased cohorts |

### Cross-Mapping Strategy in Production

- Maintain dual-coding during the transition. Capture both ICD-10 and ICD-11 codes for a defined period and analyze disagreements to refine rules and training.
- Classify mapping outcomes (1:1, 1:many, no match) and route ambiguous cases to clinical reviewers. 
- Only finalize conversions where clear equivalences exist and governance approves the risk. [^19] [^21]


## Appendix: Reference Index and Example Requests

This appendix consolidates core references and maps common use cases to source documents. For endpoint specifics, query parameters, and token exchange details, consult the WHO ICD-API v2 documentation and the ICD Access Management token service.

Table 16: Reference-to-use-case map

| Use Case | Primary References |
|---|---|
| API overview and registration | [^1] [^2] |
| OAuth 2.0 token acquisition | [^5] |
| ICD-11 content (Foundation/MMS) | [^2] [^3] |
| FHIR access (pre-release) | [^4] |
| Local deployment | [^6] |
| ICD-10-CM data files | [^7] |
| ICD-10-CM search | [^8] |
| NIH ICD-11 table search | [^9] |
| ICD-10 validation tools | [^10] |
| Embedded Coding Tool | [^17] |
| ECT JavaScript samples | [^24] |
| Migration and implementation guidance | [^15] [^16] |
| Mapping evidence and limitations | [^19] [^20] [^21] |

![WHO ICD-11 Implementation FAQ page reference](browser/screenshots/who_icd11_faq_page.png)

![ICD-API documentation homepage reference](browser/screenshots/who-icd-api-docs-homepage.png)

### Known information gaps and how to address them

- Specific WHO ICD-API endpoint paths, parameters, and sample payloads change across releases; confirm in the live v2 documentation during development. [^2]
- Exact OAuth token lifetimes, rate limits, and usage quotas are not enumerated here; verify in WHO documentation and through pilot testing. [^1] [^5]
- Complete field-level schemas for ICD-11 concept retrieval and post-coordination payloads must be taken from WHO docs; treat this report’s summaries as orientation. [^2]
- Official, production-grade crosswalk APIs are not documented here; WHO provides crosswalks for comparison, not conversion. [^15]
- Licensing, redistribution rights, and constraints for offline/local deployments vary; consult WHO’s local deployment documentation and legal counsel. [^6]
- U.S. ICD-10-CM adoption timelines and dual-coding mandates depend on national policy; track CMS/CDC communications for specifics. [^7]
- FHIR support is documented as pre-release; behavior may evolve and should be validated in pilots. [^4]


## References

[^1]: Home Page ICD API - ICD-11. https://icd.who.int/icdapi  
[^2]: API Documentation (version 2.x) - ICD-API Homepage - ICD-11. https://icd.who.int/docs/icd-api/APIDoc-Version2/  
[^3]: ICD URIs and Supporting Web Services - ICD-API Homepage - ICD-11 (Version 1). https://icd.who.int/docs/icd-api/APIDoc-Version1/  
[^4]: FHIR support (prerelease) - ICD-API Homepage - ICD-11. https://icd.who.int/docs/icd-api/ICDAPI-FHIR-Support/  
[^5]: WHO ICD Access Management (OAuth 2.0 token endpoint). https://icdaccessmanagement.who.int/connect/token  
[^6]: ICD-API Local Deployment - ICD-11. https://icd.who.int/docs/icd-api/ICDAPI-LocalDeployment/  
[^7]: ICD-10-CM Files | CDC. https://www.cdc.gov/nchs/icd/icd-10-cm/files.html  
[^8]: API for ICD-10-CM - Clinical Table Search Service - NIH. https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html  
[^9]: API for ICD-11 - Clinical Table Search Service - NIH. https://clinicaltables.nlm.nih.gov/apidoc/icd11_codes/v3/doc.html  
[^10]: ICD-10 API (GEM-based validation). https://icd10api.com/  
[^11]: ICD-11 Coding Tool (browser-based). https://icd.who.int/browse11  
[^12]: ICD Browser - Download. https://icd-browser.updatestar.com/en  
[^13]: ICD-API - GitHub organization. https://github.com/icd-api  
[^14]: ICD-11 CoD App - DHIS2 Documentation. https://docs.dhis2.org/en/implement/health/crvs-mortality/cause-of-death/icd-11-cod-app.html  
[^15]: ICD-11 Implementation - WHO FAQ. https://www.who.int/standards/classifications/frequently-asked-questions/icd-11-implementation  
[^16]: ICD-11 Implementation or Transition Guide (WHO, v1.05). https://icd.who.int/en/docs/ICD-11%20Implementation%20or%20Transition%20Guide_v105.pdf  
[^17]: Embedded Coding Tool (ECT) - ICD-11. https://icd.who.int/docs/icd-api/icd11ect-1.7/ECT/  
[^18]: ICD-11 - Wikipedia. https://en.wikipedia.org/wiki/ICD-11  
[^19]: Applying an ICD-10 to ICD-11 mapping tool ... - NIH PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC11658050/  
[^20]: Comparative Analysis of ICD-10-CM with ICD-11 for Morbidity Coding - NCVHS. https://ncvhs.hhs.gov/wp-content/uploads/2021/04/I-ICD-Kin-Wah-508.pdf  
[^21]: Canadian stability analysis: ICD-10-CA vs ICD-11 - CIHI. https://www.cihi.ca/sites/default/files/document/canadian-stability-analysis-selected-codes-icd10ca-vs-icd11-infosheet-en.pdf  
[^22]: ICD-11: International Classification of Diseases 21st Century - BMC. https://bmcmedinformdecismak.biomedcentral.com/articles/10.1186/s12911-021-01534-6  
[^23]: @whoicd/icd11ect - npm. https://www.npmjs.com/package/@whoicd/icd11ect  
[^24]: ICD-API/ECT-JavaScript-samples - GitHub. https://github.com/ICD-API/ECT-JavaScript-samples