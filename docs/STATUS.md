# Prometheus System Status

> **AUTHORITATIVE STATUS FILE**
>
> This is the **single source of truth** for Prometheus project status.
> AI assistants should update this file at the end of each significant session.

**Last Updated:** 2025-12-30
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
| **prometheus-ui** | STABLE | 2025-12-30 | React frontend functional |
| **Login page** | COMPLETE | 2025-12-15 | Click-to-login implemented |
| **Navigate page** | COMPLETE | 2025-12-15 | NavWheel navigation working |
| **Define page** | UPDATED | 2025-12-30 | Wheel layout refined, Module Name removed |
| **Design - Overview** | ENHANCED | 2025-12-30 | Rotational wheels, resizable blocks, timetable bars |
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
| 2025-12-30 | CC | Define page wheel refinements, Design page Overview enhancements |
| 2025-12-29 | CC | Rotational wheels, resizable OVERVIEW blocks, TIMETABLE reference bars |
| 2025-12-21 | CC | Documentation overhaul: TODO.md, IDEAS.md, STATUS.md restructured |
| 2025-12-18 | CC | Grid system implementation and verification |
| 2025-12-17 | CC | UI_DOCTRINE v2.1, PLAYWRIGHT_CONFIG v1.2 - 1890×940 baseline |

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

- Define page wheel layout restructured to 2 rows (Level/Content/Seniority + Modules/Duration/Semesters)
- Module Name dropdown removed from Define - to be relocated to Design page (location TBC)
- Semester/Terms now toggle via single wheel with swap button
- Design page OVERVIEW tab has rotational wheels and resizable blocks
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
