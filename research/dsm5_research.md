# DSM-5 and DSM-5-TR: Diagnostic Criteria, Assessment Tools, Data Standards, and Implementation Patterns

## Executive Summary: What DSM-5-TR Is, Why It Matters, and How to Implement It

The Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition, Text Revision (DSM-5-TR) is the American Psychiatric Association’s (APA) authoritative classification and criteria set for mental disorders. It underpins clinical documentation, quality measurement, research, and reimbursement in U.S. behavioral health care. For engineering leaders and informaticians, DSM-5-TR matters because it provides the standard vocabulary and logic for diagnosis, which must be precisely captured, coded, exchanged across systems, and integrated into clinical workflows to support safe, effective, and measurable care. APA’s “About DSM-5-TR” summarizes the three major components—diagnostic classification, diagnostic criteria sets, and descriptive text—each of which must be respected in digital implementations to ensure clinical fidelity and legal defensibility[^1]. Beyond static text, DSM-5-TR is a living standard: APA publishes periodic updates that修正 criteria and coding and reference updated ICD-10-CM code sets, requiring implementers to track and incorporate changes over time[^2][^3][^4].

![APA DSM-5-TR Updates page (official)](assets/images/apa_dsm5tr_updates_main.png)

This guide translates the standard into an implementation blueprint. It answers eight practical questions:
- Official diagnostic criteria and structure (APA sources).
- Public APIs or datasets for DSM-5-TR content; ICD-10/ICD-11 coding integration.
- Validated assessment measures and digital implementation (PHQ-9, GAD-7, others).
- A differential diagnosis process aligned with DSM-5-TR principles.
- Integration patterns into EMR/EHR workflows, with FHIR and openEHR modeling.
- Available JavaScript libraries, data standards, and open datasets.
- Security, privacy, and compliance guardrails.
- Operational adoption and update management practices.

Key takeaways:
- There is no official public DSM-5-TR API; implementers must use APA-licensed products and careful sourcing when building decision support or reference tools[^2].
- ICD-10-CM remains the operative U.S. coding system for billing; WHO’s ICD-11 is in global rollout with a transition strategy that will require code set planning and crosswalks in the coming years[^17][^16].
- DSMaS (APA) and targeted apps (e.g., Unbound Medicine’s DSM-5-TR Differential Diagnosis) support clinical reasoning but are not intended to function as production-grade diagnostic APIs[^7][^8].
- Use validated measures—PHQ-9, GAD-7, and related screeners—with robust scoring and risk handling; several are public domain, facilitating lawful digitization[^22][^25][^28][^29].
- Model screening and diagnostic data in openEHR (e.g., OBSERVATION, EVALUATION) and FHIR (e.g., Questionnaire, QuestionnaireResponse, Observation, Condition), anchored to US Behavioral Health Profiles where applicable[^32][^33][^34][^35].
- Embed decision support with transparency, auditability, and clinician-in-the-loop safeguards; follow human factors guidance and governance patterns that minimize alert fatigue[^36][^37][^38].

Information gaps to acknowledge:
- No official APA DSM-5-TR public API for direct machine-readable diagnostic content; licensing and permitted uses require direct review[^2].
- Full DSM-5-TR text is paywalled; this report relies on APA summaries and updates[^1][^2][^4][^6][^7].
- The complete enumeration of ICD-10-CM code changes across updates is not reproduced here; consult the official DSM-5-TR Classification and APA updates[^4][^6][^30].
- The extent of APA permissions for reproducing diagnostic criteria in software is not publicly specified; seek legal review.
- Operational specifics for FHIR/US Behavioral Health Profiles may require hands-on testing with target EHRs; validation is local and iterative[^34][^35].

The remainder of this document is standards-driven and clinician-safe: it provides architecture and governance patterns that enable precise data capture, robust interoperability, and responsible clinical decision support.

---

## Official APA Diagnostic Criteria and DSM-5-TR Structure

DSM-5-TR is organized into three components: (1) the diagnostic classification (the disorders and their groupings), (2) the diagnostic criteria sets (operationalized symptom thresholds, duration, and exclusions), and (3) the descriptive text (disorder narratives, differential considerations, and coding notes). These components are interdependent; an accurate implementation must represent each faithfully, especially where specifiers, durations, and exclusion clauses materially affect diagnosis and billing[^1][^5].

DSM-5 introduced major structural and criteria changes relative to DSM-IV-TR—for example, reorganizing chapters (e.g., creating “Obsessive-Compulsive and Related Disorders” and “Trauma- and Stressor-Related Disorders”), unlinking panic disorder and agoraphobia, refining psychotic disorder criteria, updating neurodevelopmental disorder constructs (including Autism Spectrum Disorder), and relaxing certain “insight” requirements for anxiety disorders. The APA’s official change compendium provides authoritative detail and rationale, including renaming, specifier modifications, and eliminated subtypes[^5]. A peer-reviewed overview further distills these shifts and underscores their clinical implications[^3].

DSM-5-TR itself builds on DSM-5 with text revisions, clarifications, and coding updates. APA publishes periodic supplements (September cadence) that修正 criteria and text and reference updated ICD-10-CM coding. Implementers should treat these as normative and incorporate them into clinical content, rules engines, and mapping tables on a scheduled basis[^2][^4][^6].

![Official APA page on DSM-5-TR updates](assets/images/apa_dsm5tr_updates_main.png)

To illustrate the practical differences across releases, Table 1 summarizes representative changes.

Table 1. Representative changes from DSM-IV-TR to DSM-5 and DSM-5-TR

