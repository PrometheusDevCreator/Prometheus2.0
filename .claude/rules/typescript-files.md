> **Status**: ACTIVE
> **Scope**: Prometheus PCGS 2.0
> **Governance**: Per CLAUDE_PROTOCOL.md

---

# TypeScript & React Development Rules
**Applies to**: `*.ts`, `*.tsx`, `*.js`, `*.jsx` files in `prometheus-ui/`

## Standards
- JavaScript with JSX (not TypeScript) for Prometheus UI
- Functional components with hooks (no class components)
- Vite as build tool
- Tailwind CSS for styling

## Component Pattern
```jsx
// Prometheus component pattern
function Component({ title, onAction, children }) {
  const [state, setState] = useState(initialValue);

  const handleClick = useCallback(() => {
    // handler logic
    onAction?.();
  }, [onAction]);

  return (
    <div className="component">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default Component;
```

## Styling
- Tailwind CSS is primary (check `tailwind.config.js`)
- CSS variables defined in `src/index.css`
- **No emoji icons** — use text labels or SVG
- Follow design system from `/CLAUDE.md`

## Design System (from CLAUDE.md)
- Background: `#0d0d0d`
- Panel background: `#1a1a1a`
- Text primary: `#f2f2f2`
- Text muted: `#767171`
- Accent green: `#00FF00`
- Accent orange: `#FF6600`
- Button gradient: `#D65700 → #763000`

## UI Doctrine (MANDATORY)
- Viewport: 1890 x 940 usable
- Immutable frames defined in `/UI_DOCTRINE.md`
- Do NOT modify doctrinal elements without Founder approval

## Testing
- Co-locate tests: `Component.jsx` → `Component.test.jsx`
- Vitest for unit tests
- Playwright for E2E (see `/PLAYWRIGHT_CONFIG.md`)
- Per Prometheus Testing Doctrine: MTs during implementation, ITs at phase end
