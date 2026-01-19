> **Status**: Reference / Non-authoritative
> **Execution**: NOT PERMITTED
> **Scope**: Claude Code optimisation concepts only
> **Does not override**: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine

---

# TypeScript & React Development Rules
**Applies to**: `*.ts`, `*.tsx`, `*.js`, `*.jsx` files

## Standards
- TypeScript preferred over JavaScript
- Functional components with hooks (no class components)
- Explicit return types on exported functions
- Strict mode assumed (`"strict": true` in tsconfig)

## Component Pattern
```tsx
interface ComponentProps {
  title: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function Component({ title, onAction, children }: ComponentProps) {
  const [state, setState] = useState<StateType>(initialValue);

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
```

## Styling
- Tailwind CSS preferred (check for `tailwind.config.*`)
- CSS Modules as fallback (`*.module.css`)
- CSS variables for theming
- **No emoji icons** — use text labels or SVG

## Next.js Specifics
- App Router patterns (`app/` directory)
- Server Components by default
- `'use client'` directive only when needed
- API routes in `app/api/`

## Testing
- Co-locate tests: `Component.tsx` → `Component.test.tsx`
- React Testing Library preferred
- Mock external dependencies
