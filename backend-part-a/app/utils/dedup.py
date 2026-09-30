"""De-duplication helpers (pure functions, no state)."""
from typing import Any, Hashable


def dedupe_strings(items: list[str]) -> list[str]:
    """Order-preserving de-duplication of strings."""
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out


def dedupe_by_key(items: list[Any], key_fn: Any) -> list[Any]:
    """Order-preserving de-dup by key_fn(item); unhashable keys fall back to repr."""
    seen: set[Hashable] = set()
    out: list[Any] = []
    for item in items:
        try:
            key = key_fn(item)
            if not isinstance(key, Hashable):  # pragma: no cover - defensive
                key = repr(key)
        except TypeError:
            key = repr(item)
        if key not in seen:
            seen.add(key)
            out.append(item)
    return out