| Domain | DSM-IV-TR → DSM-5 (selected changes) | DSM-5 → DSM-5-TR (update examples) |
|---|---|---|
| Anxiety disorders | Removal of “excessive/unreasonable” insight requirement for adults in specific phobia/social anxiety; six-month duration extended to all ages; panic attacks recast as “unexpected” vs “expected” and made a specifier across disorders | Text clarifications and periodic coding updates; APA supplements adjust criterion wording and references as needed[^2][^4][^5][^6] |
| Panic and agoraphobia | Panic disorder and agoraphobia unlinked; each has separate criteria | Continued refinements in descriptive text; coding corrections per APA updates[^5][^4] |
| OCD and related | New chapter; added hoarding, excoriation; refined insight specifiers (good/fair, poor, absent/delusional); tic-related specifier added | Text revisions and references updated; no re-architecture of criteria sets[^5][^6] |
| Trauma- and stressor-related | PTSD four-cluster model; Criterion A2 removed; developmental thresholds refined; acute stress criteria broadened | Text updates and coding corrections; adjustments referenced in APA updates[^5][^2][^6] |
| Psychotic disorders | Schizophrenia Criterion A requiring at least one core positive symptom; subtypes eliminated; delusional disorder criteria clarified | Textual clarifications and references; coding updates as needed[^5][^6] |
| Neurodevelopmental | Autism spectrum consolidation; ADHD onset adjusted to before age 12, adult symptom threshold reduced; intellectual disability terminology updated | Text updates and references; no structural reclassification[^5][^6] |

Coding reference is indispensable to implementation. The DSM-5-TR Classification product provides ICD-10-CM code listings aligned with DSM categories and is the authoritative crosswalk for billing and reporting[^30]. APA’s updates also alert implementers to coding corrections or revisions; for example, recent APA communications signal code changes for specified conditions. These must be tracked, tested in billing workflows, and reconciled with payer-specific policies[^2][^4][^6].

### What Changed from DSM-IV-TR to DSM-5

Beyond titles and chapter moves, several changes directly affect software logic and workflow:
- Panic attack specifiers are now simpler (unexpected vs expected) and can be attached to many disorders, altering how decision support presents options and documentation prompts[^5].
- Obsessive-compulsive and related disorders have new entities (hoarding, excoriation) and refined insight specifiers that materially impact differential diagnosis (e.g., distinguishing delusional variant presentations from psychotic disorders)[^5].
- PTSD now has four clusters with developmental sensitivities, changing how algorithms assemble symptom counts and flags[^5].

These changes mandate updates to decision trees, scoring logic (especially for symptom counts across clusters), and EHR templates. Table 2 highlights chapter-level movements and logic implications.

Table 2. Chapter-level changes affecting decision logic

| Change | Implementation implication |
|---|---|
| OCD and related disorders separated from anxiety | Update navigation, decision trees, and rule antecedents to reflect a distinct chapter |
| PTSD moved to Trauma- and Stressor-Related Disorders with a four-cluster model | Recompute cluster-based criteria; adjust history-taking prompts and severity outputs |
| Separation anxiety and selective mutism moved into Anxiety Disorders | Update classification filters and differential lists |
| Elimination of schizophrenia subtypes; dimensional severity retained in Section III | Replace subtype logic with dimensional rating artifacts; retain severity reporting |
| Removal of DSM-IV “mixed episode”; “with mixed features” specifier | Expand specifier options across mood episodes; include cross-episode logic |

Source: APA “Highlights of Changes”[^5]; overview[^3].

### DSM-5-TR Updates and Coding Maintenance

APA publishes DSM-5-TR updates annually (September), which修正 criteria text, references, and coding where necessary. These updates are authoritative for both clinical content and billing alignment[^2][^4][^6]. For instance, recent APA communications have highlighted coding corrections and clarifications for selected conditions. Table 3 lists representative updates to monitor.

![APA DSM-5-TR Updates (sample page)](assets/images/apa_dsm5tr_updates_pdf.png)

Table 3. Selected DSM-5-TR update items relevant to implementation (illustrative)

| Update period | Topic (illustrative) | Operational note |
|---|---|---|
| September 2025 | ICD-10-CM coding corrections for specified disorders | Revise coding crosswalks; validate claim scrubbing logic; update clinician-facing code hints[^6] |
| September 2024 | Text and coding updates catalog | Review supplement; propagate changes to templates and order sets[^4] |
| April 2022 | Targeted corrections to certain criteria and coding notes | Reconcile with payer edits; refresh test suites[^2] |

Implementation guidance:
- Maintain a governance roster for DSM-5-TR updates, with scheduled content review, regression testing of rules, and code set refresh.
- Tie updates to your release management calendar, including a freeze window for code changes prior to billing deadlines.
- Use the DSM-5-TR Classification as the canonical ICD-10-CM reference[^30].

---

## APIs, Data Sources, and Coding Integrations (ICD-10/ICD-11)

Public, official DSM-5-TR APIs do not exist. APA makes DSM content available via licensed publications and apps (e.g., DSM-5-TR, the DSM-5-TR Classification, and the Handbook of Differential Diagnosis), but these are not positioned as developer APIs. Any programmatic use beyond personal or workflow-internal reference requires license review; implementers should avoid web scraping or unlicensed reproduction of content[^2][^30].

Commercially, Unbound Medicine provides DSM-5-TR differential diagnosis apps that implement a structured, step-wise framework and interactive decision trees to guide clinicians. While valuable at the point of care, these tools are not designed as production diagnostic APIs; treat them as clinician-facing references, not as back-end services[^7][^8].

Interoperability standards provide the scaffolding to represent and exchange psychiatric data:
- FHIR (Fast Healthcare Interoperability Resources) offers profiles and resources to capture assessments, responses, and diagnoses, with the US Behavioral Health Profiles Implementation Guide (IG) specifying behavioral health (BH)-specific elements and crosswalks to USCDI+ BH[^34][^35].
- openEHR’s two-level modeling (archetypes/templates) supports flexible, longitudinal capture of assessment data and diagnoses while separating clinical content from system logic[^32][^33].

ICD coding is central to billing and reporting. In the U.S., ICD-10-CM remains the operative code set for claims; WHO’s ICD-11 is in global rollout with transition guidance for member states, and organizations should plan for coexistence and mapping strategies. Table 4 summarizes options and considerations.

Table 4. API/data options matrix

