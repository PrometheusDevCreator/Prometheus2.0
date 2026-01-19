# M5 Task Order Proposal: State Integrity Guardrails

**Date:** 2025-01-19
**Author:** Claude Code (CC)
**Status:** PROPOSED — Awaiting Founder Approval
**Prerequisite:** M4.5 COMPLETE

---

## 1. Objective

Implement defensive guardrails to prevent future state corruption, bypass of canonical model, and accidental introduction of dual-write paths.

---

## 2. Scope

### 2.1 Mutation Surface Audit

**Goal:** Document all state mutation entry points in the codebase.

**Deliverables:**
- `docs/diagnostics/mutation-surface-audit.md` — Complete inventory of:
  - All `setCanonicalData` call sites (expected: canonical writes)
  - All `setScalarData` call sites (expected: guarded or module-only)
  - All `setTimetableData` call sites
  - All `setLessonsData` call sites
  - Classification: CANONICAL | LEGACY_GUARDED | MODULE_ONLY | UNSAFE

**Acceptance Criteria:**
- 100% coverage of mutation paths
- Each path classified with justification
- No UNSAFE paths remain

### 2.2 Bypass Prevention

**Goal:** Add runtime assertions that detect non-canonical writes.

**Deliverables:**
- Add development-mode assertions to DesignContext.jsx:
  ```javascript
  // M5: Bypass detection
  if (process.env.NODE_ENV === 'development' && CANONICAL_FLAGS.LEGACY_STORE_REMOVED) {
    if (/* scalar write detected without canonical flag */) {
      console.error('[M5_BYPASS_VIOLATION] Direct scalar write detected')
    }
  }
  ```
- Add eslint rule or grep check to CI (optional):
  - Pattern: `setScalarData(` not preceded by LEGACY guard

**Acceptance Criteria:**
- Console warnings in dev mode for any bypass attempt
- No false positives on legitimate module operations

### 2.3 Dev-Mode Tripwires

**Goal:** Add visual and console indicators when state integrity may be compromised.

**Deliverables:**
- Add DEBUG_MODE flag to canonicalAdapter.js:
  ```javascript
  export const DEBUG_FLAGS = {
    VERBOSE_CANONICAL_LOGS: process.env.NODE_ENV === 'development',
    TRIPWIRE_ON_MISMATCH: true,  // Alert if derived != expected
    SHOW_STATE_BADGE: true       // Optional: UI indicator in dev
  }
  ```
- Implement mismatch detection:
  - Compare derived scalar data with expected shape
  - Log warning if mismatch detected
- Optional: StatusBar badge showing "CANONICAL ACTIVE" in dev mode

**Acceptance Criteria:**
- Tripwires fire on actual mismatches (tested)
- No production overhead (dev-only code paths)

### 2.4 Behavioural Contract Seed Docs

**Goal:** Create seed documentation for expected state behaviour contracts.

**Deliverables:**
- `docs/contracts/CANONICAL_WRITE_CONTRACT.md`:
  - Lists all functions that MUST write to canonical
  - Lists prohibited write patterns
  - Provides example violations and fixes

- `docs/contracts/DERIVATION_CONTRACT.md`:
  - Documents derivation function inputs/outputs
  - Lists invariants that must hold
  - Provides test cases for verification

- `docs/contracts/STATE_SHAPE_CONTRACT.md`:
  - Documents expected shape of canonicalData
  - Documents expected shape of derivedScalarData
  - Documents expected shape of effectiveScalarData

**Acceptance Criteria:**
- Contracts are actionable (not just descriptive)
- Contracts include testable assertions
- Contracts reference specific code locations

---

## 3. Implementation Phases

| Phase | Task | Effort | Dependencies |
|-------|------|--------|--------------|
| M5.1 | Mutation Surface Audit | 2h | None |
| M5.2 | Bypass Prevention (dev assertions) | 1h | M5.1 |
| M5.3 | Dev-Mode Tripwires | 1h | M5.2 |
| M5.4 | Behavioural Contract Seed Docs | 2h | M5.1-M5.3 |

**Total Estimated Effort:** 6 hours

---

## 4. Success Criteria for M5

| Criterion | Verification |
|-----------|--------------|
| Mutation surface fully documented | Audit doc complete with 100% coverage |
| Bypass detection works | Test: Attempt scalar-only write, see console warning |
| Tripwires functional | Test: Inject mismatch, see tripwire fire |
| Contracts established | 3 contract docs created with testable assertions |
| No regressions | Existing tests pass, UI functional |

---

## 5. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| False positive tripwires | Medium | Medium | Tune detection thresholds, exclude known edge cases |
| Performance overhead | Low | Low | Dev-only code paths, no production impact |
| Incomplete audit | Low | High | Use grep + manual review, cross-reference with state-map.md |

---

## 6. Recommendations

1. **Execute M5.1 first** — The mutation surface audit informs all subsequent phases
2. **Consider CI integration** — Future M6 could add automated checks
3. **Link to Testing Doctrine** — Contract docs should reference MT/IT requirements

---

## 7. STOP POINT: M5

Upon completion of all M5 phases:
- Document deliverables in M5_GATE_TEST_LOG.md
- Update STATUS.md with M5 completion
- STOP for Founder review before proceeding to M6

---

*Prepared by Claude Code (CC) — 2025-01-19*
