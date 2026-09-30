"""M3 Intent: first-match from intent_patterns.yaml.

kinds: contains_any with optional 'regexes' list (case-insensitive search).
Order in the YAML file IS the priority; first match wins.
"""
import re
from typing import Any

import structlog

from app.contracts import Intent
from app.lexicons import get_lexicon
from app.utils.text import contains_any

logger = structlog.get_logger(__name__)


def _match(pattern: dict[str, Any], text: str) -> bool:
    params: dict[str, Any] = pattern.get("params", {})
    low = text.casefold()

    if contains_any(low, params.get("terms", [])):
        return True
    for rx in params.get("regexes", []):
        if re.search(rx, low, re.IGNORECASE):
            return True
    return False


def classify_intent(text: str) -> Intent:
    """Return the first matching intent; default is 'define'."""
    for pattern in get_lexicon("intent_patterns")["patterns"]:
        if _match(pattern, text):
            intent = Intent(pattern["intent"])
            logger.info("m3_result", intent=intent.value, rule=pattern["intent"])
            return intent
    logger.info("m3_result", intent=Intent.DEFINE.value, rule="default")
    return Intent.DEFINE