| Source | Access modality | Intended use | Licensing considerations | Integration feasibility |
|---|---|---|---|---|
| APA DSM-5-TR text and Classification | Licensed publications (print/digital) | Clinical reference; coding crosswalk | APA content licensing; avoid reproduction without permission | High for human reference; programmatic use requires legal review[^2][^30] |
| Unbound Medicine DSM-5-TR Differential Diagnosis | Mobile/web apps | Clinician-facing decision support | App EULA; not an API | Moderate; use as in-app reference, not as a service[^7][^8] |
| FHIR US Behavioral Health Profiles | IG artifacts (public) | Interoperability design | Open specifications | High; validate with target EHRs[^34][^35] |
| openEHR archetypes/templates | Specifications (public) | Data modeling | Open standards | High; requires governance and archetype curation[^32][^33] |
| jsPsych | Open-source library (GitHub) | Digital assessment experiments | Open-source license | High; integrate for research-grade tasks[^26] |
| Health figures (JS library) | Open-source (PMC) | Visualization | Open-source license | Moderate-high; augment dashboards[^27] |

ICD-10/ICD-11 comparison is shown in Table 5.

Table 5. ICD-10-CM vs ICD-11: transition and interoperability implications

| Dimension | ICD-10-CM (U.S.) | ICD-11 (WHO global) | Implementation note |
|---|---|---|---|
| Status in U.S. | Current billing/reporting standard | In global rollout; U.S. transition timing evolving | Maintain ICD-10-CM for near-term claims; plan for ICD-11 readiness[^17][^16] |
| Scope | Clinical modification for U.S. | International classification with digital-first architecture | Expect more granular, digital-native coding in ICD-11[^16] |
| Crosswalks | DSM-5-TR Classification to ICD-10-CM available | WHO provides mapping guidance | Build code crosswalks and test for semantic drift[^30][^16] |
| Reporting | CMS/claim validation | Not yet required for U.S. claims | Monitor federal/state guidance for mandate |

### Official DSM-5-TR Data Access Options

APA distributes DSM content through its publishing arm, including the DSM-5-TR text, DSM-5-TR Classification (ICD-10-CM listings), and the DSM-5-TR Handbook of Differential Diagnosis. The Assessment Measures page lists instruments associated with DSM-5-TR, some of which are public domain (e.g., PHQ-9, GAD-7). Licensing governs reuse and digitization; public domain measures can be digitized and integrated without permission, whereas proprietary instruments require authorization[^2][^30][^10][^22].

Table 6. APA source overview and reuse considerations

| APA resource | Purpose | Programmatic reuse posture | Licensing note |
|---|---|---|---|
| DSM-5-TR text | Criteria and descriptive text | Not intended as raw data API | Licensed publication; seek permission for reproduction[^2] |
| DSM-5-TR Classification | ICD-10-CM code crosswalk | Reference for coding tables | Licensed reference; permissible to consult for mapping[^30] |
| DSM-5-TR Handbook of Differential Diagnosis | Structured diagnostic reasoning | Human-facing workflows | Licensed content; use in app form as permitted[^30] |
| DSM-5-TR Online Assessment Measures | Measures catalog | Some public domain; others restricted | Confirm instrument licensing before digitization[^10][^22] |

### Interoperability: FHIR and openEHR

Behavioral health workflows benefit from FHIR’s resource model and the US Behavioral Health Profiles IG, which proposes profiles for BH-specific data elements and maps USCDI+ BH to FHIR. Implementation teams should use these profiles to standardize Questionnaire, QuestionnaireResponse, Observation, and Condition representations, then validate against their EHR’s FHIR API and integration toolchain[^34][^35]. For longitudinal platforms, openEHR’s archetypes/templates separate clinical knowledge from application code, enabling local governance and versioning of content that can outlive vendor transitions[^32][^33].

Table 7. FHIR vs openEHR for behavioral health

| Criterion | FHIR | openEHR |
|---|---|---|
| Modeling style | Resource-based, profiles, extensions | Two-level modeling (archetypes/templates) |
| Governance | IG-driven; community/vendor participation | CKM-driven; clinical archetypes with versioning |
| Strengths | RESTful APIs; broad EHR adoption; US profiles for BH | Long-term semantic stability; flexible local templates |
| Typical artifacts | Questionnaire, QuestionnaireResponse, Observation, Condition | OBSERVATION for assessments; EVALUATION for diagnoses/plans |
| Use cases | EHR integration, HIE exchange, CDS hooks | Longitudinal platforms, multi-vendor data governance |

### Coding and Transition Planning

WHO’s ICD-11 implementation guidance outlines broad use cases and transition principles—clinical decision support, analytics, and global surveillance—underscoring the need for careful crosswalk and impact analysis. U.S. entities should track CMS and state guidance for ICD-11 adoption timelines and testing requirements[^16][^17]. In the interim, use DSM-5-TR Classification for ICD-10-CM mapping and develop a semantic mapping strategy that anticipates ICD-11’s greater granularity and digital structure[^30][^16].

Table 8. U.S. coding timeline and readiness checklist (high level)

| Activity | Near-term | Mid-term |
|---|---|---|
| Code sets | Maintain ICD-10-CM; monitor APA updates | Plan ICD-11 mapping strategy and dual-run |
| Governance | DSM-5-TR update watch; coder liaison | ICD-11 impact assessment; training plan |
| Validation | Claims scrubbing against ICD-10-CM | End-to-end testing for ICD-11 code flows |
| Data analytics | Map DSM-5-TR to ICD-10-CM for reporting | Evaluate analytic continuity under ICD-11 |

---

## Assessment Questionnaires and Screening Tools

Validated instruments are central to measurement-based care and triage. Among the most widely used are the Patient Health Questionnaire-9 (PHQ-9) for depression, the Generalized Anxiety Disorder-7 (GAD-7) for anxiety, the Primary Care PTSD Screen for DSM-5 (PC-PTSD-5), and the PHQ-15 for somatic symptom severity. Many of these are cataloged on APA’s DSM-5-TR Online Assessment Measures page and/or are in the public domain (e.g., PHQ and GAD families), facilitating lawful digitization and integration into EHR workflows[^10][^22].

Digital implementation requires precise scoring, risk management, and accessibility. The PHQ-9 and GAD-7 scoring rules are straightforward and should be encoded once and reused across modules. The PHQ instruction manual provides detailed algorithms, cutpoints, and clinical caveats—including suicide risk follow-up for item 9—and clear mappings to treatment actions by severity bands[^25]. Table 9 distills PHQ-9/GAD-7 scoring and interpretation.

Table 9. PHQ-9 and GAD-7 scoring and interpretation (adults)

