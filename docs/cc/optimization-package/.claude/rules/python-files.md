> **Status**: Reference / Non-authoritative
> **Execution**: NOT PERMITTED
> **Scope**: Claude Code optimisation concepts only
> **Does not override**: /CLAUDE.md, /CLAUDE_PROTOCOL.md, project doctrine

---

# Python Development Rules
**Applies to**: `*.py` files

## Standards
- Type hints on all function signatures
- Docstrings for public functions (Google style)
- `black` formatting assumed (line length 88)
- Import ordering: stdlib → third-party → local (use `isort`)

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
- Use `pip install --break-system-packages` only if explicitly told
- Prefer `requirements.txt` or `pyproject.toml`

## Testing
- Tests in `tests/` or alongside modules as `*_test.py`
- Use `pytest` unless project uses `unittest`
- Run `pytest -x` to stop on first failure when debugging
