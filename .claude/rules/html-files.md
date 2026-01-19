> **Status**: ACTIVE
> **Scope**: Prometheus PCGS 2.0
> **Governance**: Per CLAUDE_PROTOCOL.md

---

# Single-File HTML Dashboard Rules
**Applies to**: `*.html` files (especially dashboards/tools)

## Architecture Pattern
```
<!DOCTYPE html>
<html>
  <head>
    <meta charset + viewport>
    <title>
    <style>
      :root { CSS variables }
      /* All styles inline */
    </style>
  </head>
  <body>
    <!-- Login Screen -->
    <!-- Main Dashboard -->
    <script>
      // All JS inline
    </script>
  </body>
</html>
```

## CSS Structure (Prometheus palette)
```css
:root {
    /* Prometheus palette */
    --bg-dark: #0d0d0d;
    --panel-bg: #1a1a1a;
    --text-primary: #f2f2f2;
    --text-muted: #767171;
    --accent-green: #00FF00;
    --accent-orange: #FF6600;
    --pke-gold: #BF9000;

    /* Typography */
    --font-primary: Candara, Calibri, sans-serif;
    --font-mono: Cascadia Code, monospace;
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