| Instrument | Item count | Response scale | Total score range | Severity cutpoints | Typical clinical flags | Notable caveats |
|---|---|---|---|---|---|---|
| PHQ-9 | 9 | 0 (“not at all”) to 3 (“nearly every day”) | 0–27 | 0–4 none-minimal; 5–9 mild; 10–14 moderate; 15–19 moderately severe; 20–27 severe | ≥10 “yellow flag”; ≥15 “red flag” | Item 9 (self-harm) requires clinical interview follow-up; “difficulty” item not scored; algorithm caveats for bereavement, bipolar, and substance/medical etiology[^25] |
| GAD-7 | 7 | 0 (“not at all”) to 3 (“nearly every day”) | 0–21 | 5 mild; 10 moderate; 15 severe | ≥10 prompts further evaluation; ≥15 warrants active treatment | Useful screen for other anxiety disorders; two-step approach (GAD-2→GAD-7) recommended[^22][^25] |

Beyond PHQ-9 and GAD-7, instrument selection should consider administration time, validation populations, and intended use (screening vs outcome monitoring). Table 10 provides a concise catalog.

Table 10. Instrument catalog (selected)

| Measure | Domain | Items | Typical use | Licensing posture | Example references |
|---|---|---|---|---|---|
| PHQ-9 | Depression severity | 9 | Screening, diagnosis (provisional), outcome | Public domain | Instructions manual; psychometrics[^25][^28] |
| GAD-7 | Anxiety severity | 7 | Screening and outcome | Public domain | Validation and use[^22][^25] |
| PHQ-2 / GAD-2 | Ultra-brief screeners | 2 | Two-stage screening | Public domain | Scoring in instructions[^25] |
| PHQ-15 | Somatic symptom severity | 15 | Screening and severity | Public domain | Instructions and reviews[^25] |
| PC-PTSD-5 | PTSD screen | 5 | Screening | Requires review | Feasibility context[^29] |
| PCL-5 | PTSD symptoms | 20 | Screening and symptom tracking | Requires review | General reference[^10] |

Two-step screening (e.g., PHQ-2→PHQ-9; GAD-2→GAD-7) is efficient and preserves specificity, especially in primary care and oncology settings. Emerging pragmatic analyses and validation studies reinforce the utility of abbreviated measures for outcome tracking while minimizing burden[^22][^23][^24].

### PHQ-9/GAD-7: Scoring, Interpretation, and Risk Management

Encoding PHQ-9 and GAD-7 scoring in software is straightforward but must respect clinical caveats. Table 11 maps response options and severity bands for clinician-facing UIs.

Table 11. Response mapping and severity bands for PHQ-9 and GAD-7

| Instrument | Response mapping (each item) | Severity bands (total score) | UI guidance |
|---|---|---|---|
| PHQ-9 | 0 = not at all; 1 = several days; 2 = more than half the days; 3 = nearly every day | 0–4 none-minimal; 5–9 mild; 10–14 moderate; 15–19 moderately severe; 20–27 severe | Display running total; flag item 9; trigger risk workflow if positive; show “difficulty” item as informational only[^25] |
| GAD-7 | Same as PHQ-9 | 5 mild; 10 moderate; 15 severe | Show running total; enable GAD-2→GAD-7 escalation; link to anxiety resources and treatment options[^22][^25] |

Operational guidance:
- If PHQ-2 ≥3 or GAD-2 ≥3, prompt full PHQ-9/GAD-7 and a clinical interview[^25].
- For PHQ-9 item 9 positivity, activate a suicide risk protocol; algorithmic risk screeners may assist but cannot replace clinical judgment[^25].
- Store both total scores and item-level responses to enable trend analysis and audit.
- Treat algorithmic diagnoses (e.g., “Major Depressive Syndrome”) as provisional; require clinician confirmation and exclusion checks (bereavement, bipolar, substance/medical etiology)[^25].

### Other Measures and APA Online Assessment Measures

APA’s DSM-5-TR Online Assessment Measures page catalogs instruments aligned to DSM-5-TR constructs. Many are public domain or freely available; others may require permission. Before digitization, confirm licensing and translation status, and consider the validation evidence in your target population[^10][^22]. For example, PHQ-9 and GAD-7 have extensive validation literature and public domain status, making them suitable for immediate EHR integration[^22][^25][^28].

Table 12. APA measures overview and deployment considerations

| Measure | Access status | Administration | Integration guidance |
|---|---|---|---|
| PHQ-9 | Public domain | Self-report | Embed in intake and follow-up; integrate scoring and alerts |
| GAD-7 | Public domain | Self-report | Pair with GAD-2; store item-level and total |
| PCL-5 | Review licensing | Self-report | Align with trauma workflows; monitor post-visit |
| PC-PTSD-5 | Review licensing | Self-report | Use in primary care/oncology triage; integrate with referral |

Source: APA measure catalog[^10]; instrument instructions[^25].

### Validation and Clinical Utility

Evidence continues to support PHQ-9 and GAD-7 for screening and outcome measurement, including abbreviated forms that preserve analytic value with reduced burden[^22][^23]. In specific populations—such as oncology—two-step approaches demonstrate acceptable operating characteristics for depression and anxiety screening[^24]. Community-norm studies for PHQ-9 can inform thresholds and interpretation in diverse populations, supporting equitable triage and referral[^28]. As with all measures, integration requires ongoing monitoring of psychometrics in your local population to maintain fairness and clinical utility.

---

## Differential Diagnosis for Psychiatric Conditions

DSM-5-TR encourages a structured, sequential diagnostic process that balances criteria fidelity with clinical judgment. The DSM-5-TR Handbook of Differential Diagnosis (and associated apps) lays out a six-step framework that begins with chief complaint and proceeds through rule-outs and differential ranking. Embedding this process in software enables transparency, auditability, and safer decision support[^8][^7].

![Conceptual flow of DSM-5-TR differential diagnosis process](assets/images/dsm5tr_differential_dx_handbook.png)

A practical differential approach integrates:
- Systematic criteria checks with transparent rule antecedents.
- Comorbidity scanning using co-occurring symptom clusters (e.g., anxiety-depression-somatization overlap).
- Ruling out medical/substance causes before assigning primary psychiatric diagnoses (consistent with PHQ/GAD algorithm caveats).
- Structured specifier assignment (e.g., “with mixed features,” “with anxious distress”), which guide treatment and prognosis.
- Documentation prompts that record exclusions and alternatives.

