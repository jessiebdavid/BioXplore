"""YAML lexicon loader.

Loads every lexicon ONCE at import/config time (no file I/O at request time).
Files live next to this package; loading is cached at module import, which is
the only global state besides immutable config.
"""
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

_LEXICON_DIR = Path(__file__).resolve().parent

_FILES = (
    "astronomy.yaml",
    "biology.yaml",
    "tamil.yaml",
    "synonyms.yaml",
    "input_type_patterns.yaml",
    "intent_patterns.yaml",
    "dimension_rules.yaml",
)


def _load_one(name: str) -> dict[str, Any]:
    path = _LEXICON_DIR / name
    with path.open("r", encoding="utf-8") as fh:
        data = yaml.safe_load(fh)
    if not isinstance(data, dict):
        raise RuntimeError(f"lexicon {name} must contain a mapping at top level")
    return data


@lru_cache(maxsize=1)
def load_lexicons() -> dict[str, dict[str, Any]]:
    """Load and cache all lexicon files. Returns {filename_stem: data}."""
    out: dict[str, dict[str, Any]] = {}
    for name in _FILES:
        out[name.removesuffix(".yaml")] = _load_one(name)
    return out


def get_lexicon(name: str) -> dict[str, Any]:
    """Return one lexicon by stem, e.g. get_lexicon('astronomy')."""
    return load_lexicons()[name]
