> **Status**: Reference / Non-authoritative
> **Execution**: NOT PERMITTED
> **Scope**: Claude Code optimisation concepts only
> **Does not override**: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine

---

# Single-File HTML Dashboard Rules
**Applies to**: `*.html` files (especially dashboards/tools)

## Architecture Pattern
```
┌─────────────────────────────────────┐
│ <!DOCTYPE html>                     │
│ <html>                              │
│   <head>                            │
│     <meta charset + viewport>       │
│     <title>                         │
│     <style>                         │
│       :root { CSS variables }       │
│       /* All styles inline */       │
│     </style>                        │
│   </head>                           │
│   <body>                            │
│     <!-- Login Screen -->           │
│     <!-- Main Dashboard -->         │
│     <script>                        │
│       // All JS inline              │
│     </script>                       │
│   </body>                           │
│ </html>                             │
└─────────────────────────────────────┘
```

## CSS Structure
```css
:root {
    /* Rabdan Academy palette (when appropriate) */
    --navy: #1A2F4F;
    --navy-dark: #0F1D2F;
    --gold: #C9A961;
    --gold-light: #E5D4A8;
    --white: #FFFFFF;
    --bg: #F7F8FA;
    --text: #2C3E50;
    --text-muted: #6B7C8F;

    /* Typography */
    --font-display: 'Font Name', serif;
    --font-body: 'Font Name', sans-serif;
}
```

## Required Features
- **Login screen** with role selection (client/admin if applicable)
- **Role-based views** — show/hide content based on user type
- **Present mode** — enlarged view for stakeholder presentations
- **Export functionality** — CSV/Excel via SheetJS when data tables exist
- **Responsive** — mobile-first, test at 768px breakpoint

## Prohibited
- **No emoji icons** — use text labels, Unicode symbols, or inline SVG
- No external dependencies unless essential (prefer CDN for Chart.js, SheetJS)
- No framework boilerplate (no React unless specifically needed)

## Common Libraries (CDN)
```html
<!-- Charts -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Excel Export -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## JavaScript Pattern
```javascript
// State management
const state = {
    currentUser: null,
    currentView: 'login',
    data: []
};

// View switching
function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewName).classList.add('active');
    state.currentView = viewName;
}

// Login handler
function handleLogin(role) {
    state.currentUser = { role };
    showView('dashboard');
    renderDashboard();
}
```