Table 13 maps steps to artifacts to capture.

Table 13. Differential diagnosis steps mapped to software artifacts

| Step | Example software artifact | Purpose |
|---|---|---|
| Chief complaint and history | Structured history template | Anchor symptom onset, course, and stressors |
| Symptom inventory | QuestionnaireResponse (PHQ-9, GAD-7, PC-PTSD-5) | Standardized capture of symptoms and severity |
| Criteria checks | Rule engine with criteria templates | Operationalize DSM-5-TR criteria logic |
| Medical/substance rule-outs | EVALUATION (risk/etiology) | Record exclusion of organic causes |
| Comorbidity scan | Differential list (ranked) | Surface likely coexisting conditions |
| Specifiers | Structured data elements | Support treatment planning and coding |
| Clinician confirmation | Diagnostic statement (Condition) | Ensure clinician-in-the-loop accountability |

### A Structured Differential Workflow

Clarity and sequence matter. Decision trees can reduce cognitive load but must remain transparent, show excluded alternatives, and record the basis for a final diagnosis. Table 14 provides a template for decision tree metadata.

Table 14. Decision tree metadata template

| Field | Description |
|---|---|
| Entry criteria | Inclusion thresholds (e.g., PHQ-9 ≥10) |
| Node definition | Criteria element or cluster |
| Branch logic | Boolean expressions over criteria |
| Exit conditions | Confirmed diagnosis, deferred (insufficient info), or rule-out |
| Required documentation | Exclusions (medical/substance), comorbidities, specifiers |
| Audit fields | Timestamps, user ID, version of criteria set |

### Ruling Out Medical/Substance Causes

Before assigning primary psychiatric diagnoses, rule out etiologies related to medical conditions, medications, or substances. This is explicitly noted in PHQ/GAD algorithm caveats (e.g., panic and other anxiety disorder diagnoses require exclusion of physical disorders, medication, or other drugs as biological causes; depressive diagnoses require exclusion of bereavement, bipolar history, and organic causes)[^25]. Capture these as structured EVALUATIONs or problem list entries with active status and resolution notes to support audit and care coordination.

---

## Integration Patterns for Clinical Applications

Behavioral health data live at the intersection of structured assessments, narrative documentation, orders, and diagnostics. The most successful implementations weave measures into intake, triage, and follow-up, with results routed to clinicians at the right time, in the right format, and with appropriate guardrails. EHR vendors can integrate screening tools and outcome measures as routine components of care, and evidence shows that effective EMR implementation in mental health settings relies on tailored templates, clear workflows, and robust training[^12][^13].

![Proposed FHIR data flow for BH screening and diagnosis](assets/images/fhir_us_bh_profile_overview.png)

Model design with openEHR and FHIR:
- In openEHR, model patient-reported assessments as OBSERVATION (with protocol and state as needed) and diagnoses/risk assessments as EVALUATION; treatment plans as INSTRUCTION/ACTION. Archetypes and templates provide the semantic backbone and versioning governance[^32][^33].
- In FHIR, represent screening instruments with Questionnaire and QuestionnaireResponse; severity scores with Observation; and diagnoses with Condition. The US Behavioral Health Profiles IG and +BH-to-FHIR mappings provide concrete data elements to profile, with validation in local EHR FHIR endpoints[^34][^35].

Table 15. openEHR/FHIR mapping for assessments and diagnoses

| Clinical artifact | openEHR class/type | FHIR resource/profile |
|---|---|---|
| PHQ-9 questionnaire | OBSERVATION (protocol for instrument) | Questionnaire; QuestionnaireResponse |
| PHQ-9 score | OBSERVATION | Observation (component-coded score) |
| Diagnostic statement | EVALUATION | Condition |
| Risk assessment (suicide) | EVALUATION | Observation (risk score), extension |
| Treatment plan | INSTRUCTION/ACTION | CarePlan; ServiceRequest (as applicable) |

### Assessment Data Modeling (openEHR and FHIR)

The openEHR EHR Information Model specifies OBSERVATION for assessments and EVALUATION for diagnoses, risk, and plans. The OBSERVATION protocol records instrument details; state captures context (e.g., medication status) necessary for interpretation. FHIR’s Questionnaire and QuestionnaireResponse provide the analogous model for responses, with Observation used for computed scores and Condition for diagnoses. For BH, adopt the US Behavioral Health Profiles IG and crosswalks to align local elements with national profiles and data exchange expectations[^32][^34][^35].

Table 16. Element-level mapping (illustrative)

| Field | openEHR archetype element | FHIR element |
|---|---|---|
| Instrument name/version | OBSERVATION.protocol.details | Questionnaire.version; QuestionnaireResponse.questionnaire |
| Item response | OBSERVATION.data (EVENT[n].data) | QuestionnaireResponse.item.answer |
| Total score | OBSERVATION.data (EVENT[n].data) | Observation.value[x]; Observation.component |
| Diagnosis | EVALUATION.data | Condition.code |
| Specifiers | EVALUATION.data (archetyped) | Condition.extension |
| Risk level | EVALUATION.data | Observation.value[x] (risk scale) |

### Embedding Decision Support

Clinical decision support (CDS) must be transparent and auditable, with clinician-in-the-loop control. General CDS literature emphasizes benefits (better decisions, reduced errors) and risks (alert fatigue, unsafe overrides). A data-constrained mental health CDSS architecture highlights modularity and explicit rules; human factors research identifies HCI elements that improve CDS effectiveness (e.g., clear rationale, actionable recommendations, and limited concurrent alerts)[^36][^37][^38]. Embed triage scoring (PHQ-9/GAD-7) in context—showing criteria rationale, severity, and recommended actions—and provide one-click access to the full diagnostic framework (e.g., differential diagnosis apps) when needed[^7][^8].

Table 17. CDS intervention matrix (illustrative)

| Trigger | Information type | Recommendation | Safeguards |
|---|---|---|---|
| PHQ-9 ≥15 | Severity + criteria summary | Active treatment; consider referral | Require clinician acknowledgment; show risk steps |
| GAD-7 ≥10 | Severity + anxiety resources | Treatment planning; follow-up | Limit to one primary alert; suppress duplicates |
| PHQ-9 item 9 positive | Risk alert | Immediate safety assessment protocol | Escalation banner; audit trail for actions taken |

