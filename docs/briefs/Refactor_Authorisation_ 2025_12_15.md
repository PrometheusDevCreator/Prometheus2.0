Suggested save path: docs/briefs/UI_Architecture_Refactor_Authorisation_2025-12-15.md


# Prometheus 2.0  
## UI Architecture Refactor — Authorisation Record

**Date:** 2025-12-15  
**System:** Prometheus 2.0  
**Area:** Frontend UI Architecture  
**Classification:** Architectural Change (Controlled)  
**Status:** Approved with Constraints  

---

## 1. Background

The Prometheus 2.0 UI currently employs a fixed-stage (1920×1080) scaling model using CSS transforms to fit varying viewport sizes.  
While this approach ensured early mockup fidelity and accelerated initial development, it has introduced usability and responsiveness limitations on common laptop and non-16:9 displays.

Engineering review confirmed that these issues are architectural in nature and cannot be fully resolved through incremental or cosmetic adjustments.

---

## 2. Problem Statement

Observed issues include:

- Text and UI elements scaling down excessively on laptop viewports  
- CSS media queries and responsive typography being negated by global transform scaling  
- Inefficient use of screen real estate on non-matching aspect ratios  

**Risk of inaction:**  
Continued development atop the existing architecture will increase technical debt and raise the cost and risk of future remediation.

---

## 3. Proposed Change

A controlled refactor to remove the fixed-stage scaling architecture and transition to a responsive, viewport-relative layout model, while preserving the **exact visual appearance and functionality** at the 1920×1080 design baseline.

Key characteristics:

- No functionality regressions permitted  
- Visual parity at 1920×1080 is mandatory  
- Responsiveness improvements are acceptable only where system identity is preserved  

This change is classified as a **doctrinal migration**, not a cosmetic enhancement.

---

## 4. Review and Decision

The proposal was reviewed at Controller (Architectural Authority) level.

**Decision:**  
✅ **Approved with Constraints**

Approval is granted subject to the following conditions:

- Execution must be incremental, with single-axis changes only  
- No compound commits; each change must be independently reviewable  
- Rollback time must remain under 10 minutes at all stages  
- Screenshot-based visual comparison is the primary verification method  
- All doctrinal UI elements are treated as immutable anchors  

---

## 5. Doctrinal Constraints

The following UI elements may not be altered without pause and re-approval:

- Top frame proportions and alignment  
- Bottom navigation band position and rhythm  
- PKE interface lozenge size and spatial relationship  
- NavWheel centre-of-gravity  
- Define page field spacing and visual cadence  

Any deviation at the 1920×1080 baseline constitutes a stop condition.

---

## 6. Documentation & Governance

- Updates to `UI_DOCTRINE.md` (pixel → relative-unit conversion) are authorised contingent on exact visual equivalence  
- Changes remain subject to Founder override  
- Progress and completion should be recorded via the Prometheus Chronicle System  

---

## 7. Status

- Engineering authorised to proceed under controlled execution  
- Screenshot mapping enhancements acknowledged as a risk-reduction measure  
- Ongoing architectural oversight required until refactor completion  

---
(on Founder directive)


----------

Optional: logs/chronicle-2025.jsonl

{
  "timestamp": "2025-12-15T14:30:00Z",
  "id": "evt-20251215-143000-01",
  "category": "decision",
  "subtype": "ui_architecture_refactor_authorised",
  "actor": "sarah",
  "summary": "Authorised controlled refactor of Prometheus 2.0 UI scaling architecture to resolve responsiveness limitations.",
  "details": {
    "modules_touched": ["prometheus-ui"],
    "agents_involved": ["Sarah", "Claude", "Claude Code"],
    "decision_basis": "Architectural review identified fixed-stage scaling as root cause of usability degradation; inaction risk exceeded refactor risk.",
    "related_tasks": ["TECHNICAL_BRIEF_UI_Architecture_Refactor_2025-12-15"],
    "notes": "Approval granted with strict constraints: incremental execution, full visual parity at 1920x1080, rollback <10 minutes, doctrinal UI anchors immutable."
  }
}
