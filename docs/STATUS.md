# Prometheus System Status

> **AUTHORITATIVE STATUS FILE**
>
> This is the **single source of truth** for Prometheus project status.
> AI assistants should update this file at the end of each significant session.

**Last Updated:** 2025-12-21
**Last Session By:** Claude Code (CC)

---

## Quick Summary

- **UI:** Stable and complete for current pages (Login, Navigate, Define, Design)
- **Backend:** Scaffolded only - API structure exists but not connected
- **PKE Engine:** Placeholder - not yet implemented
- **Documentation:** Overhauled 2025-12-21 - now properly structured

---

## Component Status

| Component | State | Last Change | Notes |
|-----------|-------|-------------|-------|
| **prometheus-ui** | STABLE | 2025-12-18 | React frontend functional |
| **Login page** | COMPLETE | 2025-12-15 | Click-to-login implemented |
| **Navigate page** | COMPLETE | 2025-12-15 | NavWheel navigation working |
| **Define page** | LOCKED | 2025-12-13 | 100% specification achieved |
| **Design - Overview** | FUNCTIONAL | 2025-12-15 | Timetable grid, lesson bubbles |
| **Design - Scalar** | FUNCTIONAL | 2025-12-15 | Manager/Viewer tabs, 3-column hierarchy |
| **Build page** | PLACEHOLDER | - | Footer integrated only |
| **Format page** | PLACEHOLDER | - | Footer integrated only |
| **Generate page** | PLACEHOLDER | - | Footer integrated only |
| **core/api** | SCAFFOLDED | - | FastAPI structure, not connected |
| **core/pke** | PLACEHOLDER | - | Not implemented |
| **orchestrator** | SCAFFOLDED | - | Agent adapters defined |

---

## Implementation Baseline

| Parameter | Value |
|-----------|-------|
| Usable Viewport | 1890 × 940 |
| Display Reference | 1920 × 1080 @ 100% scale |
| Grid Origin | Centre (945, 470) |
| Coordinate System | Centre-origin Cartesian |

*See UI_DOCTRINE.md and PLAYWRIGHT_CONFIG.md for full specifications.*

---

## Recent Changes (Last 5 Sessions)

| Date | Session | Key Changes |
|------|---------|-------------|
| 2025-12-21 | CC | Documentation overhaul: TODO.md, IDEAS.md, STATUS.md restructured, GRID_REFERENCE.md aligned |
| 2025-12-18 | CC | Grid system implementation and verification |
| 2025-12-17 | CC | UI_DOCTRINE v2.1, PLAYWRIGHT_CONFIG v1.2 - 1890×940 baseline |
| 2025-12-15 | CC | DESIGN tab fix, LO verb fix, responsive font scaling |
| 2025-12-13 | CC | Define.jsx locked at 100% specification |

---

## Known Blockers

None currently.

---

## Technical Debt

| Item | Location | Priority |
|------|----------|----------|
| Deprecated files retained | `src/deprecated/` | LOW |
| Backend not connected | `core/api/` | HIGH |
| PKE not implemented | `core/pke/` | HIGH |
| Content Type storage missing | `Define.jsx` | MEDIUM |

---

## Session Handoff Notes

*Important context for the next session:*

- UI is stable and should NOT be modified without explicit request
- Documentation structure now includes TODO.md and IDEAS.md
- All baseline references aligned to 1890×940 viewport
- Founder wants AI assistants to be immediately up to speed on session start

---

## Related Documents

- [TODO.md](TODO.md) - Active task backlog
- [IDEAS.md](IDEAS.md) - Strategic ideas parking lot
- [../CLAUDE.md](../CLAUDE.md) - AI entry point and project context
- [../UI_DOCTRINE.md](../UI_DOCTRINE.md) - Immutable UI frame definitions
- [../CLAUDE_PROTOCOL.md](../CLAUDE_PROTOCOL.md) - Task execution protocol

---

*This file is the authoritative status source. Historical snapshots are in `docs/briefs/`.*