### EHR Workflows and Adoption

Effective integration aligns assessments with clinical roles and clinic schedules. Triage nurses can administer screeners during rooming; clinicians review scores and trends in the chart; periodic reassessments populate outcome dashboards. Evidence from mental health EMR implementations emphasizes the need for tailored templates, training, and attention to information flow to avoid workflow disruption[^12][^13]. Table 18 maps a sample workflow.

Table 18. Workflow mapping

| Stage | Responsible role | System action | Output |
|---|---|---|---|
| Intake | Triage nurse | Launch PHQ-2/GAD-2; escalate if ≥3 | QuestionnaireResponse; baseline |
| Clinician review | Psychiatrist/therapist | Review scores; choose actions | Treatment plan; Condition (if applicable) |
| Follow-up | Care manager | Administer PHQ-9/GAD-7 | Trend graphs; alerts if thresholds breached |
| Coding/billing | Coder | Map to ICD-10-CM via DSM-5-TR Classification | Claims-ready diagnosis codes |

### Regulatory and Compliance

Psychiatry EHR FAQs underscore alignment with billing, documentation, and privacy obligations. For U.S. organizations, HIPAA privacy and security rules apply, with added state law considerations. International implementations may require GDPR and local data protection compliance. The APA updates and WHO ICD implementation guidance inform process controls for annual updates and coding transitions[^12][^16].

Table 19. Compliance checklist (high level)

| Area | Control |
|---|---|
| Privacy | Minimum necessary, consent where required, role-based access |
| Security | Encryption in transit/at rest, audit logs, access reviews |
| Consent | Document consent for screening and data sharing as required |
| Auditability | Versioned criteria, rules, and code sets; change logs |
| Update cadence | Scheduled DSM-5-TR and coding updates; regression tests |

---

## JavaScript Libraries, Open Datasets, and Tools

A modern digital mental health stack benefits from open-source survey tooling, visualization libraries, and carefully curated datasets. Public-domain measures and open datasets can accelerate development and research while preserving legal and ethical standards.

- SurveyJS is a robust, open-source form library for building accessible, dynamic surveys in JavaScript. It supports rendering JSON-defined surveys, branching logic, and custom validation—ideal for PHQ-9/GAD-7 digital deployment[^39].
- jsPsych is a JavaScript framework for browser-based behavioral experiments and assessments, suitable for research or highly controlled digital phenotyping[^26].
- The Health figures library supports health data visualization, including charts that can summarize PHQ-9/GAD-7 trends and symptom trajectories for clinicians and patients[^27].
- Open datasets (e.g., a multi-modal dataset for mental-disorder analysis combining EEG and spoken language) can support algorithmic exploration; curated lists (e.g., Kaggle’s mental health datasets) can seed development, with caution about data quality and representativeness[^41][^40].

Table 20. Library capability matrix

| Library | Primary functions | Integration pattern | Licensing (verify locally) |
|---|---|---|---|
| SurveyJS | Form/survey rendering, branching, validation | Embed as React/Angular/Vue component; submit JSON to backend | Open-source; confirm repository license[^39] |
| jsPsych | Experiment authoring, timing, stimuli control | Use for research-grade tasks; export data to FHIR/Observation | Open-source; check repository license[^26] |
| Health figures | Visualization (charts, timelines) | Integrate into dashboards; consume score arrays | Open-source; confirm terms[^27] |

Table 21. Datasets directory (selected)

| Dataset | Modality | Access | Intended use | Limitations |
|---|---|---|---|---|
| Multi-modal mental-disorder dataset (Nature Sci Data) | EEG + spoken language | Open access via journal page | Algorithmic exploration of multimodal signals | Clinical generalization requires caution; limited labels[^41] |
| Kaggle mental health datasets | Mixed (surveys, social media, synthetic) | Curated list | Prototyping and model testing | Variable quality; privacy/Ethics review required[^40] |

### Survey and Form Building (SurveyJS)

SurveyJS is well-suited for deploying PHQ-9/GAD-7 with accessibility and internationalization. Design patterns include:
- JSON-defined surveys with item-level scoring functions.
- Client-side validation and branching (PHQ-2/GAD-2 → escalate).
- Post-submission conversion to QuestionnaireResponse and Observation resources.

Table 22. Component mapping (SurveyJS to clinical artifact)

| SurveyJS element | Clinical mapping |
|---|---|
| Page/survey definition | Questionnaire |
| Question | Questionnaire.item |
| Answer option | Questionnaire.item.answerOption |
| Computed total | Observation.value (with component details) |

### Behavioral Experiments (jsPsych)

Use jsPsych when precise timing, stimuli control, or experimental paradigms are required (e.g., cognitive tasks, neurobehavioral phenotyping). Data export to Observation (FHIR) or OBSERVATION (openEHR) enables alignment with clinical repositories[^26].

Table 23. Task flow blueprint (illustrative)

| Stimulus | Response | Timing | Output |
|---|---|---|---|
| Instruction screen | Start trial | 2s | Metadata log |
| Task prompt | Keypress/touch | Configurable window | Raw trial data |
| Feedback | None | 500ms | Summary metrics |

### Visualization and Dashboards (Health Figures)

Health figures supports interactive visualizations that convey longitudinal symptom change. For example, plotting PHQ-9 and GAD-7 scores over time can surface deterioration or treatment response in ways that are immediately actionable to clinicians and patients[^27].

![Illustrative visualization blueprint for longitudinal symptom scores](assets/images/health_figures_chart.png)

### Open Datasets and Ethical Use

Open datasets are powerful but must be used responsibly. Screen for consent, de-identification rigor, and representativeness. Document model limits; avoid operational use without clinical validation. Acknowledge community contributions and comply with dataset licenses[^40][^41].

Table 24. Dataset evaluation rubric

| Criterion | Questions to ask |
|---|---|
| Consent and ethics | Was consent obtained? Are data de-identified? |
| Representation | Does the sample match your clinical population? |
| Label quality | Are diagnoses/labels reliable and current? |
| License | What are the usage restrictions? |
| Bias | What is the risk of harmful bias or misuse? |

