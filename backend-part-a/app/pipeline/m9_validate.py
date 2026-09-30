"""M9 Validate: post-retrieval validation of a RetrievalResult.

Rules (per spec):
- Drop any item without evidence_label (add warning).
- Drop any Tamil item whose source lacks text_name or verse_number.
- Block 'proves'/'proved'/'scientifically proven' wording when a Tamil source
  is cited -> replace with neutral phrasing + warning.
- Force HYPOTHESIS/INTERPRETATION/ANALOGY labels on speculation.
- Add standing warning for any Tamil->science relationship:
  'Conceptual relationships are not scientific evidence.'
- Never invent data. Empty retrieval -> not_found populated, not an error.
"""
import re

import structlog

from app.contracts import (
    Dimension,
    Domain,
    EvidenceLabel,
    Relationship,
    RetrievalItem,
    RetrievalResult,
    Source,
)

logger = structlog.get_logger(__name__)

BLOCKED_WORDS = ("proves", "proved", "scientifically proven")
NEUTRAL_REPLACEMENTS = {
    "scientifically proven": "indicated by current interpretations",
    "proves": "suggests",
    "proved": "is suggested by",
}
SPECULATIVE_HINTS = ("hypothetical", "speculation", "speculative", "what if",
                     "imagined", "analogous", "could be", "might be",
                     "conjecture", "not yet observed", "may")
_FORCED_LABELS = (EvidenceLabel.HYPOTHESIS, EvidenceLabel.INTERPRETATION,
                  EvidenceLabel.ANALOGY)
STANDING_TAMIL_SCIENCE_WARNING = (
    "Conceptual relationships are not scientific evidence."
)
_SCIENCE_DOMAINS = {Domain.ASTRONOMY, Domain.BIOLOGY}


def _is_tamil_item(item: RetrievalItem, entity_domains: set[Domain]) -> bool:
    """An item is Tamil when it touches the tamil domain (source text or 1D verse)."""
    if item.source is not None and item.source.text_name:
        return True
    return Dimension.D1 in {item.dimension} and bool(entity_domains & {Domain.TAMIL})


def _neutralize_prove_wording(content: str) -> tuple[str, bool]:
    """Replace blocked wording; returns (new_content, changed)."""
    changed = False
    out = content
    low = out.casefold()
    # Longest-first so 'scientifically proven' is replaced before 'proved'.
    for phrase in sorted(NEUTRAL_REPLACEMENTS, key=len, reverse=True):
        if phrase in low:
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)
            out = pattern.sub(NEUTRAL_REPLACEMENTS[phrase], out)
            low = out.casefold()
            changed = True
    return out, changed


def _force_speculative_label(item: RetrievalItem) -> RetrievalItem:
    """If content reads as speculation but label is FACT/EVIDENCE, downgrade."""
    if item.evidence_label in _FORCED_LABELS:
        return item
    low = item.content.casefold()
    if any(h in low for h in SPECULATIVE_HINTS):
        return item.model_copy(update={"evidence_label": EvidenceLabel.HYPOTHESIS})
    return item


def _is_tamil_science_relationship(
    rel: Relationship, entity_domains: set[Domain]
) -> bool:
    tamil_side = Domain.TAMIL in entity_domains
    science_side = bool(entity_domains & _SCIENCE_DOMAINS)
    if not (tamil_side and science_side):
        return False
    # Heuristic: relationship touches Tamil literary entities on one side.
    tamil_markers = ("thirukkural", "tholkappiyam", "thirumandiram", "purananuru",
                     "akananuru", "natrinai", "kuruntokai", "silappathikaram",
                     "manimekalai", "verse", "kural", "avvaiyar")
    pair = f"{rel.source_entity} {rel.target_entity}".casefold()
    if any(m in pair for m in tamil_markers):
        return True
    return rel.is_conceptual


def validate_result(
    result: RetrievalResult, entity_domains: set[Domain]
) -> tuple[RetrievalResult, list[str]]:
    """Validate/repair a RetrievalResult. Returns (result, new_warnings)."""
    warnings: list[str] = list(result.warnings)
    kept_items: list[RetrievalItem] = []

    for item in result.items:
        # 1. Missing evidence_label -> drop with warning.
        if item.evidence_label is None:
            warnings.append(
                f"Dropped item without evidence_label: {item.content[:60]!r}"
            )
            logger.warning("m9_dropped_item", reason="missing_evidence_label")
            continue

        # 2. Tamil item requires complete source identification.
        if _is_tamil_item(item, entity_domains):
            src = item.source
            if src is None or not src.text_name or src.verse_number is None:
                warnings.append(
                    "Dropped Tamil item missing source text_name or verse_number: "
                    f"{item.content[:60]!r}"
                )
                logger.warning("m9_dropped_item", reason="tamil_source_incomplete")
                continue

        # 3. Block 'proves' wording with Tamil sources.
        content = item.content
        if _is_tamil_item(item, entity_domains):
            content, changed = _neutralize_prove_wording(content)
            if changed:
                warnings.append(
                    "Neutralized causal wording ('proves'/'proved') in item citing "
                    "a Tamil source."
                )

        # 4. Force speculative labels.
        updated = _force_speculative_label(
            item.model_copy(update={"content": content})
        )
        kept_items.append(updated)

    # 5. Tamil->science standing warning.
    for rel in result.relationships:
        if _is_tamil_science_relationship(rel, entity_domains):
            if STANDING_TAMIL_SCIENCE_WARNING not in warnings:
                warnings.append(STANDING_TAMIL_SCIENCE_WARNING)

    validated = result.model_copy(update={"items": kept_items, "warnings": warnings})
    logger.info("m9_result", items_in=len(result.items), items_out=len(kept_items),
                warnings=len(warnings))
    return validated, warnings
