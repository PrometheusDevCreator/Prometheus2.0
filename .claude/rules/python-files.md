> **Status**: ACTIVE
> **Scope**: Prometheus PCGS 2.0
> **Governance**: Per CLAUDE_PROTOCOL.md

---

# Python Development Rules
**Applies to**: `*.py` files in `core/`, `orchestrator/`

## Standards
- Type hints on all function signatures
- Docstrings for public functions (Google style)
- `black` formatting assumed (line length 88)
- Import ordering: stdlib, third-party, local (use `isort`)

## Patterns
```python
# Function signature pattern
def function_name(param: Type, optional: Type | None = None) -> ReturnType:
    """Brief description.

    Args:
        param: Description.
        optional: Description. Defaults to None.

    Returns:
        Description of return value.

    Raises:
        ExceptionType: When condition.
    """
    pass

# Class pattern
class ClassName:
    """Brief description."""

    def __init__(self, param: Type) -> None:
        self.param = param
```

## Virtual Environments
- Check for `.venv` or `venv` before installing packages
- Prefer `requirements.txt` or `pyproject.toml`

## Testing
- Tests in `tests/` or alongside modules as `*_test.py`
- Use `pytest` unless project uses `unittest`
- Run `pytest -x` to stop on first failure when debugging
- Per Prometheus Testing Doctrine: MTs during implementation, ITs at phase end

## Prometheus-Specific
- API routes in `core/api/`
- PKE engine in `core/pke/` (placeholder)
- Orchestrator agents in `orchestrator/agents/`
- Course models in `core/models/course.py`