---

## Implementation Roadmap, Governance, and Maintenance

A robust implementation balances technical precision with clinical safety. The roadmap below provides a pragmatic sequence from design to operations, with roles and responsibilities.

Table 25. Roadmap with roles, artifacts, and success criteria

| Phase | Key activities | Responsible roles | Artifacts | Success criteria |
|---|---|---|---|---|
| Discovery | Stakeholder alignment; scope selection; licensing review | Clinical lead, PM, Legal | Requirements, licensing summary | Scope approved; risks logged |
| Data modeling | Map measures to openEHR/FHIR; create templates/profiles | Informatician, Interop lead | Archetypes/templates; FHIR profiles | Test cases pass; crosswalk complete |
| UX | Design accessible UIs; embed CDS rationale | UX, Clinician reviewers | Screen flows, alerts spec | SUS/CES targets met; low cognitive load |
| Security/compliance | HIPAA/GDPR review; audit logging | Security, Compliance | Control matrix, audit plan | External/Internal audit passed |
| Validation | Clinical validation; coding accuracy; rule regression | Clinicians, Coders, QA | Test scripts; UAT sign-offs | No critical defects; code mappings accurate |
| Rollout | Training, support; change management | Ops, Training | SOPs; training decks | Adoption metrics met; low alert fatigue |
| Maintenance | DSM-5-TR update watch; ICD transitions | Governance board | Release notes; change logs | Timely updates; minimal disruption |

### Team and Governance

Form a DSM-5-TR update board comprising clinical informatics, security, and engineering representation. Define a cadence to review APA supplements, ICD updates, and EHR vendor notices. Version clinical content and rules; maintain an audit trail of changes, including rationale and testing evidence[^12].

### Technical Integration Checklist

- Integrate measures via FHIR Questionnaire/QuestionnaireResponse and Observation; use US Behavioral Health Profiles IG where feasible[^34][^35].
- Model longitudinal assessments in openEHR (OBSERVATION) and diagnoses (EVALUATION); manage archetypes/templates under change control[^32][^33].
- Embed CDS transparently with human factors safeguards; monitor alert burden and clinician satisfaction[^38][^37].
- Ensure secure capture and storage with role-based access, encryption, and detailed audit logging[^12].

Table 26. Integration checklist (summary)

| Area | Control |
|---|---|
| Interoperability | FHIR profiles implemented; IG conformance |
| openEHR | Archetypes/templates versioned |
| CDS | Rationale visible; alerts limited; overrides audited |
| Security | RBAC; encryption; audit logs |
| Testing | Unit/integration/regression/UAT |
| Rollout | Training; SOPs; support model |

### Clinical Validation and Quality Assurance

Validate scoring logic, severity thresholds, and treatment-action mappings. For example, map PHQ-9 severity bands to local care pathways and ensure clinicians are informed of the advisory nature of algorithmic outputs. Conduct coder alignment sessions to confirm ICD-10-CM mappings using DSM-5-TR Classification and payer edits[^25][^30].

Table 27. QA plan overview

| Dimension | Test |
|---|---|
| Scoring accuracy | Unit tests for PHQ-9/GAD-7; boundary values |
| CDS logic | Scenario tests for thresholds, risk flags |
| Clinician review | Chart review; blind diagnosis comparison |
| Coding alignment | Double-blind coding with reference crosswalk |
| Alert burden | Monitor alert frequency; clinician feedback loops |

### Maintenance: Updates and Transition Management

Subscribe to APA’s DSM-5-TR updates and WHO ICD implementation notices. Establish an annual release slot aligned with APA’s September cadence, plus ad hoc updates for coding corrections. Track ICD-11 readiness, including crosswalk strategies and training plans[^2][^16].

Table 28. Update cadence tracker

| Source | Frequency | Owner | Next review |
|---|---|---|---|
| APA DSM-5-TR updates | Annual (Sept) | Clinical informaticist | TBD |
| ICD-10-CM updates | Annual | Coding lead | TBD |
| ICD-11 transition | As per WHO/agency | Gov’t affairs/IT | TBD |
| EHR vendor notices | Quarterly | Interop lead | TBD |

---

## Appendices

### A. Acronyms and Definitions
- APA: American Psychiatric Association.
- DSM-5-TR: Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition, Text Revision.
- ICD-10-CM/ICD-11: International Classification of Diseases, 10th Revision Clinical Modification / 11th Revision.
- FHIR: Fast Healthcare Interoperability Resources.
- openEHR: Open EHR standard for health information modeling.
- CDS: Clinical Decision Support.
- IG: Implementation Guide (FHIR).

### B. Sample Data Models (Narrative)
- FHIR: Questionnaire (instrument definition) + QuestionnaireResponse (patient answers) + Observation (total and item scores) + Condition (diagnosis with specifiers).
- openEHR: OBSERVATION for instrument responses and scores; EVALUATION for diagnoses, risk assessments; INSTRUCTION/ACTION for plans.

### C. Quick Links
- PHQ and GAD instructions (public domain).
- APA DSM-5-TR Online Assessment Measures catalog.
- APA DSM-5-TR Updates page and supplements.
- openEHR EHR Information Model.

---

## References

[^1]: American Psychiatric Association. About DSM-5-TR. https://www.psychiatry.org/psychiatrists/practice/dsm/about-dsm  
[^2]: American Psychiatric Association. Updates to DSM-5-TR Criteria and Text. https://www.psychiatry.org/psychiatrists/practice/dsm/updates-to-dsm/updates-to-dsm-5-tr-criteria-text  
[^3]: Ward MJ, et al. DSM‐5‐TR: overview of what's new and what's changed. https://pmc.ncbi.nlm.nih.gov/articles/PMC9077590/  
[^4]: American Psychiatric Association. DSM-5-TR Update: September 2024 (PDF). https://www.psychiatry.org/getmedia/2ed086b0-ec88-42ec-aa0e-f442e4af74e6/APA-DSM5TR-Update-September-2024.pdf  
[^5]: American Psychiatric Association. Highlights of Changes from DSM-IV-TR to DSM-5 (PDF). https://www.psychiatry.org/File%20Library/Psychiatrists/Practice/DSM/APA_DSM_Changes_from_DSM-IV-TR_-to_DSM-5.pdf  
[^6]: American Psychiatric Association. DSM-5-TR Update, September 2025 (PDF). https://www.psychiatry.org/getmedia/b68a5776-f88c-45c7-9535-fd219d7aa5cb/APA-DSM5TR-Update-September-2025.pdf  
[^7]: Unbound Medicine. DSM-5-TR Differential Diagnosis app announcement. https://www.unboundmedicine.com/news/Unbound_Medicine_Launches_DSM-5-TR  
[^8]: American Psychiatric Association. DSM-5-TR Handbook of Differential Diagnosis. https://www.appi.org/Products/DSM-Library/DSM-5-TR-Handbook-of-Differential-Diagnosis  
[^9]: American Psychiatric Association. APA Publishing Mobile Apps (DSM-5 tools). https://www.appi.org/apps  
[^10]: American Psychiatric Association. DSM-5-TR Online Assessment Measures. https://www.psychiatry.org/psychiatrists/practice/dsm/educational-resources/assessment-measures  
[^11]: Joint Commission. Behavioral Healthcare Instruments Listing. https://manual.jointcommission.org/BHCInstruments/WebHome  
[^12]: American Psychiatric Association. EHR: Frequently Asked Questions. https://www.psychiatry.org/psychiatrists/practice/practice-management/health-information-technology/ehr-faq  
[^13]: JMIR Mental Health. Implementation of Electronic Medical Records in Mental Health Settings. https://mental.jmir.org/2021/9/e30564  
[^14]: NIH PMC. Impact of Electronic Health Records on Information Practices in Mental Health Care. https://pmc.ncbi.nlm.nih.gov/articles/PMC9118021/  
[^15]: NIH PMC. Integrating clinical research into electronic health record workflows during COVID-19. https://pmc.ncbi.nlm.nih.gov/articles/PMC11095974/  
[^16]: World Health Organization. ICD-11 Implementation: FAQ. https://www.who.int/standards/classifications/frequently-asked-questions/icd-11-implementation  
[^17]: World Health Organization. International Classification of Diseases (ICD). https://www.who.int/standards/classifications/classification-of-diseases  
[^18]: NIH PMC. An organization- and category-level comparison of ICD-11 CDDG and DSM-5. https://pmc.ncbi.nlm.nih.gov/articles/PMC7801846/  
[^19]: Journal of the American Academy of Psychiatry and the Law. Three Approaches to Understanding and Classifying Mental Disorder. https://journals.sagepub.com/doi/10.1177/1529100617727266  
[^20]: CMS. ICD-10-CM Official Guidelines for Coding and Reporting FY 2022. https://www.cms.gov/files/document/fy-2022-icd-10-cm-coding-guidelines-updated-02012022.pdf  
[^21]: RevMaxx. ICD-11 Coding Guidelines 2025. https://www.revmaxx.co/blog/icd-11-coding/  
[^22]: NIH PMC. The Patient Health Questionnaire Anxiety and Depression Scale (GAD-7) validation. https://pmc.ncbi.nlm.nih.gov/articles/PMC4927366/  
[^23]: Journal of Affective Disorders. The case for abbreviated versions of PHQ-9, GAD-7 and WSAS. https://www.sciencedirect.com/science/article/pii/S0165032724020767  
[^24]: MDPI. Two-Step Screening for Depression and Anxiety in Patients with Cancer. https://www.mdpi.com/1718-7729/31/11/481  
[^25]: PHQ and GAD-7 Instructions Manual (public domain). https://archive.thepcc.org/sites/default/files/resources/instructions.pdf  
[^26]: jsPsych: JavaScript library for behavioral experiments (GitHub). https://github.com/jspsych/jsPsych  
[^27]: NIH PMC. Health figures: an open source JavaScript library for health data visualization. https://pmc.ncbi.nlm.nih.gov/articles/PMC4802654/  
[^28]: Frontiers in Psychiatry. Psychometric evaluation and community norms of the PHQ-9 (2024). https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2024.1483782/pdf  
[^29]: Nature Scientific Reports. A feasibility study of distress screening with psychometric evaluation (2025). https://www.nature.com/articles/s41598-025-94538-5  
[^30]: American Psychiatric Association. DSM-5-TR Classification (ICD-10-CM listings). https://www.appi.org/Products/DSM-Library/DSM-5-TR-Classification  
[^31]: Nirmitee. Building Mental Health Platforms with openEHR. https://nirmitee.io/blog/building-mental-health-platform-openehr/  
[^32]: openEHR. EHR Information Model (Reference Model). https://specifications.openehr.org/releases/RM/development/ehr.html  
[^33]: openEHR Clinical Knowledge Manager (Archetype Repository). https://www.openehr.org/ckm  
[^34]: HL7 FHIR. US Behavioral Health Profiles Implementation Guide. https://build.fhir.org/ig/HL7/us-behavioral-health-profiles/  
[^35]: USCDI+ Behavioral Health to FHIR Profiles (Crosswalk). https://www.fhir.org/guides/astp/bhp/bh_to_fhir_profiles.html  
[^36]: Nature Digital Medicine. An overview of clinical decision support systems: benefits, risks, and success factors. https://www.nature.com/articles/s41746-020-0221-y  
[^37]: CEUR-WS. A Data-constrained Clinical Decision Support System for Mental Health. https://ceur-ws.org/Vol-4055/icaiw_waai_2.pdf  
[^38]: JMIR Human Factors. Optimizing Clinical Decision Support System Functionality by Human Factors (2025). https://humanfactors.jmir.org/2025/1/e69333  
[^39]: SurveyJS: JavaScript Libraries for Surveys and Forms. https://surveyjs.io/  
[^40]: Kaggle. Mental Health Datasets. https://www.kaggle.com/datasets?tags=4171-Mental+Health  
[^41]: Nature Scientific Data. A multi-modal open dataset for mental-disorder analysis. https://www.nature.com/articles/s41597-022-01211-x  
[^42]: Unbound Medicine. DSM-5 App launched by Unbound Medicine and APA. https://www.unboundmedicine.com/news/dsm-5_american_psychiatric_association_apple_watch